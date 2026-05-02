const cacheName = "pigbrain.io-Boxhead-0.2.95";
const contentToCache = [
    "Build/b8382bc4c8c7ca2d3337ac32c79ce3f0.loader.js",
    "Build/45ad2c56e96195989f693f1b6d91df9f.framework.js.unityweb",
    "Build/4ce40bafe377e73f2ec57f8b36642c64.data.unityweb",
    "Build/2fb78957cc71753e76a80a0ab7a344ad.wasm.unityweb",
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
