const cacheName = "pigbrain.io-Boxhead-0.3.11";
const contentToCache = [
    "Build/Boxhead-0.3.11-B.loader.js",
    "Build/Boxhead-0.3.11-B.framework.js.unityweb",
    "Build/Boxhead-0.3.11-B.data.unityweb",
    "Build/Boxhead-0.3.11-B.wasm.unityweb",
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
