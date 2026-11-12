import axios from 'axios';

const ANILIST_API = 'https://graphql.anilist.co';
const KITSU_API = 'https://kitsu.io/api/edge/manga';
const MANGAUPDATES_API = 'https://api.mangaupdates.com/v1/series';
const MANGADEX_API = 'https://api.mangadex.org/manga';

// Cache resolved covers: mangadexId -> { poster_path, backdrop_path, timestamp, ttl }
const mangaCoverCache = new Map();
const HIT_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours when found
const MISS_CACHE_TTL = 15 * 60 * 1000;    // 15 min when not found

const CJK_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'vol', 'manga', 'comic']);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Map Search.jsx MangaDex tag UUIDs / demographics to AniList genre names for hybrid backfill
const MD_GENRE_TO_ANILIST = {
  '391b0423-d847-456f-aff0-8b0cfc03066b': 'Action',
  '87cc87cd-a395-47af-b27a-93258283bbc6': 'Adventure',
  '4d32cc48-9f00-4cca-9b5a-a839f0764984': 'Comedy',
  '423e2eae-a7a2-4a8b-ac03-a8351462d71d': 'Romance',
  'cdc58593-87dd-415e-bbc0-2ec27bf404cc': 'Fantasy',
  'b9af3a63-f058-46de-a9a0-e0c13906197a': 'Drama',
  '256c8bd9-4904-4360-bf4f-508a76d67183': 'Sci-Fi',
  'eabc5b4c-6aff-42f3-b657-3e90cbd00b75': 'Supernatural',
  '2d1f5d56-a1e5-4d0d-a961-29734e194866': 'Ecchi',
  'ee968100-4191-4968-93d3-f82d72be7e46': 'Mystery',
  'cdad7e68-1419-41dd-bdce-27753074a640': 'Horror',
  '3b60b75c-a2d7-4860-ab56-05f391bb889c': 'Psychological',
  'e5301a23-ebd9-49dd-a0cb-2add944c7fe9': 'Slice of Life',
  '50880a9d-5440-4732-9afb-8f457127e836': 'Mecha',
  '69964a64-2f90-4d33-beeb-f3ed2875eb4c': 'Sports',
  'a1f53773-c69a-4ce5-8cab-fffcd90b1565': 'Fantasy'
};

/**
 * Validates that a candidate cover image URL is browser-loadable and not a known broken
 * anti-bot URL (uploads.mangadex.org) or generic grey placeholder silhouette (/default.jpg).
 */
export const isValidCoverUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean) return false;
  if (clean.includes('uploads.mangadex.org')) return false;
  if (/\/default\.(jpg|jpeg|png|webp)(\?|$)/i.test(clean)) return false;
  if (/(no[_-]?image|missing[_-]?(image|cover|poster)|placeholder)/i.test(clean)) return false;
  return true;
};

const normalizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u306f]/g, '')
    .toLowerCase()
    .trim();
};

const extractTitleTokens = (str) => {
  const norm = normalizeText(str);
  if (!norm) return { cjk: '', words: [] };
  const cjk = (norm.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]+/g) || []).join('');
  const words = norm
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w));
  return { cjk, words };
};

export const titlesRoughlyMatch = (candidateList, targetTitles) => {
  const validTargets = (targetTitles || []).filter(Boolean);
  if (validTargets.length === 0) return false;

  for (const cand of candidateList) {
    if (!cand) continue;
    const normCand = normalizeText(cand);
    if (!normCand) continue;
    const candTok = extractTitleTokens(cand);

    for (const tgt of validTargets) {
      const normTgt = normalizeText(tgt);
      if (!normTgt) continue;
      if (normCand === normTgt) return true;

      // Require comparable length when checking containment to avoid 1-word false matches like "Reader" inside long titles
      const minStrLen = Math.min(normCand.length, normTgt.length);
      const maxStrLen = Math.max(normCand.length, normTgt.length);
      if (
        minStrLen >= 5 &&
        minStrLen / maxStrLen >= 0.55 &&
        (normCand.includes(normTgt) || normTgt.includes(normCand))
      ) {
        return true;
      }

      const tgtTok = extractTitleTokens(tgt);
      if (candTok.cjk && tgtTok.cjk) {
        const minCjk = Math.min(candTok.cjk.length, tgtTok.cjk.length);
        const maxCjk = Math.max(candTok.cjk.length, tgtTok.cjk.length);
        if (
          minCjk >= 2 &&
          minCjk / maxCjk >= 0.5 &&
          (candTok.cjk.includes(tgtTok.cjk) || tgtTok.cjk.includes(candTok.cjk))
        ) {
          return true;
        }
      }

      if (candTok.words.length > 0 && tgtTok.words.length > 0) {
        const tgtSet = new Set(tgtTok.words);
        const common = candTok.words.filter((w) => tgtSet.has(w));
        const minLen = Math.min(candTok.words.length, tgtTok.words.length);
        const maxLen = Math.max(candTok.words.length, tgtTok.words.length);
        if (common.length >= 2 && common.length / minLen >= 0.5) return true;
        if (minLen === 1 && maxLen <= 2 && common.length === 1 && common[0].length >= 4) return true;
      }
    }
  }
  return false;
};

