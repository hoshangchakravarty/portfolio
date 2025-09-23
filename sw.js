const CACHE_NAME = 'hc-portfolio-v1';
const CORE = [
  '/', 'index.html',
  'images/default.mp4','sounds/default.mp3',
  'images/liyue.mp4','sounds/rex.mp3',
  'images/childe.mp4','sounds/childe.mp3',
  'images/inazuma.mp4','sounds/inazuma.mp3',
  // add any UI images used immediately (logos/chibis) if you want
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME && caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Cache-first for media; network-first for html/css/js by default
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isMedia = url.pathname.match(/\.(mp4|mp3|webm|ogg|wav)$/i);
  if (isMedia) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return resp;
      }))
    );
  }
});