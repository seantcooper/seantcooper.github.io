const cacheName = "pigbrain.io-Boxhead-0.2.53";
const contentToCache = [
    "Build/07d099e57ae549737746e73aa1eec151.loader.js",
    "Build/6623ff7de81a2bd9b5de69b800ec5763.framework.js.unityweb",
    "Build/0090e6a2442f46e066d4beeb323dd69f.data.unityweb",
    "Build/02715cf39f44c7ab03f2dd17429707d5.wasm.unityweb",
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
