const cacheName = "pigbrain.io-Boxhead-0.2.43";
const contentToCache = [
    "Build/485a3380149a8805aa4738bd1613523a.loader.js",
    "Build/50e4f1a239c95fb4ebd19d245323bf5c.framework.js.unityweb",
    "Build/76a4b1423d763aa6b167eb8707e71f2d.data.unityweb",
    "Build/fc0b825989c4e0e1ff13da9d6e6ba27f.wasm.unityweb",
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
