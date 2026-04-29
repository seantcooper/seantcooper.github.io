const cacheName = "pigbrain.io-Boxhead-0.2.82";
const contentToCache = [
    "Build/5dbf18bd5d843735d61bb38703d73737.loader.js",
    "Build/bef46aa30928efb6570ed311a831f588.framework.js.unityweb",
    "Build/45105fb8c52b207a3609575e2ee6a61e.data.unityweb",
    "Build/33a3bdee64d954716ce5b5ddc01c752e.wasm.unityweb",
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
