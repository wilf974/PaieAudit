const CACHE = 'paieaudit-v1.2';
const CORE = ['./','./index.html','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','./icon-maskable.svg'];
const FONT_HOSTS = ['fonts.googleapis.com','fonts.gstatic.com'];
// pdf.js chargé depuis CDN au 1er upload PDF, mis en cache pour usage offline ensuite
const PDFJS_HOSTS = ['cdn.jsdelivr.net'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(req.mode === 'navigate'){
    e.respondWith(caches.match('./index.html').then(c => c || fetch(req).catch(() => caches.match('./index.html')))); return;
  }
  if(FONT_HOSTS.includes(url.host) || PDFJS_HOSTS.includes(url.host)){
    e.respondWith(caches.open(CACHE).then(cache => cache.match(req).then(cached => {
      const net = fetch(req).then(r => { if(r && r.status === 200) cache.put(req, r.clone()); return r; }).catch(() => cached);
      return cached || net;
    }))); return;
  }
  e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => {
    if(r && r.status === 200 && url.origin === self.location.origin){ const clone = r.clone(); caches.open(CACHE).then(c => c.put(req, clone)); }
    return r;
  }).catch(() => c)));
});
self.addEventListener('message', e => { if(e.data === 'SKIP_WAITING') self.skipWaiting(); });
