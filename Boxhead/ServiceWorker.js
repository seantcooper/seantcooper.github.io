const cacheName = "pigbrain.io-Boxhead-0.2.87";
const contentToCache = [
    "Build/f32a9e0265bc3e11e97cd2fa520e1940.loader.js",
    "Build/14506828480c6ed094981809f0f0ee7e.framework.js.unityweb",
    "Build/518cb304408c9cf981cf5013f3c2d00d.data.unityweb",
    "Build/94f2b1cfa97a2f37a976fb12aa8e6fdc.wasm.unityweb",
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
