/**
 * Integration test: Verifies that the new cleanLyricsTitle + scoring logic
 * resolves correct lyrics for various tricky songs.
 *
 * Run from: c:\xampp\htdocs\SyncStream
 *   node --input-type=module < test/lyrics_integration.js
 */

// ── Inline helpers (duplicated from musicController for standalone testing) ────

const cleanLyricsTitle = (rawTitle, knownArtist) => {
  if (!rawTitle) return { cleanTitle: '', embeddedArtist: null };
  let title = rawTitle.trim();
  let embeddedArtist = null;

  title = title.replace(/\s*\|.*$/g, '').trim();

  const hyphenMatch = title.match(/^([^([\-]{2,60}?)\s+-\s+(.+)$/);
  if (hyphenMatch) {
    const lhs = hyphenMatch[1].trim();
    const rhs = hyphenMatch[2].trim();
    const lhsLower = lhs.toLowerCase();
    const isSeriesPrefix = /^(from\s*opening|theme\s*song|ost|intro|opening|ending|insert\s*song)\b/.test(lhsLower);
    if (!isSeriesPrefix) {
      const artistMatchesLhs = knownArtist
        ? (lhsLower.includes(knownArtist.toLowerCase().split(',')[0].trim().toLowerCase()) ||
           knownArtist.toLowerCase().includes(lhsLower))
        : false;

      if (artistMatchesLhs) {
        embeddedArtist = lhs;
        title = rhs;
      } else if (!knownArtist) {
        const lhsWords = lhs.trim().split(/\s+/);
        const rhsHasArtistSeriesPattern = /^[\w\s]{1,30}\s*[\(\[][^\)\]]{3,}[\)\]]/.test(rhs);
        if (lhsWords.length <= 3 && !/[\(\[]/.test(lhs) && !rhsHasArtistSeriesPattern) {
          embeddedArtist = lhs;
          title = rhs;
        }
      }
    }
  }

  title = title
    .replace(/\s*[\(\[]\s*(?:from\s+[""]?[^""\)\]]*[""]?|theme\s+from[^)\]]*|original\s+(?:television\s+)?soundtrack[^)\]]*|ost[^)\]]*|mgm\s*series[^)\]]*|tv\s*series[^)\]]*)\s*[\)\]]/gi, '')
    .replace(/\s*-\s*(?:from\s+the\s+(?:original\s+)?(?:television|tv)\s*series[^\n]*|from\s+the\s+film[^\n]*|theme\s+from[^\n]*)/gi, '')
    .trim();

  title = title
    .replace(/\s*[\(\[]\s*(?:official\s*(?:music\s*)?(?:lyric\s*)?video|audio(?:\s*song)?|hd|4k|full\s*song|visualizer|remastered(?:\s+\d{4})?|lyrics?|lyrical|feat\.?[^)\]]*|ft\.?[^)\]]*|with\s+[^)\]]*|remix[^)\]]*|live[^)\]]*)\s*[\)\]]/gi, '')
    .replace(/\s*-\s*(?:official\s*(?:music\s*)?video|official\s*audio|lyrics?\s*video|hd|4k|visualizer)\s*$/gi, '')
    .trim();

  title = title
    .replace(/\b(lyrical|official video|music video|full song|visualizer|audio song)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { cleanTitle: title || rawTitle.trim(), embeddedArtist };
};

const cleanLyricsArtist = (rawArtist) => {
  if (!rawArtist) return '';
  return rawArtist
    .split(',')[0].split('&')[0].split('/')[0]
    .replace(/\s*-\s*topic\s*$/i, '')
    .replace(/\s*official\s*$/i, '')
    .replace(/\s*vevo\s*$/i, '')
    .replace(/\s*(?:records|music|tv|channel|audio|lyrics)\s*$/gi, '')
    .trim();
};

const tokenSimilarity = (a, b) => {
  if (!a || !b) return 0;
  const norm = (s) => s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const setA = new Set(norm(a).split(' ').filter(Boolean));
  const setB = new Set(norm(b).split(' ').filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const t of setA) { if (setB.has(t)) inter++; }
  const union = new Set([...setA, ...setB]).size;
  return inter / union;
};

const scoreLyricsCandidate = (candidate, targetTitle, targetArtist, targetDurationSec) => {
  const candTitle = candidate.trackName || '';
  const candArtist = candidate.artistName || '';
  const candDuration = Number(candidate.duration) || 0;
  const titleSim = tokenSimilarity(candTitle, targetTitle);
  const artistSim = targetArtist ? tokenSimilarity(candArtist, targetArtist) : 0.5;
  const durDelta = targetDurationSec > 0 && candDuration > 0 ? Math.abs(candDuration - targetDurationSec) : 999;

  if (titleSim < 0.25) return -1;
  if (targetArtist && artistSim < 0.1 && candArtist) return -1;
  if (targetDurationSec > 0 && candDuration > 0 && durDelta > 30) return -1;

  const durScore = durDelta < 999 ? Math.max(0, 1 - durDelta / 30) : 0.5;
  return titleSim * 0.55 + artistSim * 0.30 + durScore * 0.15;
};

const pickBestLyricsCandidate = (candidates, targetTitle, targetArtist, targetDurationSec) => {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  let best = null;
  let bestScore = 0.30;
  for (const cand of candidates) {
    if (!cand.syncedLyrics && !cand.plainLyrics) continue;
    const score = scoreLyricsCandidate(cand, targetTitle, targetArtist, targetDurationSec);
    if (score > bestScore) {
      best = cand;
      bestScore = score;
    }
  }
  return best;
};

