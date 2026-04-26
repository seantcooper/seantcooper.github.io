const cacheName = "pigbrain.io-Boxhead-0.2.49";
const contentToCache = [
    "Build/0845b13ad52e9a238f0ec461f16f050b.loader.js",
    "Build/c27996097be8974cfc743d0802829006.framework.js.unityweb",
    "Build/f146278ba56f9c1527f61dee26892e09.data.unityweb",
    "Build/3fd8452ee326483e13b8d5900b9d4508.wasm.unityweb",
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
