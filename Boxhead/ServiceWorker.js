const cacheName = "pigbrain.io-Boxhead-0.2.94";
const contentToCache = [
    "Build/bd45f5d27f48045c6c2f54dfa7297fce.loader.js",
    "Build/45ad2c56e96195989f693f1b6d91df9f.framework.js.unityweb",
    "Build/2bbdfaaec9deec28fba0b231ffc8d8af.data.unityweb",
    "Build/ef8f0b29e24e99be5f4d56bff30f9c2c.wasm.unityweb",
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
