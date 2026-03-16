/**
 * NutriVision AI - Service Worker
 * Enabling Offline-First Enterprise Experience.
 */

const CACHE_NAME = 'nv-ai-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/theme.css',
    '/css/base.css',
    '/css/components.css',
    '/js/store.js',
    '/js/ai.js',
    '/js/view.js',
    '/js/notifications.js',
    '/js/community.js',
    '/app.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
