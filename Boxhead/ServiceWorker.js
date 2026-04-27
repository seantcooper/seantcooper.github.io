const cacheName = "pigbrain.io-Boxhead-0.2.51";
const contentToCache = [
    "Build/3b23f2ad4c04b79ae36caa0d0722c080.loader.js",
    "Build/c9334d8b063a7e80e4404f133c110bdd.framework.js.unityweb",
    "Build/33291b167edba2a08c6ce0eb7c32f568.data.unityweb",
    "Build/f8158cf257f33a68a683a1d5a091375e.wasm.unityweb",
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
