const cacheName = "pigbrain.io-Boxhead-0.2.41";
const contentToCache = [
    "Build/f1c322ae8de5ae4c7c03d6830e3990b1.loader.js",
    "Build/98954eed519e6c9e234f9e2dda7a2460.framework.js.unityweb",
    "Build/b87e13f6380abebf424be32f9e75e0d8.data.unityweb",
    "Build/a41aaf17fa03bb20f60155e71a4cce3a.wasm.unityweb",
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
