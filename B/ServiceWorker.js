const cacheName = "MassiveHadron-TileStormEvolution-0.1.7";
const contentToCache = [
    "Build/750909a7b3fa20b0428a44bc3899eb0e.loader.js",
    "Build/60b51095c5878b43c4413d011dfaa435.framework.js.unityweb",
    "Build/1ca6ea2aca9ff4aa4f143e3d116de47d.data.unityweb",
    "Build/47b44350954aa49d47757e00d5877d45.wasm.unityweb",
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
