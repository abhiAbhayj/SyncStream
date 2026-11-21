// SyncStream Service Worker for PWA & Mobile Support
const CACHE_NAME = 'syncstream-v23-music-autoplay-fix';

self.addEventListener('install', (event) => {
  // Activate updated service worker immediately without waiting for tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete all stale caches on activation
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Purging outdated cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Let network handle API, websockets, and external video embeds directly
  if (
    event.request.url.includes('/api/') || 
    event.request.url.includes('/socket.io/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network first: always fetch fresh bundle & HTML assets from network
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => response)
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Network offline', { status: 503, statusText: 'Offline' });
      })
  );
});
