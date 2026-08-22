/* =============================================================================
 *  KONUT PANEL — Service Worker (PWA)
 *  Cache-First for App Shell & Precached Assets, Network-First for Navigation
 * ========================================================================== */

const CACHE_NAME = 'konutpanel-v15';

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
  '/icons/badge-96.png',
  '/icons/badge-72.png',
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


/* ═══════════════════════════════════════════════════════════════
   WEB PUSH — uygulama kapaliyken gelen bildirimler
   Sunucudan (Netlify Function) gonderilen push mesajlari burada
   yakalanir ve Android bildirimi olarak gosterilir. TWA'da
   DelegationService devrede oldugu icin bildirim "Chrome" degil
   "Konut Panel" adiyla dusar.
   ═══════════════════════════════════════════════════════════════ */

self.addEventListener('push', (event) => {
  let veri = {};
  try {
    veri = event.data ? event.data.json() : {};
  } catch (e) {
    veri = { baslik: 'Konut Panel', govde: event.data ? event.data.text() : '' };
  }

  const baseOrigin = self.location ? self.location.origin : '';
  const defaultIcon = baseOrigin ? `${baseOrigin}/icons/icon-192.png` : '/icons/icon-192.png';
  const defaultBadge = baseOrigin ? `${baseOrigin}/icons/badge-96.png` : '/icons/badge-96.png';

  const iconUrl = veri.ikon
    ? (veri.ikon.startsWith('http') ? veri.ikon : (baseOrigin + veri.ikon))
    : defaultIcon;
  const badgeUrl = veri.rozet
    ? (veri.rozet.startsWith('http') ? veri.rozet : (baseOrigin + veri.rozet))
    : defaultBadge;

  const baslik = veri.baslik || 'Konut Panel';
  const secenekler = {
    body: veri.govde || '',
    icon: iconUrl,
    badge: badgeUrl,
    tag: veri.etiket || 'konutpanel-genel',
    renotify: true,
    requireInteraction: veri.onemli === true,
    // Titresim deseni — sessiz moddaki cihazlarda da fark edilir
    vibrate: [220, 90, 220, 90, 380],
    data: {
      url: veri.url || '/uygulama',
      tur: veri.tur || 'genel',
      kayitId: veri.kayitId || null
    },
    actions: veri.aksiyonlar || []
  };

  event.waitUntil(self.registration.showNotification(baslik, secenekler));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const hedef = (event.notification.data && event.notification.data.url) || '/uygulama';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((liste) => {
      // Uygulama zaten acikssa o pencereyi one al ve ilgili sayfaya yonlendir
      for (const istemci of liste) {
        if ('focus' in istemci) {
          istemci.postMessage({ tip: 'bildirim-tiklandi', veri: event.notification.data });
          return istemci.focus();
        }
      }
      // Acik pencere yoksa yenisini ac
      if (self.clients.openWindow) return self.clients.openWindow(hedef);
    })
  );
});

/* Abonelik suresi dolarsa sessizce yenile */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((yeniAbonelik) => fetch('/.netlify/functions/push-abone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abonelik: yeniAbonelik, yenileme: true })
      }))
      .catch(() => {})
  );
});
