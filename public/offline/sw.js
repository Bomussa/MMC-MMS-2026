// Minimal offline service worker for MMC Pages
// Caches the offline page and a few key assets; serves offline.html on navigation fallback.

const CACHE_NAME = 'mmc-offline-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [
    OFFLINE_URL,
    '/theme/tokens.css',
    '/legacy.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    // For navigation requests, try network first, then offline fallback
    if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
        event.respondWith(
            fetch(req).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }
    // For other GET requests, respond from cache if available, else network
    if (req.method === 'GET') {
        event.respondWith(
            caches.match(req).then((cached) => cached || fetch(req))
        );
    }
});
