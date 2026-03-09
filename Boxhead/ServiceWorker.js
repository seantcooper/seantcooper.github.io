const cacheName = "pigbrain.io-Boxhead-0.1.41";
const contentToCache = [
    "Build/d08467c57a06c8d7ed85dd6bef153d1f.loader.js",
    "Build/eba065b000bd6aed2ada9409652ab461.framework.js.unityweb",
    "Build/1ae5983260f635ad20a8bdf555d108e4.data.unityweb",
    "Build/a148463ca960f39e42da76916c1f3e8e.wasm.unityweb",
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
