/**
 * =============================================================================
 *  KONUT PANEL — PWA Kurulum Sistemi (install.js)
 *  Tüm platformlar için akıllı kurulum ve rehberlik yöneticisi.
 * =============================================================================
 */

(function () {
  'use strict';

  // Global State
  let deferredPrompt = null;
  let isPromptPending = false;

  // DOM Elemanları
  let installButtons = [];
  let modalBackdrop = null;
  let modalContainer = null;
  let toastElement = null;

  /* ═══════════════════════════════════════════════════════════════════════════
   * 1. PLATFORM VE ORTAM TESPİTİ
   * ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Uygulamanın zaten PWA/Standalone modda çalışıp çalışmadığını belirler.
   */
  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true ||
      (document.referrer && document.referrer.startsWith('android-app://'))
    );
  }

  /**
   * Kullanıcının işletim sistemi ve tarayıcısını hassas şekilde tespit eder.
   * iPadOS 13+ cihazların kendilerini Mac olarak tanıtma durumunu (maxTouchPoints) yönetir.
   */
  function getPlatform() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    const isIOSDevice =
      /iphone|ipad|ipod/i.test(ua) ||
      (platform === 'MacIntel' && maxTouchPoints > 1 && !window.MSStream);

    if (isIOSDevice) {
      // iOS üzerinde Safari mi yoksa Chrome/Firefox/Edge/diğer WebKit webview mı?
      const isSafari =
        /Safari/i.test(ua) &&
        !/CriOS/i.test(ua) &&
        !/FxiOS/i.test(ua) &&
        !/EdgiOS/i.test(ua) &&
        !/OPiOS/i.test(ua);
      return isSafari ? 'ios-safari' : 'ios-other';
    }

    const isAndroid = /Android/i.test(ua);
    if (isAndroid) {
      const isChrome = /Chrome/i.test(ua) && !/Firefox/i.test(ua) && !/OPR/i.test(ua);
      return isChrome ? 'android-chrome' : 'android-other';
    }

    // Masaüstü Platformları
    const isMac = /Macintosh|MacIntel/i.test(platform) || /Mac OS X/i.test(ua);
    const isSafariDesktop =
      isMac && /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Chromium/i.test(ua);
    if (isSafariDesktop) return 'desktop-safari';

    const isChromiumDesktop = /Chrome|Chromium|Edg/i.test(ua) && !/OPR/i.test(ua);
    if (isChromiumDesktop) return 'desktop-chromium';

    const isFirefox = /Firefox/i.test(ua);
    if (isFirefox) return 'desktop-firefox';

    return 'unsupported';
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2. PWA ETKİNLİK DİNLEYİCİLERİ (beforeinstallprompt & appinstalled)
   * ═══════════════════════════════════════════════════════════════════════════ */

  window.addEventListener('beforeinstallprompt', (e) => {
    // Tarayıcının kendi otomatik mini-banner'ını engelle
    e.preventDefault();
    deferredPrompt = e;
    window.__pwaDeferredPrompt = e;
    console.log('[PWA] beforeinstallprompt olayı yakalandı. Doğrudan kurulum hazır.');
    updateInstallButtonLabels();
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Uygulama başarıyla kuruldu.');
    deferredPrompt = null;
    window.__pwaDeferredPrompt = null;
    try {
      localStorage.setItem('pwa_installed', 'true');
      localStorage.setItem('pwa_installed_at', Date.now().toString());
    } catch (_) {}

    hideInstallButtons();
    closeModal();
    showToast('Konut Panel başarıyla yüklendi! Ana ekranınızdan açabilirsiniz.');
  });

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3. BUTON DAVRANIŞLARI VE ARAYÜZ YÖNETİMİ
   * ═══════════════════════════════════════════════════════════════════════════ */

  function findInstallButtons() {
    return Array.from(
      document.querySelectorAll(
        '[data-pwa-install], #kurBtn1, #kurBtn2, .pwa-install-trigger'
      )
    );
  }

  function updateInstallButtonLabels() {
    installButtons = findInstallButtons();
    const platform = getPlatform();
    const isMobile = platform.startsWith('ios') || platform.startsWith('android');
    const labelText = isMobile ? 'Ana Ekrana Ekle' : 'Uygulamayı Yükle';

    installButtons.forEach((btn) => {
      const textSpan = btn.querySelector('span, b') || btn;
      if (textSpan && textSpan.getAttribute('data-static-text') !== 'true') {
        textSpan.textContent = labelText;
      }
      btn.style.display = '';
    });
  }

  function hideInstallButtons() {
    installButtons = findInstallButtons();
    installButtons.forEach((btn) => {
      btn.style.display = 'none';
    });
  }

  /**
   * Kurulum butonuna tıklandığında çalışan ana fonksiyon.
   */
  async function handleInstallClick(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    // 1. Zaten Standalone Moddaysa
    if (isStandalone()) {
      showToast('Konut Panel zaten uygulama olarak açık.');
      return;
    }

    const targetButton = e && e.currentTarget ? e.currentTarget : null;

    // 2. Android Chrome / Masaüstü Chrome-Edge (deferredPrompt varsa doğrudan native prompt)
    if (deferredPrompt && !isPromptPending) {
      try {
        isPromptPending = true;
        if (targetButton) targetButton.classList.add('pwa-btn-loading');

        console.log('[PWA] Native deferredPrompt.prompt() tetikleniyor...');
        await deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] Kullanıcı seçimi:', outcome);

        // Kullanılan prompt bir daha geçerli olmaz; InvalidStateError önlemek için null'la
        deferredPrompt = null;
        window.__pwaDeferredPrompt = null;

        if (outcome === 'accepted') {
          hideInstallButtons();
          showToast('Uygulama yükleniyor...');
        } else {
          try {
            localStorage.setItem('pwa_dismissed_at', Date.now().toString());
          } catch (_) {}
        }
      } catch (err) {
        console.warn('[PWA] Prompt hatası:', err);
        openManualInstructionsModal();
      } finally {
        isPromptPending = false;
        if (targetButton) targetButton.classList.remove('pwa-btn-loading');
      }
      return;
    }

    // 3. deferredPrompt yoksa veya iOS / masaüstü safari / diğer platformlar
    openManualInstructionsModal();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 4. PLATFORMA ÖZEL REHBER MODAL ŞABLONLARI
   * ═══════════════════════════════════════════════════════════════════════════ */

  function getModalContentForPlatform(platform) {
    switch (platform) {
      case 'ios-safari':
        return {
          title: 'iPhone / iPad Kurulumu',
          subtitle: 'Konut Panel’i ana ekranınıza ekleyin',
          badgeText: 'iOS Safari Rehberi',
          steps: [
            {
              num: '1',
              html: `Safari alt çubuğundaki <b>Paylaş</b> (<svg class="pwa-inline-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>) simgesine dokunun.`
            },
            {
              num: '2',
              html: `Aşağı kaydırıp <b>“Ana Ekrana Ekle”</b> (<svg class="pwa-inline-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>) seçeneğine dokunun.`
            },
            {
              num: '3',
              html: `Sağ üst köşedeki <b>“Ekle”</b> butonuna basarak kurulumu tamamlayın.`
            }
          ],
          actionText: 'Anladım'
        };

      case 'ios-other':
        return {
          title: 'Safari ile Açın',
          subtitle: 'iOS güvenlik kısıtlaması nedeniyle',
          badgeText: 'iOS Tarayıcı Uyarısı',
          steps: [
            {
              num: '1',
              html: `Apple kuralı gereği iOS'ta Ana Ekrana Ekleme <b>yalnızca Safari</b> tarayıcısından yapılabilir.`
            },
            {
              num: '2',
              html: `Aşağıdaki butona dokunarak sayfa adresini kopyalayın.`
            },
            {
              num: '3',
              html: `<b>Safari</b> uygulamasını açıp adresi yapıştırın ve Paylaş menüsünden ekleyin.`
            }
          ],
          actionText: 'Adresi Kopyala',
          isCopyAction: true
        };

      case 'android-chrome':
      case 'android-other':
        return {
          title: 'Android Kurulumu',
          subtitle: 'Konut Panel’i telefonunuza yükleyin',
          badgeText: 'Android Rehberi',
          steps: [
            {
              num: '1',
              html: `Tarayıcınızın sağ üstündeki <b>⋮ (üç nokta)</b> menüsüne dokunun.`
            },
            {
              num: '2',
              html: `Menüden <b>“Uygulamayı yükle”</b> veya <b>“Ana ekrana ekle”</b> seçeneğine dokunun.`
            },
            {
              num: '3',
              html: `Gelen onay penceresinde <b>“Yükle”</b> butonuna basarak bitirin.`
            }
          ],
          actionText: 'Anladım'
        };

      case 'desktop-safari':
        return {
          title: 'macOS Dock’a Ekle',
          subtitle: 'Konut Panel Masaüstü Uygulaması',
          badgeText: 'macOS Safari',
          steps: [
            {
              num: '1',
              html: `Üst macOS menü çubuğundan <b>Dosya (File)</b> menüsünü açın.`
            },
            {
              num: '2',
              html: `<b>“Dock’a Ekle…” (Add to Dock)</b> seçeneğine tıklayın.`
            },
            {
              num: '3',
              html: `Açılan pencerede <b>“Ekle”</b> butonuna basarak Dock’a sabitleyin.`
            }
          ],
          actionText: 'Tamam'
        };

      case 'desktop-firefox':
        return {
          title: 'Tarayıcı Desteği',
          subtitle: 'Hızlı masaüstü erişimi',
          badgeText: 'Firefox Bildirimi',
          steps: [
            {
              num: '1',
              html: `Firefox masaüstü sürümünde doğrudan PWA uygulama kurulumu desteklenmemektedir.`
            },
            {
              num: '2',
              html: `Tek tıkla masaüstü uygulaması için <b>Google Chrome</b> veya <b>Microsoft Edge</b> kullanabilirsiniz.`
            },
            {
              num: '3',
              html: `Veya sayfayı hızlıca açmak için <b>Ctrl+D</b> (Mac için <b>Cmd+D</b>) ile yer imlerinize ekleyin.`
            }
          ],
          actionText: 'Anladım'
        };

      default:
        return {
          title: 'Uygulamayı Yükle',
          subtitle: 'Konut Panel’i cihazınıza kurun',
          badgeText: 'Kurulum Rehberi',
          steps: [
            {
              num: '1',
              html: `Tarayıcınızın adres çubuğundaki <b>Yükle (⊕)</b> simgesine veya ayarlar menüsüne tıklayın.`
            },
            {
              num: '2',
              html: `<b>“Konut Panel Uygulamasını Yükle”</b> seçeneğini seçin.`
            },
            {
              num: '3',
              html: `Açılan pencereden <b>Yükle</b> butonuna basarak onaylayın.`
            }
          ],
          actionText: 'Anladım'
        };
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 5. MODAL OLUŞTURMA VE ETKİLEŞİM YÖNETİMİ
   * ═══════════════════════════════════════════════════════════════════════════ */

  function createModalDOM() {
    if (modalBackdrop) return;

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'pwa-modal-backdrop';
    modalBackdrop.id = 'pwaInstallModal';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'pwaModalTitle');

    modalBackdrop.innerHTML = `
      <div class="pwa-modal-card" id="pwaModalCard">
        <div class="pwa-sheet-handle"></div>
        <button class="pwa-modal-close" id="pwaModalCloseBtn" aria-label="Kapat">&times;</button>
        <div class="pwa-header">
          <img src="/icons/icon-192.png" alt="Konut Panel" class="pwa-app-icon" width="48" height="48" />
          <div class="pwa-title-wrap">
            <h3 id="pwaModalTitle">Konut Panel</h3>
            <p id="pwaModalSubtitle">Site ve Apartman Yönetim Programı</p>
          </div>
        </div>
        <div class="pwa-platform-badge" id="pwaPlatformBadge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span id="pwaBadgeText">Kurulum Rehberi</span>
        </div>
        <div class="pwa-steps" id="pwaStepsContainer"></div>
        <button class="pwa-btn-action" id="pwaModalActionBtn">Anladım</button>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    // Kapatma Olayları
    const closeBtn = modalBackdrop.querySelector('#pwaModalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('pwa-active')) {
        closeModal();
      }
    });

    // Mobil Swipe-to-close
    initSwipeToClose();
  }

  function openManualInstructionsModal() {
    createModalDOM();

    const platform = getPlatform();
    const content = getModalContentForPlatform(platform);

    const titleEl = document.getElementById('pwaModalTitle');
    const subEl = document.getElementById('pwaModalSubtitle');
    const badgeTextEl = document.getElementById('pwaBadgeText');
    const stepsContainer = document.getElementById('pwaStepsContainer');
    const actionBtn = document.getElementById('pwaModalActionBtn');

    if (titleEl) titleEl.textContent = content.title;
    if (subEl) subEl.textContent = content.subtitle;
    if (badgeTextEl) badgeTextEl.textContent = content.badgeText;

    if (stepsContainer) {
      stepsContainer.innerHTML = content.steps
        .map(
          (s) => `
        <div class="pwa-step-item">
          <span class="pwa-step-num">${s.num}</span>
          <div>${s.html}</div>
        </div>
      `
        )
        .join('');
    }

    if (actionBtn) {
      actionBtn.textContent = content.actionText;
      actionBtn.onclick = async () => {
        if (content.isCopyAction) {
          try {
            await navigator.clipboard.writeText(window.location.href);
            actionBtn.textContent = 'Adres Kopyalandı ✓';
            setTimeout(() => {
              closeModal();
            }, 1200);
          } catch (_) {
            closeModal();
          }
        } else {
          closeModal();
        }
      };
    }

    modalBackdrop.classList.add('pwa-active');
    document.body.style.overflow = 'hidden';

    // Focus Trap
    const closeBtn = document.getElementById('pwaModalCloseBtn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('pwa-active');
    document.body.style.overflow = '';
  }

  function initSwipeToClose() {
    const card = document.getElementById('pwaModalCard');
    if (!card) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    card.addEventListener(
      'touchstart',
      (e) => {
        if (card.scrollTop === 0) {
          startY = e.touches[0].clientY;
          isDragging = true;
        }
      },
      { passive: true }
    );

    card.addEventListener(
      'touchmove',
      (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
          card.style.transform = `translateY(${diff}px)`;
        }
      },
      { passive: true }
    );

    card.addEventListener(
      'touchend',
      () => {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentY - startY;
        if (diff > 100) {
          closeModal();
        }
        card.style.transform = '';
      },
      { passive: true }
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 6. TOAST BİLDİRİMİ
   * ═══════════════════════════════════════════════════════════════════════════ */

  function showToast(message) {
    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.className = 'pwa-toast';
      toastElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span id="pwaToastMsg"></span>
      `;
      document.body.appendChild(toastElement);
    }

    const msgSpan = toastElement.querySelector('#pwaToastMsg');
    if (msgSpan) msgSpan.textContent = message;

    toastElement.classList.add('pwa-toast-show');
    clearTimeout(toastElement._timer);
    toastElement._timer = setTimeout(() => {
      toastElement.classList.remove('pwa-toast-show');
    }, 4000);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 7. PWA TEŞHİS VE DEBUG FONKSİYONU (window.debugPWA)
   * ═══════════════════════════════════════════════════════════════════════════ */

  window.debugPWA = async function () {
    console.group('%c[PWA TEŞHİS PANELİ] Konut Panel PWA Denetimi', 'color:#7C5CFF;font-weight:bold;font-size:14px;');

    const results = [];
    const pushRes = (check, passed, details) => {
      results.push({
        'Kriter / Test': check,
        'Durum': passed ? '✅ GEÇTİ' : '❌ BAŞARISIZ',
        'Detay': details
      });
    };

    // 1. HTTPS / Secure Context
    const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    pushRes('HTTPS / Güvenli Bağlantı', isSecure, isSecure ? 'HTTPS aktif' : 'HTTPS zorunludur!');

    // 2. Manifest Bağlantısı ve Erişilebilirlik
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink && manifestLink.href) {
      try {
        const manifestRes = await fetch(manifestLink.href);
        if (manifestRes.ok) {
          const manifestJson = await manifestRes.json();
          pushRes(
            'Manifest JSON',
            true,
            `Adı: "${manifestJson.name}", Kısa Adı: "${manifestJson.short_name}", Start URL: "${manifestJson.start_url}"`
          );
        } else {
          pushRes('Manifest JSON', false, `HTTP ${manifestRes.status} döndü`);
        }
      } catch (err) {
        pushRes('Manifest JSON', false, `JSON ayrıştırma hatası: ${err.message}`);
      }
    } else {
      pushRes('Manifest Link', false, '<head> içinde <link rel="manifest"> bulunamadı!');
    }

    // 3. Service Worker Kaydı
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          pushRes('Service Worker', true, `Kayıtlı SW sayısı: ${registrations.length}, Scope: "${registrations[0].scope}"`);
        } else {
          pushRes('Service Worker', false, 'Kayıtlı Service Worker bulunamadı.');
        }
      } catch (err) {
        pushRes('Service Worker', false, err.message);
      }
    } else {
      pushRes('Service Worker', false, 'Tarayıcı Service Worker desteklemiyor.');
    }

    // 4. İkon Erişilebilirliği (Standart ve Maskable)
    const iconUrls = [
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/icon-maskable-192.png',
      '/icons/icon-maskable-512.png',
      '/icons/apple-touch-icon-180.png',
      '/screenshots/desktop-1280x720.png',
      '/screenshots/mobile-720x1280.png'
    ];

    for (const iconUrl of iconUrls) {
      try {
        const iconRes = await fetch(iconUrl);
        pushRes(
          `Varlık Kontrolü (${iconUrl})`,
          iconRes.ok,
          iconRes.ok ? `HTTP 200 OK (${iconRes.headers.get('content-type')}, ${iconRes.headers.get('content-length') || '?'} bytes)` : `HTTP ${iconRes.status}`
        );
      } catch (err) {
        pushRes(`Varlık Kontrolü (${iconUrl})`, false, err.message);
      }
    }

    // 5. Standalone / Kurulu Durumu
    const standaloneState = isStandalone();
    pushRes('isStandalone() Durumu', true, standaloneState ? 'EVET (Standalone Modda Açık)' : 'HAYIR (Tarayıcı Sekmesinde Açık)');

    // 6. getInstalledRelatedApps Durumu
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        pushRes('getInstalledRelatedApps()', true, relatedApps.length > 0 ? `Kurulu (${relatedApps.length} app)` : '0 adet');
      } catch (e) {
        pushRes('getInstalledRelatedApps()', false, e.message);
      }
    } else {
      pushRes('getInstalledRelatedApps()', true, 'API desteklenmiyor (normal)');
    }

    // 7. beforeinstallprompt Durumu
    const hasPrompt = !!deferredPrompt;
    let promptReason = '';
    if (hasPrompt) {
      promptReason = 'READY (deferredPrompt hazır ve butona tıklanınca native dialog açılacak)';
    } else if (standaloneState) {
      promptReason = 'Uygulama zaten PWA olarak kurulu ve çalışıyor.';
    } else if (getPlatform().startsWith('ios')) {
      promptReason = 'iOS Safari beforeinstallprompt desteklemez (Özel Paylaş -> Ana Ekrana Ekle rehberi aktif).';
    } else {
      promptReason = 'Henüz tetiklenmedi (Kullanıcı henüz sayfayla etkileşime girmedi veya PWA kriterleri kontrol ediliyor).';
    }
    pushRes('beforeinstallprompt Olayı', hasPrompt || standaloneState, promptReason);

    // 8. Platform Tespiti
    pushRes('Tespit Edilen Platform', true, getPlatform());

    console.table(results);
    console.groupEnd();

    return results;
  };

  /* ═══════════════════════════════════════════════════════════════════════════
   * 8. BAŞLATMA (INIT)
   * ═══════════════════════════════════════════════════════════════════════════ */

  function init() {
    // 1. Zaten Standalone ise butonları gizle
    if (isStandalone()) {
      hideInstallButtons();
      return;
    }

    // 2. Butonları bul ve click olaylarını bağla
    installButtons = findInstallButtons();
    installButtons.forEach((btn) => {
      btn.addEventListener('click', handleInstallClick);
    });

    updateInstallButtonLabels();

    // 3. Service Worker Kaydı (window load anında)
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[SW] Service Worker kayıt başarılı, scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[SW] Service Worker kayıt hatası:', err);
          });
      };
      // 'load' olayi zaten gectiyse beklemeden kaydet
      if (document.readyState === 'complete') registerSW();
      else window.addEventListener('load', registerSW);
    }

    // 4. getInstalledRelatedApps kontrolü
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then((apps) => {
        if (apps && apps.length > 0) {
          console.log('[PWA] Cihazda kurulu uygulama bulundu:', apps);
          hideInstallButtons();
        }
      }).catch(() => {});
    }
  }

  // DOM hazır olduğunda başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
