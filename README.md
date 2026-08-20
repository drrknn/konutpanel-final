# Konut Panel

Site ve apartman yönetim programı. Aidat takibi, kasa hareketleri, arıza
kayıtları, duyurular, toplantı ve anket yönetimi tek panelde.

Yayında: **[konutpanel.com](https://konutpanel.com)**

---

## Teknoloji

| Katman | Kullanılan |
|---|---|
| Ön yüz | Vanilla JS, tek dosyalı HTML sayfaları |
| Veritabanı / kimlik | Supabase (PostgreSQL + Auth + Storage, RLS ile korunur) |
| Barındırma | Netlify (statik + serverless functions) |
| E-posta | Resend |
| Yapay zekâ | Google Gemini (makale üretimi) |
| Yerel sunucu | Express (`server.js`) |
| Mobil | PWA + Google Play'de TWA paketi |

---

## Dosya yapısı

```
├── anasayfa.html              Tanıtım sayfası (kök adres buraya yönlenir)
├── index.html                 Uygulama — sakin ve yönetici paneli
├── admin.html                 Sistem yöneticisi paneli
│
├── site-yonetim-programi.html SEO açılış sayfaları
├── apartman-yonetim-programi.html
├── aidat-takip-programi.html
│
├── gizlilik.html              Yasal metinler
├── kullanim-kosullari.html
├── kvkk.html
├── veri-isleyen-sozlesmesi.html
├── offline.html               Bağlantı yokken gösterilen sayfa
│
├── config.js                  Supabase genel anahtarları (tarayıcıda görünür)
├── i18n.js                    Çok dilli metinler (TR / EN / RU / DE)
├── install.js                 PWA kurulum akışı ve platform tespiti
├── install-modal.css          Kurulum yönergesi görünümü
├── sw.js                      Service worker — önbellek ve çevrimdışı
├── manifest.webmanifest       PWA tanımı
├── server.js                  Yerel geliştirme sunucusu
├── netlify.toml               Yönlendirmeler, başlıklar, işlev ayarları
│
├── netlify/functions/
│   ├── sayfa.mjs              Blog ve dinamik sayfa üretimi
│   ├── makale-uret.mjs        Gemini ile içerik üretimi
│   ├── muhasebeci-mail.mjs    Muhasebeciye ZIP ekli dönem dökümü
│   └── sifre-sifirla.mjs      Şifre sıfırlama akışı
│
├── scripts/
│   ├── generate_icons.js              Kaynak SVG'den ikon üretimi
│   ├── generate_standard_pwa_assets.js
│   ├── verify_pwa_assets.js           Yayın öncesi PWA doğrulaması
│   └── seed_pilot_data.mjs            Pilot veri yükleme
│
├── icons/                     PWA ve favicon varlıkları
├── screenshots/               Mağaza ve kurulum penceresi görselleri
└── .well-known/assetlinks.json  Android TWA doğrulaması
```

---

## Kurulum

```bash
npm install
cp .env.example .env     # değerleri doldurun
npm run dev              # http://localhost:3000
```

`config.js` içindeki Supabase anahtarı tarayıcıya açıktır ve olması
gerektiği gibidir; veriyi RLS politikaları korur. **`service_role`
anahtarı buraya asla yazılmaz.**

---

## Yayına alma

Netlify, `main` dalına gelen her commit'te otomatik derler.

Ortam değişkenlerini Netlify panelinden tanımlayın; liste
`.env.example` içinde.

Yayın sonrası PWA varlıklarını doğrulamak için:

```bash
node scripts/verify_pwa_assets.js
```

---

## Bilinmesi gerekenler

**Binary dosyalara AI araçlarıyla dokunmayın.** `icons/` ve
`screenshots/` altındaki PNG dosyaları bir kez UTF-8 bozulmasına
uğradı (her baytın `0x7F` üstü değerleri bozuldu) ve PWA kurulumu
tamamen devre dışı kaldı. Görselleri yalnızca `scripts/` altındaki
üreticilerle veya elle değiştirin.

**Service worker sürümü.** `sw.js` içindeki `CACHE_NAME` değeri
statik varlıklar değiştiğinde artırılmalıdır, aksi halde kullanıcılar
eski dosyaları görmeye devam eder.

**assetlinks.json.** Android uygulamasının adres çubuğu olmadan
açılması bu dosyaya bağlıdır. İçindeki parmak izleri Play Console'daki
imzalama anahtarlarıyla eşleşmelidir ve dosya uzun süreli önbelleğe
alınmamalıdır.

---

## Belgeler

| Dosya | İçerik |
|---|---|
| `PROJE-EL-KITABI.md` | Veritabanı şeması, RLS, roller, modül modül durum |
| `GUVENLIK.md` | Güvenlik önlemleri ve yayın öncesi kontrol listesi |
| `CLAUDE.md` | Yapay zekâ asistanları için proje kuralları |
| `DEGISIKLIK-GUNLUGU.md` | Sürüm geçmişi, SQL yamaları, kurulum notları |
