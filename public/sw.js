// My Ninjaa Way (MNW) Service Worker
const CACHE_NAME = 'mnw-pwa-v2';

const PRECACHE_ASSETS = [
  '/calorie-calculator',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/apple-touch-icon.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests, bypass mutations and actions
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Stale-While-Revalidate for static Next.js assets, icons, fonts
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 2. Navigation requests: Network-first with Cache fallback (Offline Calorie Calculator)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network failed, try to serve from cache (e.g. /calorie-calculator)
          return caches.match(event.request).then((cached) => {
            if (cached) {
              return cached;
            }
            // If completely uncached and offline, return the branded offline card
            return new Response(
              `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
                <title>My Ninjaa Way - Offline</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
                  .card { background: #18181b; border: 1px solid #27272a; padding: 32px 24px; border-radius: 24px; max-width: 400px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                  .badge { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 50px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; font-weight: 900; font-size: 16px; border-radius: 14px; margin-bottom: 20px; letter-spacing: 1px; }
                  h1 { font-size: 20px; margin: 0 0 8px; font-weight: 700; color: #fff; }
                  p { font-size: 14px; color: #a1a1aa; margin: 0 0 24px; line-height: 1.5; }
                  .btn { display: inline-block; background: #2563eb; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: background 0.2s; }
                  .btn:hover { background: #1d4ed8; }
                  .btn-outline { background: transparent; border: 1px solid #3f3f46; color: #d4d4d8; margin-top: 10px; display: block; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="badge">MNW</div>
                  <h1>No Internet Connection</h1>
                  <p>You appear to be offline. However, the Calorie Calculator can be used offline!</p>
                  <a href="/calorie-calculator" class="btn">Open Calorie Calculator</a>
                  <button onclick="window.location.reload()" class="btn btn-outline">Retry Connection</button>
                </div>
              </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          });
        })
    );
    return;
  }

  // 3. All other requests: simple network pass-through
  event.respondWith(fetch(event.request));
});
