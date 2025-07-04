const cacheName = "pigbrain.io-Breaker-0.1.0";
const contentToCache = [
    "Build/30b9f7da689873237e431a07a028c5c0.loader.js",
    "Build/36bce4cf1f921a2aa879f11047758bc2.framework.js.unityweb",
    "Build/9d01b137be6e70cdf1cc0e50ccc65c0a.data.unityweb",
    "Build/dbdb34dacc93a657c5ece3a495f7037b.wasm.unityweb",
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
