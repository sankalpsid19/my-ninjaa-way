// My Ninjaa Way (MNW) Service Worker
const CACHE_NAME = 'mnw-pwa-v1';

self.addEventListener('install', (event) => {
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
  // Only handle GET requests, bypass all others (mutations, server actions)
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-first pass-through for online-centric PWA
  event.respondWith(
    fetch(event.request).catch(() => {
      // If navigation fails completely due to no internet, return a friendly offline message
      if (event.request.mode === 'navigate') {
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>My Ninjaa Way - Offline</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
              .card { background: #18181b; border: 1px solid #27272a; padding: 32px 24px; border-radius: 20px; max-width: 400px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              .badge { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 48px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; font-weight: 900; font-size: 16px; border-radius: 12px; margin-bottom: 20px; letter-spacing: 1px; }
              h1 { font-size: 20px; margin: 0 0 8px; font-weight: 700; color: #fff; }
              p { font-size: 14px; color: #a1a1aa; margin: 0 0 24px; line-height: 1.5; }
              button { background: #2563eb; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
              button:hover { background: #1d4ed8; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="badge">MNW</div>
              <h1>No Internet Connection</h1>
              <p>My Ninjaa Way requires an active internet connection. Please check your network and try again.</p>
              <button onclick="window.location.reload()">Retry Connection</button>
            </div>
          </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html' },
          }
        );
      }
      return Promise.reject();
    })
  );
});
