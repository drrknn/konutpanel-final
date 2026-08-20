/* =============================================================================
 *  KONUT PANEL — Service Worker (PWA)
 *  Cache-First for App Shell & Precached Assets, Network-First for Navigation
 * ========================================================================== */

const CACHE_NAME = 'konutpanel-v7';

const PRECACHE_ASSETS = [
  '/',
  '/?source=pwa',
  '/anasayfa.html',
  '/index.html',
  '/offline.html',
  '/install-modal.css',
  '/install.js',
  '/manifest.webmanifest',
  '/icons/favicon-32.png',
  '/icons/apple-touch-icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/screenshots/desktop-1280x720.png',
  '/screenshots/mobile-720x1280.png'
];

// 1. Kurulum (Install) — App shell önbelleğe alınır
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache asset uyarisi:', err);
      });
    })
  );
});

// 2. Etkinleştirme (Activate) — Eski önbellekler temizlenir
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eski onbellek temizleniyor:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. İstek Yönetimi (Fetch)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Yalnızca GET isteklerini işle
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API, Supabase ve harici servislere yapılan istekleri önbelleğe alma
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/.netlify/functions/')
  ) {
    return;
  }

  // Navigasyon (Sayfa açma / HTML) istekleri -> Network-First, hata durumunda offline.html
  if (req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Cevrimdisi: Baglanti saglanamadi.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Statik Varlıklar (App Shell, CSS, JS, İkonlar) -> Cache-First
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) {
          // Arka planda güncelle (stale-while-revalidate benzeri tazeleme)
          fetch(req).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
            }
          }).catch(() => {});
          return cachedRes;
        }

        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        });
      })
    );
  }
});
