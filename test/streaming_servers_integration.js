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

console.log('=== TEST 1: STREAMING_SERVERS Definition (Exact 5 Fast Non-Vid Working Servers) ===');
assert(STREAMING_SERVERS.length === 5, `Contains exactly 5 servers (got ${STREAMING_SERVERS.length})`);
const keys = new Set(STREAMING_SERVERS.map(s => s.key));
assert(keys.size === 5, `All 5 server keys are unique (got ${keys.size})`);
assert(DEFAULT_SERVER_KEY === 'twoembed', `Default server is twoembed (got ${DEFAULT_SERVER_KEY})`);
assert(STREAMING_SERVERS[0].key === 'twoembed', `Server 1 is 2Embed PRO (got ${STREAMING_SERVERS[0].name})`);
assert(STREAMING_SERVERS[1].key === 'bingeapi', `Server 2 is BingeAPI PRO (got ${STREAMING_SERVERS[1].name})`);
assert(STREAMING_SERVERS[2].key === 'cinesrc', `Server 3 is CineSrc PRO (got ${STREAMING_SERVERS[2].name})`);
assert(STREAMING_SERVERS[3].key === 'twoembedskin', `Server 4 is 2Embed Skin (got ${STREAMING_SERVERS[3].name})`);
assert(STREAMING_SERVERS[4].key === 'varkai', `Server 5 is Varkai PRO (got ${STREAMING_SERVERS[4].name})`);

// Ensure NO server has "vid" in its name or key
for (const server of STREAMING_SERVERS) {
  assert(!server.key.includes('vid'), `Server key ${server.key} does not contain 'vid'`);
  assert(!server.name.toLowerCase().includes('vid'), `Server name ${server.name} does not contain 'vid'`);
}

console.log('\n=== TEST 2: normalizeServerKey Legacy Aliases (All Map to 5 Active Servers) ===');
assert(normalizeServerKey('twoembed') === 'twoembed', 'twoembed maps to twoembed');
assert(normalizeServerKey('bingeapi') === 'bingeapi', 'bingeapi maps to bingeapi');
assert(normalizeServerKey('cinesrc') === 'cinesrc', 'cinesrc maps to cinesrc');
assert(normalizeServerKey('twoembedskin') === 'twoembedskin', 'twoembedskin maps to twoembedskin');
assert(normalizeServerKey('varkai') === 'varkai', 'varkai maps to varkai');
assert(normalizeServerKey('autoembed') === 'bingeapi', 'autoembed maps to bingeapi');
assert(normalizeServerKey('nontongo') === 'cinesrc', 'nontongo maps to cinesrc');
assert(normalizeServerKey('smashystream') === 'varkai', 'smashystream maps to varkai');
assert(normalizeServerKey('vidlink') === 'twoembed', 'vidlink maps to twoembed');
assert(normalizeServerKey('vidfastpro') === 'twoembed', 'vidfastpro maps to twoembed');
assert(normalizeServerKey('vidsrcme') === 'twoembed', 'vidsrcme maps to twoembed');
assert(normalizeServerKey('vidsrcto') === 'bingeapi', 'vidsrcto maps to bingeapi');
assert(normalizeServerKey('vidsrccc') === 'bingeapi', 'vidsrccc maps to bingeapi');
assert(normalizeServerKey('embedsu') === 'bingeapi', 'embedsu maps to bingeapi');
assert(normalizeServerKey('cinemaos') === 'cinesrc', 'cinemaos maps to cinesrc');
assert(normalizeServerKey('multiembed') === 'twoembedskin', 'multiembed maps to twoembedskin');
assert(normalizeServerKey('unknown_key_xyz') === 'twoembed', 'unknown key falls back to default twoembed');

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
  serverKey: 'twoembed',
  mediaType: 'movie',
  id: 'custom_789',
  tmdbId: null,
  imdbId: 'tt0111161'
});
assert(Boolean(imdbUrl && imdbUrl.includes('tt0111161')), `Movie falls back to IMDb ID when tmdbId is missing: ${imdbUrl}`);

console.log('\n=== TEST 6: AniList Guard ===');
// Unmapped AniList ID with no TMDB ID must NOT leak to TMDB-only servers
const unmappedTwoEmbed = getEmbedStreamUrl({
  serverKey: 'twoembed',
  mediaType: 'anime',
  id: 'al_7054',
  tmdbId: null,
  season: 1,
  episode: 1
});
assert(unmappedTwoEmbed === null, 'Unmapped AniList ID returns null until TMDB is resolved (prevents playing wrong show)');

console.log('\n=== TEST 7: Timestamp Seeking Parameter ===');
const seekUrl = getEmbedStreamUrl({
  serverKey: 'twoembed',
  mediaType: 'movie',
  id: '550',
  tmdbId: '550',
  startTime: 120
});
assert(Boolean(seekUrl && seekUrl.includes('start=120')), `Appends start time parameter: ${seekUrl}`);

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
