const CACHE = 'ceto-senaryo-v4.1';

const LOCAL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

const PDFJS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    await cache.addAll(LOCAL);

    for (const url of PDFJS) {
      try {
        const response = await fetch(url, { mode: 'cors' });

        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (e) {}
    }

    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    for (const key of keys) {
      if (key !== CACHE) {
        await caches.delete(key);
      }
    }

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request, {
      ignoreSearch: true
    });

    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(event.request);

      if (response && (response.ok || response.type === 'opaque')) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }

      return response;

    } catch (e) {
      if (event.request.mode === 'navigate') {
        return await caches.match('./index.html');
      }

      throw e;
    }
  })());
});
