const cacheName = "pigbrain.io-Breaker-0.1.0";
const contentToCache = [
    "Build/3a09cc7e21aa1ea2780c7a41b202cb82.loader.js",
    "Build/5e56781654981bac987bd299962ba26e.framework.js.unityweb",
    "Build/55784a9d59a61ee1dc742f85a199b193.data.unityweb",
    "Build/a042d1f07f7b58ed0b4603d5c3a9f901.wasm.unityweb",
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
