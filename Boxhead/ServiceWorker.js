const cacheName = "pigbrain.io-Boxhead-0.2.84";
const contentToCache = [
    "Build/f02b5516848c98ed2dacacfedcff3f80.loader.js",
    "Build/bef46aa30928efb6570ed311a831f588.framework.js.unityweb",
    "Build/6ab0619c3537876edcb85a136fe73f9f.data.unityweb",
    "Build/aff91b68f3a77474fc15f2b053adcfe7.wasm.unityweb",
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
