const cacheName = "pigbrain.io-Breaker-0.1.0";
const contentToCache = [
    "Build/07c74258948b32f3620296d6d6469dda.loader.js",
    "Build/638953ab42b214cacb3a6805b363db9c.framework.js.unityweb",
    "Build/1e3fde8a929985afa4c4b501a0181e5d.data.unityweb",
    "Build/5590c0ce7542f1a64b084b8c16cfd481.wasm.unityweb",
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
