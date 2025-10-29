const cacheName = "com.crazygames-Cyladron-0.1.32";
const contentToCache = [
    "Build/52603c653361f94488e1c36b60bc3697.loader.js",
    "Build/510a11f5b2dd040ad19ef172361b2e72.framework.js.unityweb",
    "Build/a6b30ad6c053fda84d749c61c0a74f45.data.unityweb",
    "Build/db6d45a154d5a50a76bbc738c8c07fcb.wasm.unityweb",
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
