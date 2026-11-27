import {
  STREAMING_SERVERS,
  DEFAULT_SERVER_KEY,
  normalizeServerKey,
  supportsDirectAnimeId,
  getEmbedStreamUrl
} from '../client/src/utils/streamingServers.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== TEST 1: STREAMING_SERVERS Definition (Exact 5 Servers) ===');
assert(STREAMING_SERVERS.length === 5, `Contains exactly 5 servers (got ${STREAMING_SERVERS.length})`);
const keys = new Set(STREAMING_SERVERS.map(s => s.key));
assert(keys.size === 5, `All 5 server keys are unique (got ${keys.size})`);
assert(DEFAULT_SERVER_KEY === 'vidlink', `Default server is vidlink (got ${DEFAULT_SERVER_KEY})`);
assert(STREAMING_SERVERS[0].key === 'vidlink', `Server 1 is VidLink PRO (got ${STREAMING_SERVERS[0].name})`);
assert(STREAMING_SERVERS[1].key === 'vidsrccc', `Server 2 is VidSrc CC (got ${STREAMING_SERVERS[1].name})`);
assert(STREAMING_SERVERS[2].key === 'embedsu', `Server 3 is Embed SU (got ${STREAMING_SERVERS[2].name})`);
assert(STREAMING_SERVERS[3].key === 'multiembed', `Server 4 is MultiEmbed (got ${STREAMING_SERVERS[3].name})`);
assert(STREAMING_SERVERS[4].key === 'twoembed', `Server 5 is 2Embed PRO (got ${STREAMING_SERVERS[4].name})`);

console.log('\n=== TEST 2: normalizeServerKey Legacy Aliases (All Map to 5 Active Servers) ===');
assert(normalizeServerKey('vidfastpro') === 'vidlink', 'vidfastpro maps to vidlink');
assert(normalizeServerKey('vidfast') === 'vidlink', 'vidfast maps to vidlink');
assert(normalizeServerKey('vidprime') === 'vidlink', 'vidprime maps to vidlink');
assert(normalizeServerKey('vidnest') === 'vidlink', 'vidnest maps to vidlink');
assert(normalizeServerKey('vidrock') === 'embedsu', 'vidrock maps to embedsu');
assert(normalizeServerKey('cinemaos') === 'embedsu', 'cinemaos maps to embedsu');
assert(normalizeServerKey('vidsrcme') === 'vidsrccc', 'vidsrcme maps to vidsrccc');
assert(normalizeServerKey('vidsrcto') === 'vidsrccc', 'vidsrcto maps to vidsrccc');
assert(normalizeServerKey('autoembed') === 'multiembed', 'autoembed maps to multiembed');
assert(normalizeServerKey('superembed') === 'multiembed', 'superembed maps to multiembed');
assert(normalizeServerKey('twoembedskin') === 'twoembed', 'twoembedskin maps to twoembed');
assert(normalizeServerKey('unknown_key_xyz') === 'vidlink', 'unknown key falls back to default vidlink');

console.log('\n=== TEST 3: Movie Embed URL Generation across all 5 servers ===');
for (const server of STREAMING_SERVERS) {
  const url = getEmbedStreamUrl({
    serverKey: server.key,
    mediaType: 'movie',
    id: '550',
    tmdbId: '550'
  });
  assert(Boolean(url && url.startsWith('http') && url.includes('550')), `${server.name} generates valid movie URL: ${url}`);
}

console.log('\n=== TEST 4: TV Show Embed URL Generation across all 5 servers ===');
for (const server of STREAMING_SERVERS) {
  const url = getEmbedStreamUrl({
    serverKey: server.key,
    mediaType: 'tv',
    id: '1396',
    tmdbId: '1396',
    season: 2,
    episode: 4
  });
  assert(Boolean(url && url.startsWith('http') && (url.includes('1396') || url.includes('2') || url.includes('4'))), `${server.name} generates valid TV URL: ${url}`);
}

console.log('\n=== TEST 5: IMDb ID Fallback when tmdbId is missing ===');
const imdbUrl = getEmbedStreamUrl({
  serverKey: 'vidlink',
  mediaType: 'movie',
  id: 'custom_789',
  tmdbId: null,
  imdbId: 'tt0111161'
});
assert(Boolean(imdbUrl && imdbUrl.includes('tt0111161')), `Movie falls back to IMDb ID when tmdbId is missing: ${imdbUrl}`);

console.log('\n=== TEST 6: AniList & MAL Safety Guard ===');
// Unmapped AniList ID with no TMDB ID must NOT leak to TMDB-only servers
const unmappedVidSrcCC = getEmbedStreamUrl({
  serverKey: 'vidsrccc',
  mediaType: 'anime',
  id: 'al_7054',
  tmdbId: null,
  season: 1,
  episode: 1
});
assert(unmappedVidSrcCC === null, 'Unmapped AniList ID returns null for TMDB-only servers (prevents playing wrong show)');

const unmappedAnimeServer = getEmbedStreamUrl({
  serverKey: 'vidlink',
  mediaType: 'anime',
  id: 'al_7054',
  tmdbId: null,
  malId: '7054',
  season: 1,
  episode: 1
});
assert(Boolean(unmappedAnimeServer && unmappedAnimeServer.includes('7054') && unmappedAnimeServer.includes('sub')), `Unmapped AniList ID correctly routes to VidLink using MAL ID: ${unmappedAnimeServer}`);

console.log('\n=== TEST 7: Timestamp Seeking Parameter ===');
const seekUrl = getEmbedStreamUrl({
  serverKey: 'vidlink',
  mediaType: 'movie',
  id: '550',
  tmdbId: '550',
  startTime: 120
});
assert(Boolean(seekUrl && seekUrl.includes('start=120')), `Appends start time parameter: ${seekUrl}`);

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
