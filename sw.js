const CACHE = 'holform-os-v70';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/app.js',
  './js/face.js',
  './js/avatar.js',
  './js/sheetgeo.js',
  './js/artkit.js',
  './js/titles.js',
  './js/shop.js',
  './js/quests.js',
  './js/sync.js',
  './js/firebase-config.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/holform-wordmark.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first: always try for fresh content, fall back to cache when offline.
// Our own files are revalidated every time (cache: 'no-cache'): GitHub Pages lets browsers reuse them for 10 minutes,
// which would otherwise keep a new version off the phone for a while after an update.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const ours = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(
    fetch(e.request, ours ? { cache: 'no-cache' } : undefined).then((res) => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
