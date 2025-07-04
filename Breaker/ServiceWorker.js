const cacheName = "pigbrain.io-Breaker-0.1.0";
const contentToCache = [
    "Build/3ab064c802bf66410981d935141ae47a.loader.js",
    "Build/36bce4cf1f921a2aa879f11047758bc2.framework.js.unityweb",
    "Build/70ba35ffeb9892454a1ccc30efa6f0b1.data.unityweb",
    "Build/f2e6d9a647ef7b6c90987495a99c37ac.wasm.unityweb",
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