export const collectMangaTitleCandidates = (m) => {
  const seen = new Set();
  const ordered = [];
  const push = (val) => {
    if (!val || typeof val !== 'string') return;
    const clean = val.trim();
    if (!clean || seen.has(clean.toLowerCase())) return;
    seen.add(clean.toLowerCase());
    ordered.push(clean);
  };

  const titles = m?.attributes?.title || {};
  push(titles.en);
  Object.values(titles).forEach(push);

  const alts = m?.attributes?.altTitles || [];
  // Prioritize CJK and English altTitles for high-precision metadata matching
  alts.forEach((a) => {
    if (!a || typeof a !== 'object') return;
    if (a.en) push(a.en);
    Object.values(a).forEach((v) => {
      if (CJK_REGEX.test(String(v))) push(v);
    });
  });
  alts.forEach((a) => {
    if (a && typeof a === 'object') {
      Object.values(a).forEach(push);
    }
  });

  return ordered;
};

const pickPrimaryMangaTitle = (m) => {
  const titles = m?.attributes?.title || {};
  if (titles.en && titles.en.trim()) return titles.en.trim();
  const firstTitle = Object.values(titles).find((v) => v && String(v).trim());
  if (firstTitle) return String(firstTitle).trim();
  const enAlt = (m?.attributes?.altTitles || []).find((a) => a && a.en)?.en;
  return enAlt ? enAlt.trim() : 'Unknown Manga';
};

const chunkArray = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

/**
 * Resolves browser-accessible cover & backdrop URLs for a list of raw MangaDex objects.
 * Avoids `uploads.mangadex.org` (which gates browser requests with a bot challenge 403)
 * by mapping `links.al`, `links.mal`, `links.kt`, `links.mu`, and verified title fallbacks
 * through AniList (s4.anilist.co), Kitsu (media.kitsu.app), and MangaUpdates (cdn.mangaupdates.com).
 *
 * @param {Array} rawMangaList
 * @returns {Promise<Map<string, { poster_path: string | null, backdrop_path: string | null }>>}
 */
