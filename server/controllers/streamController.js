import axios from 'axios';
import { makeProviders, makeStandardFetcher, targets } from '@movie-web/providers';

// ── Stream In-Memory Cache (TTL: 2 Hours) ──────────────────────────────────
const streamCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getCachedStream(cacheKey) {
  const cached = streamCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  if (cached) {
    streamCache.delete(cacheKey);
  }
  return null;
}

function setCachedStream(cacheKey, data) {
  // Prune cache if it grows past 500 items
  if (streamCache.size > 500) {
    const now = Date.now();
    for (const [key, value] of streamCache.entries()) {
      if (value.expiresAt <= now) streamCache.delete(key);
    }
  }
  streamCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

// Initialize @movie-web/providers with standard Node fetcher
let movieWebProviders = null;
try {
  movieWebProviders = makeProviders({
    target: targets.ANY,
    fetcher: makeStandardFetcher(fetch)
  });
} catch (err) {
  console.warn('[StreamController] Notice: @movie-web/providers initialized in basic mode:', err.message);
}

// ── Built-in Direct Cloud Sources (Sample titles / Open movies) ────────────
const OPEN_MEDIA_SOURCES = {
  'sintel': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'mp4',
    quality: '1080p',
    subtitles: []
  },
  'tears-of-steel': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'mp4',
    quality: '1080p',
    subtitles: []
  },
  'big-buck-bunny': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
    quality: '1080p',
    subtitles: []
  },
  'elephants-dream': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'mp4',
    quality: '1080p',
    subtitles: []
  }
};

/**
 * Resolve direct HLS (.m3u8) or MP4 stream for a movie, TV show, or anime.
 * GET /api/stream/resolve
 */
