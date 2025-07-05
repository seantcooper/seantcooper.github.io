const cacheName = "pigbrain.io-Breaker-0.1.0";
const contentToCache = [
    "Build/de888818f59e878fcb9d7d2d144de856.loader.js",
    "Build/1d9bf453e9470de93bcb13c651be6628.framework.js.unityweb",
    "Build/be87c520fefde8a9176006f2069b0dab.data.unityweb",
    "Build/ce4fe28706b17f472c817e44e2c913d7.wasm.unityweb",
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