export const resolveMangaCovers = async (rawMangaList = []) => {
  const coverMap = new Map();
  if (!Array.isArray(rawMangaList) || rawMangaList.length === 0) return coverMap;

  const now = Date.now();
  const uncachedById = new Map();

  for (const m of rawMangaList) {
    if (!m || !m.id) continue;
    const cached = mangaCoverCache.get(m.id);
    if (cached && now - cached.timestamp < cached.ttl) {
      coverMap.set(m.id, {
        poster_path: isValidCoverUrl(cached.poster_path) ? cached.poster_path : null,
        backdrop_path: isValidCoverUrl(cached.backdrop_path) ? cached.backdrop_path : null
      });
    } else if (!uncachedById.has(m.id)) {
      uncachedById.set(m.id, m);
    }
  }

  if (uncachedById.size === 0) return coverMap;

  const unresolved = Array.from(uncachedById.values());
  const stillMissing = new Map(unresolved.map((m) => [m.id, m]));

  const setResolved = (id, poster, backdrop = null) => {
    if (!isValidCoverUrl(poster)) return false;
    const cleanBackdrop = isValidCoverUrl(backdrop) ? backdrop : poster;
    const entry = {
      poster_path: poster,
      backdrop_path: cleanBackdrop
    };
    coverMap.set(id, entry);
    mangaCoverCache.set(id, { ...entry, timestamp: Date.now(), ttl: HIT_CACHE_TTL });
    stillMissing.delete(id);
    return true;
  };

  // ── Tier 1: Batch AniList GraphQL by MangaDex `links.al` and `links.mal` ──
  try {
    const alIdToManga = new Map();
    const malIdToManga = new Map();

    for (const m of stillMissing.values()) {
      const links = m.attributes?.links || {};
      const alId = links.al && /^\d+$/.test(String(links.al)) ? parseInt(links.al, 10) : null;
      const malId = links.mal && /^\d+$/.test(String(links.mal)) ? parseInt(links.mal, 10) : null;

      if (alId) {
        if (!alIdToManga.has(alId)) alIdToManga.set(alId, []);
        alIdToManga.get(alId).push(m.id);
      }
      if (malId) {
        if (!malIdToManga.has(malId)) malIdToManga.set(malId, []);
        malIdToManga.get(malId).push(m.id);
      }
    }

    const alChunks = chunkArray(Array.from(alIdToManga.keys()), 50);
    const malChunks = chunkArray(Array.from(malIdToManga.keys()), 50);
    const maxBatches = Math.max(alChunks.length, malChunks.length);

    for (let i = 0; i < maxBatches; i++) {
      const alBatch = alChunks[i] || [];
      const malBatch = malChunks[i] || [];
      if (alBatch.length === 0 && malBatch.length === 0) continue;

      const varDefs = [];
      const fields = [];
      const variables = {};

      if (alBatch.length > 0) {
        varDefs.push('$alIds: [Int]');
        fields.push('byAl: Page(page: 1, perPage: 50) { media(id_in: $alIds, type: MANGA) { id idMal coverImage { extraLarge large } bannerImage } }');
        variables.alIds = alBatch;
      }
      if (malBatch.length > 0) {
        varDefs.push('$malIds: [Int]');
        fields.push('byMal: Page(page: 1, perPage: 50) { media(idMal_in: $malIds, type: MANGA) { id idMal coverImage { extraLarge large } bannerImage } }');
        variables.malIds = malBatch;
      }

      const query = `query (${varDefs.join(', ')}) { ${fields.join(' ')} }`;
      const res = await axios.post(
        ANILIST_API,
        { query, variables },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5500, validateStatus: (s) => s < 500 }
      );

      const byAl = res.data?.data?.byAl?.media || [];
      for (const media of byAl) {
        const poster = media?.coverImage?.extraLarge || media?.coverImage?.large || null;
        if (!isValidCoverUrl(poster)) continue;
        const matchedIds = alIdToManga.get(media.id) || [];
        matchedIds.forEach((mdId) => setResolved(mdId, poster, media.bannerImage || poster));
      }

      const byMal = res.data?.data?.byMal?.media || [];
      for (const media of byMal) {
        const poster = media?.coverImage?.extraLarge || media?.coverImage?.large || null;
        if (!isValidCoverUrl(poster)) continue;
        const matchedIds = malIdToManga.get(media.idMal) || [];
        matchedIds.forEach((mdId) => {
          if (stillMissing.has(mdId)) {
            setResolved(mdId, poster, media.bannerImage || poster);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[MangaCovers] Tier 1 AniList ID batch lookup failed:', err.message);
  }

  // ── Tier 2: Batch Kitsu REST API by numeric `links.kt` ──
  if (stillMissing.size > 0) {
    try {
      const ktIdToManga = new Map();
      for (const m of stillMissing.values()) {
        const kt = m.attributes?.links?.kt;
        if (kt && /^\d+$/.test(String(kt))) {
          if (!ktIdToManga.has(String(kt))) ktIdToManga.set(String(kt), []);
          ktIdToManga.get(String(kt)).push(m.id);
        }
      }

      const ktChunks = chunkArray(Array.from(ktIdToManga.keys()), 20);
      for (const chunk of ktChunks) {
        const ktRes = await axios.get(`${KITSU_API}?filter[id]=${chunk.join(',')}&page[limit]=20`, {
          timeout: 4500,
          validateStatus: (s) => s < 500
        });
        for (const item of ktRes.data?.data || []) {
          const pi = item.attributes?.posterImage || {};
          const poster = pi.large || pi.medium || pi.small || pi.original || null;
          if (!isValidCoverUrl(poster)) continue;
          const backdrop = item.attributes?.coverImage?.large || item.attributes?.coverImage?.original || poster;
          (ktIdToManga.get(String(item.id)) || []).forEach((mdId) => {
            if (stillMissing.has(mdId)) setResolved(mdId, poster, backdrop);
          });
        }
      }
    } catch (err) {
      console.warn('[MangaCovers] Tier 2 Kitsu ID lookup failed:', err.message);
    }
  }

  // ── Tier 3: MangaUpdates API by `links.mu` (exact series ID) ──
  if (stillMissing.size > 0) {
    const muTargets = [];
    for (const m of stillMissing.values()) {
      const mu = m.attributes?.links?.mu;
      if (!mu) continue;
      const raw = String(mu).trim();
      let numericId = null;
      if (/^\d+$/.test(raw) && parseInt(raw, 10) < 500000) {
        numericId = parseInt(raw, 10);
      } else if (/^[0-9a-z]+$/i.test(raw)) {
        const parsed = parseInt(raw, 36);
        if (Number.isFinite(parsed) && parsed > 0) numericId = parsed;
      }
      if (numericId) muTargets.push({ mdId: m.id, muId: numericId });
    }

    if (muTargets.length > 0) {
      await Promise.all(
        muTargets.slice(0, 16).map(async ({ mdId, muId }) => {
          try {
            const muRes = await axios.get(`${MANGAUPDATES_API}/${muId}`, { timeout: 3500 });
            const poster = muRes.data?.image?.url?.original || muRes.data?.image?.url?.thumb || null;
            if (isValidCoverUrl(poster)) setResolved(mdId, poster, poster);
          } catch {
            // Skip failed single MangaUpdates fetch
          }
        })
      );
    }
  }

  // ── Tier 4: Multi-Provider Title Search (AniList Batch -> Kitsu Text -> MangaUpdates Search) ──
  if (stillMissing.size > 0) {
    const isSingleDetailLookup = unresolved.length === 1;
    const remainingList = Array.from(stillMissing.values()).slice(0, 24);

    // 4A. Batched AniList GraphQL aliased search (Page perPage: 3 never 404s on empty matches)
    try {
      const searchRequests = [];
      remainingList.forEach((m) => {
        const cands = collectMangaTitleCandidates(m);
        const picks = [];
        if (cands[0]) picks.push(cands[0]);
        const cjkCand = cands.find((c) => c !== cands[0] && CJK_REGEX.test(c));
        if (cjkCand) picks.push(cjkCand);
        else if (cands[1]) picks.push(cands[1]);

        if (isSingleDetailLookup) {
          const altLatin = cands.find((c) => !picks.includes(c) && !CJK_REGEX.test(c));
          if (altLatin) picks.push(altLatin);
        }

        picks.forEach((term) => {
          searchRequests.push({ alias: `s_${searchRequests.length}`, mdId: m.id, cands, term });
        });
      });

      for (const batch of chunkArray(searchRequests, 16)) {
        const varDefs = batch.map((_, idx) => `$q${idx}: String`).join(', ');
        const bodyFields = batch
          .map((req, idx) => `${req.alias}: Page(page: 1, perPage: 3) { media(search: $q${idx}, type: MANGA) { id title { english romaji native } synonyms coverImage { extraLarge large } bannerImage } }`)
          .join(' ');
        const variables = {};
        batch.forEach((req, idx) => {
          variables[`q${idx}`] = req.term;
        });

        const alRes = await axios.post(
          ANILIST_API,
          { query: `query (${varDefs}) { ${bodyFields} }`, variables },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5500,
            validateStatus: (s) => s < 500
          }
        );
        const payload = alRes.data?.data || {};
        for (const req of batch) {
          if (!stillMissing.has(req.mdId)) continue;
          const nodes = payload[req.alias]?.media || [];
          for (const node of nodes) {
            const poster = node?.coverImage?.extraLarge || node?.coverImage?.large || null;
            if (!isValidCoverUrl(poster)) continue;
            const alTitles = [
              node.title?.english,
              node.title?.romaji,
              node.title?.native,
              ...(node.synonyms || [])
            ];
            if (titlesRoughlyMatch(req.cands, alTitles)) {
              setResolved(req.mdId, poster, node.bannerImage || poster);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[MangaCovers] Tier 4A AniList title search failed:', err.message);
    }

    // 4B. Kitsu text search fallback
    if (stillMissing.size > 0) {
      const kitFallbackList = Array.from(stillMissing.values()).slice(0, 14);
      await Promise.all(
        kitFallbackList.map(async (m) => {
          if (!stillMissing.has(m.id)) return;
          const cands = collectMangaTitleCandidates(m);
          const queryTerm = cands[0];
          if (!queryTerm) return;
          try {
            const kRes = await axios.get(
              `${KITSU_API}?filter[text]=${encodeURIComponent(queryTerm)}&page[limit]=3`,
              { timeout: 3800, validateStatus: (s) => s < 500 }
            );
            for (const entry of kRes.data?.data || []) {
              const pi = entry.attributes?.posterImage || {};
              const poster = pi.large || pi.medium || pi.small || pi.original || null;
              if (!isValidCoverUrl(poster)) continue;
              const kTitles = [
                entry.attributes?.canonicalTitle,
                ...Object.values(entry.attributes?.titles || {}),
                ...(entry.attributes?.abbreviatedTitles || [])
              ];
              if (titlesRoughlyMatch(cands, kTitles)) {
                const backdrop = entry.attributes?.coverImage?.large || poster;
                setResolved(m.id, poster, backdrop);
                break;
              }
            }
          } catch {
            // Skip single Kitsu fallback failure
          }
        })
      );
    }

    // 4C. MangaUpdates Series Search fallback (catches unlinked titles such as "Tank Knight Portriss")
    if (stillMissing.size > 0) {
      const muSearchList = Array.from(stillMissing.values()).slice(0, 14);
      await Promise.all(
        muSearchList.map(async (m) => {
          if (!stillMissing.has(m.id)) return;
          const cands = collectMangaTitleCandidates(m);
          const queryTerm = cands[0];
          if (!queryTerm) return;
          try {
            const muRes = await axios.post(
              `${MANGAUPDATES_API}/search`,
              { search: queryTerm, perpage: 5 },
              { timeout: 4000, validateStatus: (s) => s < 500 }
            );
            for (const hit of muRes.data?.results || []) {
              const rec = hit?.record;
              if (!rec) continue;
              const poster = rec.image?.url?.original || rec.image?.url?.thumb || null;
              if (!isValidCoverUrl(poster)) continue;
              if (titlesRoughlyMatch(cands, [rec.title])) {
                setResolved(m.id, poster, poster);
                break;
              }
            }
          } catch {
            // Skip single MangaUpdates search failure
          }
        })
      );
    }
  }

  // Record null for genuine misses (short TTL so transient failures recover quickly)
  for (const m of stillMissing.values()) {
    const emptyEntry = { poster_path: null, backdrop_path: null };
    coverMap.set(m.id, emptyEntry);
    mangaCoverCache.set(m.id, { ...emptyEntry, timestamp: Date.now(), ttl: MISS_CACHE_TTL });
  }

  return coverMap;
};

/**
 * Formats an array of MangaDex manga entities with verified browser-safe cover URLs.
 */
export const formatMangaDexItems = async (rawMangaList = [], { dateMode = 'created' } = {}) => {
  if (!Array.isArray(rawMangaList) || rawMangaList.length === 0) return [];
  const covers = await resolveMangaCovers(rawMangaList);

  return rawMangaList.map((m) => {
    const resolved = covers.get(m.id) || { poster_path: null, backdrop_path: null };
    const title = pickPrimaryMangaTitle(m);
    const overview = m.attributes?.description?.en || 'No description available.';

    let releaseDate = '';
    if (dateMode === 'latest') {
      releaseDate = m.attributes?.updatedAt || m.attributes?.createdAt || null;
    } else if (dateMode === 'year') {
      releaseDate = m.attributes?.year?.toString() || m.attributes?.createdAt?.split('T')[0] || '';
    } else {
      releaseDate = m.attributes?.createdAt || '';
    }

    return {
      id: m.id,
      title,
      overview,
      poster_path: isValidCoverUrl(resolved.poster_path) ? resolved.poster_path : null,
      backdrop_path: isValidCoverUrl(resolved.backdrop_path) ? resolved.backdrop_path : null,
      release_date: releaseDate,
      vote_average: dateMode === 'year' ? null : 8.0,
      media_type: 'manga'
    };
  });
};

/**
 * Queries AniList MANGA catalog directly with guaranteed real non-default cover images.
 * Used for upcoming manga releases and for backfilling filtered/search feeds when
 * unindexed MangaDex stubs omit external covers.
 */
export const queryAniListMangaCatalog = async ({
  sort = 'POPULARITY_DESC',
  status = null,
  search = null,
  genre = null,
  year = null,
  page = 1,
  perPage = 24
} = {}) => {
  try {
    const varDefs = ['$page: Int', '$perPage: Int', '$sort: [MediaSort]'];
    const mediaArgs = ['type: MANGA', 'isAdult: false', 'sort: $sort'];
    const variables = {
      page,
      perPage,
      sort: Array.isArray(sort) ? sort : [sort]
    };

    if (search && String(search).trim()) {
      varDefs.push('$search: String');
      mediaArgs.push('search: $search');
      variables.search = String(search).trim();
    }
    if (status) {
      varDefs.push('$status: MediaStatus');
      mediaArgs.push('status: $status');
      variables.status = status;
    }
    if (genre && !String(genre).startsWith('d_')) {
      const mappedGenre = MD_GENRE_TO_ANILIST[genre] || (UUID_REGEX.test(genre) ? null : genre);
      if (mappedGenre) {
        varDefs.push('$genre: String');
        mediaArgs.push('genre: $genre');
        variables.genre = mappedGenre;
      }
    } else if (genre && String(genre).startsWith('d_')) {
      const demoTagMap = { d_shounen: 'Shounen', d_seinen: 'Seinen', d_shoujo: 'Shoujo', d_josei: 'Josei' };
      const demoTag = demoTagMap[genre];
      if (demoTag) {
        varDefs.push('$tag: String');
        mediaArgs.push('tag: $tag');
        variables.tag = demoTag;
      }
    }
    if (year && !isNaN(parseInt(year, 10))) {
      varDefs.push('$yearLike: String');
      mediaArgs.push('startDate_like: $yearLike');
      variables.yearLike = `${parseInt(year, 10)}%`;
    }

    const gql = `
      query (${varDefs.join(', ')}) {
        Page(page: $page, perPage: $perPage) {
          media(${mediaArgs.join(', ')}) {
            id
            title { english romaji native }
            description(asHtml: false)
            coverImage { extraLarge large }
            bannerImage
            averageScore
            startDate { year month day }
          }
        }
      }
    `;

    const res = await axios.post(
      ANILIST_API,
      { query: gql, variables },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5500,
        validateStatus: (s) => s < 500
      }
    );

    const nodes = res.data?.data?.Page?.media || [];
    const results = [];
    for (const m of nodes) {
      const poster = m?.coverImage?.extraLarge || m?.coverImage?.large || null;
      if (!isValidCoverUrl(poster)) continue;
      const backdrop = isValidCoverUrl(m.bannerImage) ? m.bannerImage : poster;
      const releaseDate = m.startDate?.year
        ? `${m.startDate.year}-${String(m.startDate.month || 1).padStart(2, '0')}-${String(m.startDate.day || 1).padStart(2, '0')}`
        : '';

      results.push({
        id: String(m.id),
        title: m.title?.english || m.title?.romaji || m.title?.native || 'Manga',
        overview: m.description ? m.description.replace(/<[^>]*>/g, '') : 'No description available.',
        poster_path: poster,
        backdrop_path: backdrop,
        release_date: releaseDate,
        vote_average: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.0,
        media_type: 'manga'
      });
    }
    return results;
  } catch (err) {
    console.warn('[MangaCovers] AniList catalog query failed:', err.message);
    return [];
  }
};

/**
 * Queries MangaDex + resolves browser-safe covers across all tiers, ensuring every returned
 * manga card has a real cover image by filtering unindexed coverless stubs and seamlessly
 * merging/backfilling from AniList MANGA when needed (especially for Upcoming Releases).
 */
export const fetchMangaFeedWithCovers = async ({
  query = '',
  mode = 'latest',
  genre = '',
  year = '',
  page = 1,
  dateMode = 'latest'
} = {}) => {
  const limit = 24;
  const offset = (page - 1) * limit;
  const cleanQuery = query && typeof query === 'string' ? query.trim() : '';
  const hasFilters = Boolean(genre || (year && !isNaN(parseInt(year, 10))));

  let mangaOrder = 'order[followedCount]=desc';
  let extraParams = '';

  if (mode === 'trending') {
    mangaOrder = 'order[followedCount]=desc';
  } else if (mode === 'ongoing') {
    mangaOrder = 'order[followedCount]=desc';
    extraParams += '&status[]=ongoing';
  } else if (mode === 'upcoming') {
    mangaOrder = 'order[createdAt]=desc';
    extraParams += '&status[]=ongoing&availableTranslatedLanguage[]=en';
  } else if (mode === 'top_rated') {
    mangaOrder = 'order[rating]=desc';
  } else {
    // 'latest'
    mangaOrder = 'order[latestUploadedChapter]=desc';
    if (!cleanQuery) extraParams += '&availableTranslatedLanguage[]=en';
  }

  let filterParams = '';
  if (genre) {
    if (genre.startsWith('d_')) {
      filterParams += `&publicationDemographic[]=${encodeURIComponent(genre.replace('d_', ''))}`;
    } else {
      filterParams += `&includedTags[]=${encodeURIComponent(genre)}`;
    }
  }
  const numericYear = year && !isNaN(parseInt(year, 10)) ? parseInt(year, 10) : null;
  if (numericYear) {
    filterParams += `&year=${numericYear}`;
  }

  const buildMdUrl = (langParam = extraParams) => {
    let url = `${MANGADEX_API}?limit=${limit}&offset=${offset}&${mangaOrder}${langParam}${filterParams}`;
    if (cleanQuery) url += `&title=${encodeURIComponent(cleanQuery)}`;
    return url;
  };

  // Determine corresponding AniList options in case we merge/backfill
  const aniListSortMap = {
    trending: 'TRENDING_DESC',
    ongoing: 'POPULARITY_DESC',
    top_rated: 'SCORE_DESC',
    upcoming: 'POPULARITY_DESC',
    latest: 'UPDATED_AT_DESC'
  };
  const aniListOptions = {
    sort: cleanQuery ? ['SEARCH_MATCH', 'POPULARITY_DESC'] : (aniListSortMap[mode] || 'POPULARITY_DESC'),
    status: mode === 'upcoming' ? 'NOT_YET_RELEASED' : (mode === 'ongoing' ? 'RELEASING' : null),
    search: cleanQuery || null,
    genre: genre || null,
    year: numericYear,
    page,
    perPage: 20
  };

  let mdFormatted = [];
  let aniListFallback = [];

  if (mode === 'upcoming' && !cleanQuery) {
    // Run AniList NOT_YET_RELEASED + newest English-translated MangaDex entries concurrently
    const [mdRes, alItems] = await Promise.all([
      axios.get(buildMdUrl(), { timeout: 6500 }).catch(() => ({ data: { data: [] } })),
      queryAniListMangaCatalog(aniListOptions)
    ]);
    mdFormatted = await formatMangaDexItems(mdRes.data?.data || [], { dateMode });
    aniListFallback = alItems;
  } else {
    let mdRes = await axios.get(buildMdUrl(), { timeout: 6500 }).catch(() => ({ data: { data: [] } }));
    let rawList = mdRes.data?.data || [];

    // If strict English filter on `latest` returned sparse filtered results, retry once without lang filter
    if (rawList.length < 8 && hasFilters && extraParams.includes('availableTranslatedLanguage')) {
      const relaxedParams = extraParams.replace('&availableTranslatedLanguage[]=en', '');
      mdRes = await axios.get(buildMdUrl(relaxedParams), { timeout: 6500 }).catch(() => ({ data: { data: [] } }));
      rawList = mdRes.data?.data || [];
    }

    mdFormatted = await formatMangaDexItems(rawList, { dateMode });
  }

  const mdCovered = mdFormatted.filter((item) => isValidCoverUrl(item.poster_path));

  // Merge AniList guaranteed-cover entries for `upcoming` or when MangaDex yielded < 12 covered entries
  if (mode === 'upcoming' || mdCovered.length < 12) {
    if (aniListFallback.length === 0 && (mode !== 'upcoming' || cleanQuery)) {
      aniListFallback = await queryAniListMangaCatalog(
        mode === 'upcoming' && cleanQuery ? { ...aniListOptions, status: null } : aniListOptions
      );
    }

    const merged = [];
    const seenKeys = new Set();
    const pushUnique = (item) => {
      if (!item || !isValidCoverUrl(item.poster_path)) return;
      const normKey = normalizeText(item.title).replace(/[^a-z0-9\u3040-\u9fff]/g, '');
      const dedupeKey = normKey || String(item.id);
      if (seenKeys.has(dedupeKey)) return;
      seenKeys.add(dedupeKey);
      merged.push(item);
    };

    if (mode === 'upcoming' && !cleanQuery) {
      // Interleave AniList upcoming releases + MangaDex newly added covered series
      const maxLen = Math.max(aniListFallback.length, mdCovered.length);
      for (let i = 0; i < maxLen && merged.length < 24; i++) {
        if (aniListFallback[i]) pushUnique(aniListFallback[i]);
        if (merged.length < 24 && mdCovered[i]) pushUnique(mdCovered[i]);
      }
    } else {
      mdCovered.forEach(pushUnique);
      aniListFallback.forEach((item) => {
        if (merged.length < 24) pushUnique(item);
      });
    }

    if (merged.length > 0) return merged.slice(0, 24);
  }

  // Prefer cover-verified items so zero SVG fallbacks appear on feeds/search
  if (mdCovered.length > 0) {
    return mdCovered;
  }

  // Ultimate fallback only if external cover APIs are completely unreachable
  return mdFormatted;
};

/**
 * Fetches rich manga details by numeric AniList ID (used when linking from Anime related_franchise
 * or Upcoming Manga cards) and resolves a matching MangaDex UUID when available so chapters load.
 */
export const getAniListMangaDetail = async (alId) => {
  const numId = parseInt(alId, 10);
  if (isNaN(numId)) return null;

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          id
          title { english romaji native }
          description(asHtml: false)
          coverImage { extraLarge large }
          bannerImage
          genres
          averageScore
          startDate { year month day }
          staff(perPage: 12, sort: RELEVANCE) {
            edges {
              role
              node {
                id
                name { full }
                image { large medium }
              }
            }
          }
          recommendations(sort: RATING_DESC, perPage: 6) {
            nodes {
              mediaRecommendation {
                id
                title { english romaji }
                coverImage { extraLarge large }
              }
            }
          }
        }
      }
    `;
    const res = await axios.post(
      ANILIST_API,
      { query, variables: { id: numId } },
      { headers: { 'Content-Type': 'application/json' }, timeout: 5500, validateStatus: (s) => s < 500 }
    );
    const m = res.data?.data?.Media;
    if (!m) return null;

    const title = m.title?.english || m.title?.romaji || m.title?.native || 'Unknown Manga';
    const rawPoster = m.coverImage?.extraLarge || m.coverImage?.large || null;
    const poster = isValidCoverUrl(rawPoster) ? rawPoster : null;
    const backdrop = isValidCoverUrl(m.bannerImage) ? m.bannerImage : poster;
    const yearStr = m.startDate?.year
      ? `${m.startDate.year}-${String(m.startDate.month || 1).padStart(2, '0')}-${String(m.startDate.day || 1).padStart(2, '0')}`
      : '';

    // Best-effort verified match on MangaDex so chapter reader works whenever chapters exist
    let mangadexId = null;
    try {
      const searchQ = m.title?.romaji || title;
      const mdRes = await axios.get(
        `${MANGADEX_API}?title=${encodeURIComponent(searchQ)}&limit=6`,
        { timeout: 3500 }
      );
      const mdCandidates = mdRes.data?.data || [];
      const alTargets = [m.title?.english, m.title?.romaji, m.title?.native, title].filter(Boolean);
      const hit =
        mdCandidates.find((cand) => String(cand.attributes?.links?.al) === String(numId)) ||
        mdCandidates.find((cand) => titlesRoughlyMatch(collectMangaTitleCandidates(cand), alTargets));
      if (hit?.id) mangadexId = hit.id;
    } catch {
      // Optional enrichment
    }

    return {
      id: String(m.id),
      mangadex_id: mangadexId,
      title,
      overview: m.description ? m.description.replace(/<[^>]*>/g, '') : 'No description available.',
      poster_path: poster,
      backdrop_path: backdrop,
      release_date: yearStr,
      vote_average: m.averageScore ? (m.averageScore / 10).toFixed(1) : 8.0,
      genres: (m.genres || []).map((g) => ({ id: g, name: g })),
      youtube_trailer: null,
      cast: (m.staff?.edges || []).map((s) => ({
        id: s.node?.id ? String(s.node.id) : null,
        source: 'anilist_staff',
        name: s.node?.name?.full || 'Creator',
        character: s.role || 'Creator',
        role_type: 'Creator',
        profile_path: s.node?.image?.large || s.node?.image?.medium || null
      })),
      recommendations: (m.recommendations?.nodes || [])
        .filter((r) => r.mediaRecommendation && isValidCoverUrl(r.mediaRecommendation.coverImage?.extraLarge || r.mediaRecommendation.coverImage?.large))
        .map((r) => ({
          id: String(r.mediaRecommendation.id),
          title: r.mediaRecommendation.title?.english || r.mediaRecommendation.title?.romaji || 'Manga',
          poster_path: r.mediaRecommendation.coverImage?.extraLarge || r.mediaRecommendation.coverImage?.large,
          media_type: 'manga'
        })),
      media_type: 'manga'
    };
  } catch (err) {
    console.warn('[MangaCovers] AniList manga detail error:', err.message);
    return null;
  }
};

/**
 * Heals saved watchlist rows whose manga poster_path is missing or points to blocked/placeholder URLs.
 */
export const healMangaWatchlistCovers = async (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const needsHealing = rows.filter(
    (r) => r.media_type === 'manga' && !isValidCoverUrl(r.poster_path)
  );
  if (needsHealing.length === 0) return rows;

  const uuidIds = needsHealing
    .map((r) => String(r.external_media_id))
    .filter((id) => UUID_REGEX.test(id));
  const numericIds = needsHealing
    .map((r) => String(r.external_media_id))
    .filter((id) => /^\d+$/.test(id));

  const healedByExtId = new Map();

  // Heal MangaDex UUIDs via MangaDex metadata -> resolveMangaCovers
  if (uuidIds.length > 0) {
    try {
      for (const chunk of chunkArray(uuidIds, 50)) {
        const params = chunk.map((id) => `ids[]=${encodeURIComponent(id)}`).join('&');
        const mdRes = await axios.get(`${MANGADEX_API}?limit=50&${params}`, { timeout: 4500 });
        const rawList = mdRes.data?.data || [];
        const covers = await resolveMangaCovers(rawList);
        covers.forEach((val, key) => {
          if (isValidCoverUrl(val?.poster_path)) healedByExtId.set(key, val.poster_path);
        });
      }
    } catch (err) {
      console.warn('[MangaCovers] Watchlist UUID cover heal failed:', err.message);
    }
  }

  // Heal numeric AniList IDs
  if (numericIds.length > 0) {
    try {
      const nums = numericIds.map((id) => parseInt(id, 10));
      const res = await axios.post(
        ANILIST_API,
        {
          query: 'query ($ids: [Int]) { Page(page: 1, perPage: 50) { media(id_in: $ids, type: MANGA) { id coverImage { extraLarge large } } } }',
          variables: { ids: nums }
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 4500, validateStatus: (s) => s < 500 }
      );
      for (const m of res.data?.data?.Page?.media || []) {
        const poster = m.coverImage?.extraLarge || m.coverImage?.large;
        if (isValidCoverUrl(poster)) healedByExtId.set(String(m.id), poster);
      }
    } catch (err) {
      console.warn('[MangaCovers] Watchlist AniList cover heal failed:', err.message);
    }
  }

  // Title fallback for any remaining unhealed bookmark row (e.g. if MangaDex ID no longer resolved directly)
  const stillUnhealed = needsHealing.filter(
    (r) => r.title && !healedByExtId.has(String(r.external_media_id))
  );
  if (stillUnhealed.length > 0) {
    await Promise.all(
      stillUnhealed.slice(0, 8).map(async (r) => {
        try {
          const hits = await queryAniListMangaCatalog({ search: r.title, perPage: 3 });
          const matched = hits.find((h) => titlesRoughlyMatch([r.title], [h.title]));
          if (matched && isValidCoverUrl(matched.poster_path)) {
            healedByExtId.set(String(r.external_media_id), matched.poster_path);
          }
        } catch {
          // Best-effort title heal
        }
      })
    );
  }

  return rows.map((r) => {
    if (r.media_type !== 'manga') return r;
    const healed = healedByExtId.get(String(r.external_media_id));
    if (isValidCoverUrl(healed)) {
      return { ...r, poster_path: healed };
    }
    if (!isValidCoverUrl(r.poster_path)) {
      return { ...r, poster_path: null };
    }
    return r;
  });
};