export async function resolveStream(req, res) {
  const {
    tmdbId,
    imdbId,
    type = 'movie',
    title = '',
    releaseYear,
    season = 1,
    episode = 1
  } = req.query;

  if (!tmdbId && !title) {
    return res.status(400).json({ success: false, message: 'tmdbId or title is required' });
  }

  const s = Number(season) || 1;
  const ep = Number(episode) || 1;
  const year = Number(releaseYear) || new Date().getFullYear();
  const cleanTmdbId = /^\d+$/.test(String(tmdbId || '').trim()) ? String(tmdbId).trim() : '';
  const isEpisodic = type === 'tv' || type === 'anime';
  const cacheKey = `${type}:${cleanTmdbId || tmdbId || title}:${s}:${ep}`;

  // 1. Check in-memory cache
  const cached = getCachedStream(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  // 2. Check open / known sample media
  const lowerId = String(tmdbId || '').toLowerCase();
  if (OPEN_MEDIA_SOURCES[lowerId]) {
    const openSource = OPEN_MEDIA_SOURCES[lowerId];
    const payload = {
      success: true,
      streamUrl: openSource.url,
      type: openSource.type,
      quality: openSource.quality,
      subtitles: openSource.subtitles,
      provider: 'OpenCloud'
    };
    setCachedStream(cacheKey, payload);
    return res.json(payload);
  }

  // 3. Try @movie-web/providers extraction (Anime series share TV 'show' extraction, never 'movie')
  if (movieWebProviders && title && (cleanTmdbId || !String(tmdbId || '').startsWith('al_'))) {
    try {
      const media = isEpisodic ? {
        type: 'show',
        title,
        releaseYear: year,
        tmdbId: cleanTmdbId,
        imdbId: imdbId ? String(imdbId) : undefined,
        season: { number: s, tmdbId: '' },
        episode: { number: ep, tmdbId: '' }
      } : {
        type: 'movie',
        title,
        releaseYear: year,
        tmdbId: cleanTmdbId,
        imdbId: imdbId ? String(imdbId) : undefined
      };

      const result = await Promise.race([
        movieWebProviders.runAll({ media }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Movie-Web timeout')), 6500))
      ]);

      if (result && result.stream) {
        let streamUrl = '';
        let streamType = 'hls';
        let quality = '1080p';

        if (result.stream.type === 'hls' && result.stream.playlist) {
          streamUrl = result.stream.playlist;
          streamType = 'hls';
        } else if (result.stream.type === 'file' && result.stream.qualities) {
          streamType = 'mp4';
          const qualities = result.stream.qualities;
          const best = qualities['1080'] || qualities['720'] || qualities['480'] || Object.values(qualities)[0];
          if (best?.url) {
            streamUrl = best.url;
            quality = best.quality || '1080p';
          }
        }

        if (streamUrl) {
          // Format subtitles
          const subtitles = (result.stream.captions || []).map((c, i) => ({
            id: `sub-${i}`,
            label: c.language || 'Subtitles',
            src: c.url,
            language: c.language,
            default: c.language?.toLowerCase() === 'en' || c.language?.toLowerCase() === 'english'
          }));

          // If headers or referer are required, route through stream proxy
          const referer = result.stream.headers?.Referer || result.stream.headers?.referer || '';
          const finalStreamUrl = referer
            ? `/api/stream/proxy?url=${encodeURIComponent(streamUrl)}&referer=${encodeURIComponent(referer)}`
            : streamUrl;

          const payload = {
            success: true,
            streamUrl: finalStreamUrl,
            rawUrl: streamUrl,
            type: streamType,
            quality,
            subtitles,
            provider: result.providerId || 'CloudDirect'
          };

          setCachedStream(cacheKey, payload);
          return res.json(payload);
        }
      }
    } catch (mwError) {
      console.warn(`[StreamController] MovieWeb scraper attempt finished (${mwError.message})`);
    }
  }

  // 4. Try Direct Cloud Scrapers / Public Resolvers
  try {
    const cloudStream = await resolveDirectCloudStream({ tmdbId: cleanTmdbId, type: isEpisodic ? 'tv' : 'movie', season: s, episode: ep, title });
    if (cloudStream && cloudStream.streamUrl) {
      setCachedStream(cacheKey, cloudStream);
      return res.json(cloudStream);
    }
  } catch (cloudErr) {
    console.warn(`[StreamController] Direct cloud scraper finished (${cloudErr.message})`);
  }

  // 5. If no direct stream is extracted, inform the client to fall back to clean embed mirrors
  return res.json({
    success: false,
    message: 'Direct .m3u8 stream not currently extracted for this title. Using clean embed mirror.',
    fallbackRequired: true
  });
}

/**
 * Helper to query fast direct cloud stream endpoints
 */
async function resolveDirectCloudStream({ tmdbId, type, season, episode, title }) {
  if (!tmdbId && !title) return null;

  // Multi-source candidates
  const candidates = [];

  // Candidate A: Open Public Extractor Nodes
  if (tmdbId) {
    const path = type === 'tv' ? `tv/${tmdbId}/${season}/${episode}` : `movie/${tmdbId}`;
    candidates.push({
      url: `https://vidsrc.stream/api/source/${path}`,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      parser: (data) => {
        if (data?.streamUrl || data?.url) {
          return {
            streamUrl: data.streamUrl || data.url,
            type: (data.streamUrl || data.url).includes('.m3u8') ? 'hls' : 'mp4',
            subtitles: data.subtitles || []
          };
        }
        return null;
      }
    });
  }

  // Execute quick probes with 3.5s timeout
  for (const candidate of candidates) {
    try {
      const response = await axios.get(candidate.url, {
        headers: candidate.headers,
        timeout: 3500
      });
      const parsed = candidate.parser(response.data);
      if (parsed?.streamUrl) {
        return {
          success: true,
          streamUrl: parsed.streamUrl,
          type: parsed.type || 'hls',
          subtitles: parsed.subtitles || [],
          quality: '1080p',
          provider: 'FastCloud'
        };
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
}

/**
 * Ultra-fast CORS and Range-supporting Video & Playlist Streaming Proxy
 * Pipes .m3u8 manifests and .ts segments with full seeking support and zero popups.
 * GET /api/stream/proxy?url=ENCODED_URL&referer=ENCODED_REFERER
 */
export async function proxyStream(req, res) {
  const { url: targetUrl, referer } = req.query;

  if (!targetUrl) {
    return res.status(400).send('Target stream URL is required');
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const origin = referer ? new URL(referer).origin : parsedTarget.origin;

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Referer': referer || origin,
      'Origin': origin,
      'Accept': '*/*',
      'Connection': 'keep-alive'
    };

    // Forward HTTP Range header for bufferless scrubbing / seeking
    if (req.headers.range) {
      requestHeaders['Range'] = req.headers.range;
    }

    const response = await axios({
      method: 'GET',
      url: targetUrl,
      headers: requestHeaders,
      responseType: 'stream',
      timeout: 15000,
      validateStatus: (status) => status < 400 || status === 206
    });

    // CORS & Stream delivery headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');

    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
    }

    // Set HTTP status (206 for Range partial content, 200 for full payload)
    res.status(response.status);

    // Check if the stream is an HLS playlist (.m3u8) needing relative URL resolution
    const isM3u8 = targetUrl.includes('.m3u8') || (response.headers['content-type'] && response.headers['content-type'].includes('mpegurl'));

    if (isM3u8) {
      // Buffer playlist text to rewrite relative segments
      let data = '';
      response.data.setEncoding('utf8');
      response.data.on('data', chunk => { data += chunk; });
      response.data.on('end', () => {
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const lines = data.split('\n');
        const rewritten = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          try {
            const absoluteUri = trimmed.startsWith('http') ? trimmed : new URL(trimmed, baseUrl).href;
            return `/api/stream/proxy?url=${encodeURIComponent(absoluteUri)}&referer=${encodeURIComponent(referer || origin)}`;
          } catch {
            return line;
          }
        }).join('\n');

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Content-Length', Buffer.byteLength(rewritten));
        res.end(rewritten);
      });
      response.data.on('error', (err) => {
        console.error('[StreamProxy] Error buffering playlist:', err.message);
        if (!res.headersSent) res.status(502).end();
      });
    } else {
      // Direct binary pipe for .ts segments, .mp4 chunks, and subtitles
      response.data.pipe(res);
      response.data.on('error', (err) => {
        console.error('[StreamProxy] Stream pipe error:', err.message);
        if (!res.headersSent) res.status(502).end();
      });
    }
  } catch (error) {
    console.error('[StreamProxy] Failed to proxy stream URL:', error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy media stream', details: error.message });
    }
  }
}

/**
 * Zero-Ad Embed Reverse Proxy & In-Iframe Guard:
 * Fetches third-party embed HTML, fixes relative paths with <base>,
 * and injects the SyncStream Ultra Guard Script at the top of <head>.
 * Neutralizes all popups (window.open), top-level redirects (top.location),
 * and malicious link clicks WITHOUT triggering anti-sandbox checks!
 * GET /api/stream/embed-proxy?url=ENCODED_URL
 */
export async function embedProxy(req, res) {
  const { url: targetUrl } = req.query;
  if (!targetUrl) return res.status(400).send('Target embed URL is required');

  try {
    const parsed = new URL(targetUrl);
    const origin = parsed.origin;

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': origin + '/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 8000,
      responseType: 'text',
      validateStatus: (s) => s < 400
    });

    let html = response.data;
    if (typeof html !== 'string' || html.length < 50) {
      return res.redirect(targetUrl);
    }

    // 1. Strip notorious third-party ad networks directly from upstream HTML before execution
    const adDomains = [
      'tagivi.com',
      'wakemenoutlip.com',
      'createlouisville.org',
      'disable-devtool',
      'highperformancecpmgate.com',
      'profitabledisplaynetwork.com',
      'popads.net',
      'adcash.com',
      'adsterra.com',
      'monetag.com',
      'alwingulla.com',
      'cobalten.com',
      'whos.amung.us'
    ];

    for (const domain of adDomains) {
      const scriptRegex = new RegExp(`<script\\b[^>]*src=[^>]*${domain}[^>]*>[\\s\\S]*?<\\/script>`, 'gi');
      html = html.replace(scriptRegex, '<!-- Neutralized Ad Script -->');
    }

    const baseTag = `<base href="${origin}/" />`;
    const guardScript = `
<style>#sbxErr { display: none !important; }</style>
<script>
(function() {
  // 1. Neutralize window.open (Prevents all popups, popunders, new tabs)
  var dummyWin = {
    closed: true,
    focus: function() {},
    blur: function() {},
    close: function() {},
    postMessage: function() {},
    location: { href: '', replace: function() {}, assign: function() {} }
  };
  try {
    Object.defineProperty(window, 'open', {
      value: function() {
        console.warn('[SyncStream Guard] Neutralized external popup window.open');
        return dummyWin;
      },
      writable: false,
      configurable: false
    });
  } catch (e) {
    window.open = function() { return dummyWin; };
  }

  // 2. Safe mockTop and mockParent:
  // - Keeps (window === window.top) as FALSE so 2embed/embedwave frame checks pass!
  // - Blocks rogue ad redirects via top.location.href, assign, or replace
  // - Safely relays postMessage to parent for Watch Party synchronization
  var mockTop = {
    location: {
      get href() { return window.location.href; },
      set href(val) { console.warn('[SyncStream Guard] Blocked rogue top.location redirect to:', val); },
      replace: function(val) { console.warn('[SyncStream Guard] Blocked top.location.replace to:', val); },
      assign: function(val) { console.warn('[SyncStream Guard] Blocked top.location.assign to:', val); }
    },
    postMessage: function(msg, origin) {
      try {
        if (window.parent && window.parent !== window && window.parent !== mockTop) {
          window.parent.postMessage(msg, origin || '*');
        }
      } catch (e) {}
    }
  };

  try {
    Object.defineProperty(window, 'top', { get: function() { return mockTop; }, configurable: true });
    Object.defineProperty(window, 'parent', { get: function() { return mockTop; }, configurable: true });
  } catch (e) {}

  // 3. Bypass anti-sandbox checks (Prevents 2embed / embedwave document.domain throw)
  try {
    window.isReallySandboxed = function() { return false; };
  } catch (e) {}

  try {
    var curDomain = document.domain;
    Object.defineProperty(document, 'domain', {
      get: function() { return curDomain; },
      set: function(val) { curDomain = val; return val; },
      configurable: true
    });
  } catch (e) {}

  // 4. Intercept all ad click redirects (target="_blank" and target="_top")
  window.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A' && el !== document.body) {
      el = el.parentElement;
    }
    if (el && el.tagName === 'A') {
      var href = el.getAttribute('href');
      var target = el.getAttribute('target');
      if (target === '_blank' || target === '_top' || (href && !href.startsWith('javascript:') && !href.startsWith('#'))) {
        console.warn('[SyncStream Guard] Blocked ad link redirect click:', href);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }
  }, true);

  // 5. Intercept ad form submits
  window.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.tagName === 'FORM') {
      var target = form.getAttribute('target');
      if (target === '_blank' || target === '_top') {
        console.warn('[SyncStream Guard] Blocked ad form submit');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }, true);
})();
</script>
`;

    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}${guardScript}`);
    } else if (html.includes('<HEAD>')) {
      html = html.replace('<HEAD>', `<HEAD>${baseTag}${guardScript}`);
    } else {
      html = `${baseTag}${guardScript}${html}`;
    }

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.send(html);
  } catch (err) {
    console.warn('[EmbedProxy] Upstream proxy failed, falling back to direct redirect:', err.message);
    return res.redirect(targetUrl);
  }
}
