const CACHE_NAME = 'smartplate-v7';
// Always fetch index.html and assets fresh from network first
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/logo_final.jpg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // BYPASS CACHE for HTML, JS, CSS, and API to solve white screen/old file issues
  if (
    event.request.mode === 'navigate' || 
    url.pathname.includes('/assets/') || 
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Fallback for static media assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
