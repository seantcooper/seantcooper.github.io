const cacheName = "pigbrain.io-Boxhead-0.2.102";
const contentToCache = [
    "Build/01a4777b383e60ee147865336d2df346.loader.js",
    "Build/d5a10dc7c1170368f6476a6656d32c00.framework.js.unityweb",
    "Build/40cd6a7a3986ed34781645a7707f1b33.data.unityweb",
    "Build/7e3d403e9c4566aa8ccf2468308356c0.wasm.unityweb",
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
