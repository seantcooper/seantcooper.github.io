const cacheName = "MassiveHadron-TileStormEvolution-0.1.9";
const contentToCache = [
    "Build/bc7990425c628a8472025a3e999bae3d.loader.js",
    "Build/60b51095c5878b43c4413d011dfaa435.framework.js.unityweb",
    "Build/ab98ff0b9f9997469a44db4070278584.data.unityweb",
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
