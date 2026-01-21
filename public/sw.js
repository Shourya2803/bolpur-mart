const CACHE_NAME = 'bolpur-mart-v2.3'; // Bumped version
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
    if (usage && quota && usage > CACHE_LIMIT * 0.9) {
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
  // Navigation fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL) || caches.match('/');
        })
    );
    return;
  }

  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') {
    return;
  }

  // Cache-First: Images, Styles, Scripts (FIXED)
  if (event.request.destination === 'image' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script') {

    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(event.request).then((networkResponse) => {
            // CLONE ONCE at start
            const responseToCache = networkResponse.clone();

            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Cache the clone (safe)
            cache.put(event.request, responseToCache).catch(err => {
              console.warn('Cache put failed:', err);
            });

            checkCacheSizeAndPrune();
            return networkResponse; // Return original
          }).catch(() => {
            return caches.match('/');
          });
        });
      })
    );
    return;
  }

  // Network-First: API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate: Everything else (CRITICAL FIX)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // CRITICAL: Clone ONCE immediately
        const responseToCache = networkResponse.clone();

        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache clone (never touch original)
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache).catch(err => {
            console.warn('Cache put failed:', event.request.url, err);
          });
        });

        return networkResponse; // Always return original
      }).catch(() => {
        return caches.match(event.request) || caches.match('/');
      });

      return cachedResponse || fetchPromise;
    })
  );
});
