const cacheName = "pigbrain.io-Breaker-0.1.0";
const contentToCache = [
    "Build/f047c5d22256e1476ed3b1891816a981.loader.js",
    "Build/36bce4cf1f921a2aa879f11047758bc2.framework.js.unityweb",
    "Build/0d28184fbde95691db9a83f3d13b44e8.data.unityweb",
    "Build/87f2e2e57917a8c18e3c0f7a22ae7414.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
