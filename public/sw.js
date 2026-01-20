const CACHE_NAME = 'bolpur-mart-v2.1';
const OFFLINE_URL = '/offline.html';
const CACHE_LIMIT = 50 * 1024 * 1024; // 50MB

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/bolpur-mart-192.png',
  '/icons/bolpur-mart-512.png',
  '/offline.html',
];

// Helper to check quota/usage
async function checkCacheSizeAndPrune() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    if (usage > CACHE_LIMIT) {
      // Pruning logic - simpler to just clear old caches or specific large files
      // For this implementation, we'll just log warning or clear all but current
      caches.keys().then((names) => {
        names.forEach(name => {
          if (name !== CACHE_NAME) caches.delete(name);
        });
      });
    }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL) || caches.match('/');
        })
    );
    return;
  }

  // Cache-First Strategy for static assets/images
  if (event.request.destination === 'image' || event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            checkCacheSizeAndPrune();
            return networkResponse;
          });
          return cachedResponse || fetchedResponse;
        });
      })
    );
    return;
  }

  // Network-First for API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Stale-While-Revalidate default
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
