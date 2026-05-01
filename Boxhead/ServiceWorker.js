const cacheName = "pigbrain.io-Boxhead-0.2.87";
const contentToCache = [
    "Build/c62fad97d49c5f83ebb96c6efd8e230e.loader.js",
    "Build/45ad2c56e96195989f693f1b6d91df9f.framework.js.unityweb",
    "Build/54254250f90855cab74ee68f4ebee81e.data.unityweb",
    "Build/abcb1d1db1d528a5c1d5e3c4b7b4eb9a.wasm.unityweb",
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