// ── Test cases ────────────────────────────────────────────────────────────────

const testTitles = [
  {
    desc: 'FROM series song with YouTube title format',
    rawTitle: 'Pixies - Que Sera Sera (Official Lyric Video)',
    rawArtist: 'PixiesOfficial',
    expectedTitle: 'Que Sera Sera',
    expectedArtist: 'Pixies'
  },
  {
    desc: 'FROM series song with TV attribution in brackets',
    rawTitle: 'Que Sera, Sera (From "FROM")',
    rawArtist: 'Pixies',
    expectedTitle: 'Que Sera, Sera',
    expectedArtist: 'Pixies'
  },
  {
    desc: 'JioSaavn movie song with soundtrack tag',
    rawTitle: 'Kesariya (From "Brahmastra")',
    rawArtist: 'Arijit Singh',
    expectedTitle: 'Kesariya',
    expectedArtist: 'Arijit Singh'
  },
  {
    desc: 'Anime OP with channel suffix',
    rawTitle: 'Gurenge - LiSA (Demon Slayer OP) [Official Lyric Video]',
    rawArtist: 'LiSA - Topic',
    expectedTitle: 'Gurenge',
    expectedArtist: 'LiSA'
  },
  {
    desc: 'Standard YouTube title: Artist - Song',
    rawTitle: 'Ed Sheeran - Shape of You (Official Music Video)',
    rawArtist: 'Ed Sheeran',
    expectedTitle: 'Shape of You',
    expectedArtist: 'Ed Sheeran'
  },
  {
    desc: 'From Opening prefix (should NOT extract as artist)',
    rawTitle: 'From Opening - Que Sera, Sera (Whatever Will Be, Will Be) MGM Series',
    rawArtist: '',
    expectedTitle: 'Que Sera, Sera',
    expectedArtist: ''
  },
  {
    desc: 'JioSaavn formatted - remastered suffix',
    rawTitle: 'Hotel California (Remastered 2013)',
    rawArtist: 'Eagles',
    expectedTitle: 'Hotel California',
    expectedArtist: 'Eagles'
  }
];

console.log('=== TITLE / ARTIST CLEANING TESTS ===\n');
let passed = 0;
let failed = 0;

for (const tc of testTitles) {
  const rawCleanArtist = cleanLyricsArtist(tc.rawArtist || '');
  const { cleanTitle, embeddedArtist } = cleanLyricsTitle(tc.rawTitle, rawCleanArtist);
  const cleanArtist = rawCleanArtist || embeddedArtist || '';

  const titleOk = cleanTitle.toLowerCase().includes(tc.expectedTitle.toLowerCase());
  const artistOk = tc.expectedArtist === '' ? true : cleanArtist.toLowerCase().includes(tc.expectedArtist.toLowerCase());

  const status = titleOk && artistOk ? '✅ PASS' : '❌ FAIL';
  if (titleOk && artistOk) passed++; else failed++;

  console.log(`${status} | ${tc.desc}`);
  if (!titleOk) console.log(`    Title expected to contain: "${tc.expectedTitle}", got: "${cleanTitle}"`);
  if (!artistOk) console.log(`    Artist expected to contain: "${tc.expectedArtist}", got: "${cleanArtist}"`);
  console.log(`    cleaned: title="${cleanTitle}", artist="${cleanArtist}"`);
}

console.log(`\n=== SCORING TESTS ===\n`);

// Simulate what LRCLIB would return for "Que Sera Sera"
const mockLrcResults = [
  { trackName: 'José Feliciano Que será', artistName: 'José Feliciano', duration: 212, syncedLyrics: '[00:00.00]Pueblo mío', plainLyrics: 'Pueblo mío' },
  { trackName: 'Que sera sera', artistName: 'fhána', duration: 300, syncedLyrics: '[00:00.00]Some anime line', plainLyrics: 'Some anime' },
  { trackName: 'Que Sera Sera', artistName: 'Pixies', duration: 180, syncedLyrics: '[00:00.00]When I was just a little boy', plainLyrics: 'When I was just a little boy' },
  { trackName: 'Que Sera Sera', artistName: 'Doris Day', duration: 179, syncedLyrics: '[00:00.00]When I was just a little girl', plainLyrics: 'When I was just a little girl' }
];

const targetTitle = 'Que Sera Sera';
const targetArtist = 'Pixies';
const targetDuration = 180;

console.log('Scoring candidates for "Que Sera Sera" by Pixies (duration 180s):');
for (const cand of mockLrcResults) {
  const score = scoreLyricsCandidate(cand, targetTitle, targetArtist, targetDuration);
  console.log(`  score=${score.toFixed(3)} | "${cand.trackName}" by ${cand.artistName} (${cand.duration}s)`);
}

const best = pickBestLyricsCandidate(mockLrcResults, targetTitle, targetArtist, targetDuration);
if (best) {
  console.log(`\n✅ PASS: Best pick = "${best.trackName}" by ${best.artistName} (expected: Pixies)`);
  if (best.artistName === 'Pixies') passed++; else { failed++; console.log('  ❌ FAIL: Expected Pixies, got ' + best.artistName); }
} else {
  console.log('\n❌ FAIL: No candidate selected');
  failed++;
}

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
