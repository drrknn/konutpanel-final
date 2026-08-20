# KONUT PANEL — PROJE EL KİTABI

> Bu belge tek başına yeterlidir. Başka bir AI asistanına program dosyalarıyla
> birlikte verildiğinde, önceki hiçbir konuşmayı görmeden projeyi anlayıp
> güvenle değişiklik yapabilmelidir. Tahmin edilmiş hiçbir bilgi yoktur —
> her satır ya kaynak koddan ya da kullanıcının onayladığı gerçek veritabanı
> şemasından doğrulanmıştır.
>
> Hazırlanma tarihi: Ağustos 2026

---

## 1 · PROJE NEDİR

**Konut Panel** — Türkiye'deki site ve apartman yönetimleri için bulut
tabanlı yönetim yazılımı (SaaS). Tek kişilik girişim (Haydar Kenan Kılıç,
Mersin), henüz ödeyen müşterisi yok, ürün geliştirme aşamasını tamamlamış,
satış aşamasına geçiyor.

**Rakip:** Blok Görevlisi. Konut Panel bilinçli olarak premium fiyatlandı
(aylık 100 ₺/daire, yıllık 60 ₺/daire — KDV hariç), gerekçe: rakiplerin asıl
gelirinin banka/kart tahsilat komisyonundan geldiği, abonelik ücretinin
düşük tutulduğu değerlendirmesi.

**Temel çalışma mantığı:** Her site (`siteler` tablosu) kendi izole
tenant'ı. Kullanıcılar bir siteye ya davet koduyla (sakin/görevli) ya da
başvuru+onay ile (ek yönetici) bağlanır. Bir kullanıcı her zaman tam olarak
bir siteye ve bir role bağlıdır — istisna: aynı kişi hem yönetici hem sakin
olabilir (aşağıda açıklanıyor).

---

## 2 · TEKNOLOJİ YIĞINI

| Katman | Teknoloji |
|---|---|
| Frontend | **Vanilla JavaScript** — framework yok, build sistemi yok, `package.json` yok |
| Backend | Yok — Supabase Postgres RPC fonksiyonları backend görevi görür |
| Database | Supabase (PostgreSQL + PostgREST + Row Level Security) |
| Authentication | Supabase Auth (e-posta/şifre biçiminde, ama sahte e-posta ile) |
| Storage | Supabase Storage — 3 kova: `fotolar`, `belgeler`, `makbuzlar` |
| Sunucu tarafı iş | Netlify Functions (`.mjs`, Deno uyumlu `export default`) |
| CDN | `@supabase/supabase-js@2`, yalnızca `esm.sh` üzerinden yüklenir |
| Hosting | Netlify, **manuel zip yükleme** ile deploy edilir (Git bağlantısı yok) |

**Önemli:** Bu proje kasıtlı olarak framework'süz tutulmuştur. React, Vue,
bundler, npm paket ekleme gibi öneriler yapmadan önce kullanıcıya sor.

---

## 3 · DOSYA YAPISI

```
index.html                       Sakin + yönetici + görevli uygulaması
                                  (~4700 satır, TEK dosya, çok ekranlı SPA)
admin.html                       Süper-admin paneli (~1370 satır)
anasayfa.html                    Tanıtım sayfası (kaydırmalı slayt sistemi)
site-yonetim-programi.html       SEO içerik sayfası
apartman-yonetim-programi.html   SEO içerik sayfası
aidat-takip-programi.html        SEO içerik sayfası
config.js                        window.KONUT_PANEL_CONFIG =
                                    {SUPABASE_URL, SUPABASE_ANON_KEY}
manifest.json, sw.js             PWA — "ana ekrana ekle" için gerekli,
                                  service worker asgari düzeyde (önbellek yapmaz)
netlify.toml                     Yönlendirmeler + CSP + güvenlik başlıkları
robots.txt

netlify/functions/
  sifre-sifirla.mjs              service_role gerektiren şifre sıfırlama
  makale-uret.mjs                Gemini API ile SEO blog makalesi üretimi
  sayfa.mjs                      Blog/makale/sitemap/RSS sunucu tarafı üretimi

sql/
  konutpanel-kurulum.sql         Ana kurulum — TEK dosyada büyük kısım şema
  yama-profil.sql                Profil düzenleme + şifre değiştirme
  yama-coklu-yonetici.sql        Çoklu yönetici, başvuru/onay akışı
  yama-kod-sifre.sql             Kod biçimi (önek+rakam) + kod↔şifre girişi
  yama-kisi-sil.sql              Kişi silme (2 modlu: anonimleştir/tam sil)
  yama-bildiri.sql               talepler.tur alanı, fotoğraf zorunluluğu
  yama-bildirim.sql              Uygulama içi bildirim sistemi (9 tetikleyici)
  yama-rezervasyon-onay.sql      Rezervasyon onay akışı — temel
  yama-rezervasyon-2.sql         Rezervasyon — reddedilen durumu düzeltmesi
  yama-demirbas-yetki.sql        Demirbaş görüntüleme/düzenleme yetki ayrımı
  yama-talep-rls-duzelt.sql      talepler RLS kök sebep düzeltmesi (KRİTİK, aşağıda)
  yama-makbuz.sql                Dijital makbuz + imza sistemi (tablo+Storage+6 RPC)

⚠ Bu yama dosyaları HENÜZ ana kurulum dosyasıyla birleştirilmedi.
  Sıfırdan bir ortamda kurulum yapılıyorsa hepsi YUKARIDAKİ SIRAYLA
  tek tek çalıştırılmalı. Sıra önemli çünkü bazı yamalar öncekinin
  eklediği sütun/fonksiyona bağımlı.
```

---

## 4 · VERİTABANI ŞEMASI (DOĞRULANMIŞ, GERÇEK)

Aşağıdaki şema kullanıcının Supabase panelinden aldığı gerçek
`information_schema` dökümüdür — tahmin değildir. Yorumlar sonradan
eklenmiştir.

```sql
-- ═══ ÇEKİRDEK ═══

siteler
  id, ad, adres, iban, iban_sahibi, aidat_tutari, takip_baslangic,
  makbuz_sayac,                    -- kullanılmıyor, makbuz no'su artık
                                    --   yama-makbuz.sql'de site.kod_oneki'nden üretiliyor
  abonelik_durumu ('pilot'|'odeyen'|'pasif'),
  abonelik_daire_ucreti,
  kurallar, aktif, created_at,
  lisans_durumu ('deneme'|'aktif'|'askida'|'iptal'),
  lisans_bitis, lisans_paket, lisans_notu, lisans_guncelleme,
  kod_oneki                        -- "CS", "PK" gibi 2 harfli site öneki

profiller  (id = auth.users.id)
  id, site_id, rol, ad, telefon, daire_id, aktif, created_at, guncelleme,
  sorumlu_bloklar (array),         -- yalnızca blok_yonetici için dolu
  kurucu boolean,                  -- siteyi kuran kişi, çıkarılamaz
  sifre_belirlendi boolean,        -- false ise ilk girişte şifre belirleme ekranı zorunlu
  bildirim_tercih jsonb
  rol CHECK: superadmin | yonetici | yonetici_yrd | blok_yonetici | gorevli | sakin

daireler
  id, site_id, blok, no, aidat_tutari, sira, created_at

davet_kodlari
  id, site_id, kod, rol ('sakin'|'gorevli'), daire_id, ad,
  kullanildi boolean, kullanan, iptal boolean, olusturan, created_at,
  aktif boolean, kod_norm,         -- normalize edilmiş kopya, karşılaştırma için
  kullanildi_at, sifre_sifirlandi_at
```

```sql
-- ═══ FİNANS ═══

odemeler
  id, site_id, daire_id, yil, ay, tutar,
  durum ('odenmedi'|'beyan'|'odendi'),
  makbuz_no, odeme_tarihi, onaylayan, beyan_eden, created_at, updated_at

kasa_hareketleri
  id, site_id, tip ('gelir'|'gider'), tutar, aciklama, kategori,
  kaynak, odeme_id, tarih, olusturan, created_at
```

```sql
-- ═══ OPERASYON ═══

talepler
  id, site_id, daire_id, acan, kategori, metin, foto_url,
  durum ('acik'|'atandi'|'kapandi'), atanan, kapatan,
  kapatma_notu, kapatma_foto, created_at, updated_at,
  tur ('talep'|'bildiri') DEFAULT 'talep',   -- 'bildiri' artık UI'dan hiç
                                              --   üretilmiyor (bkz. §8), sütun kalıntı ama zararsız
  kapanma_at

rutinler
  id, site_id, baslik, kategori,
  siklik ('gunluk'|'haftalik'|'iki_haftalik'|'aylik'),
  sorumlu, son_yapilma, aktif, created_at

rutin_kayitlari
  id, rutin_id, site_id, yapan, foto_url, not_, tarih

duyurular
  id, site_id, baslik, metin, yayinlayan, created_at

daire_detay  (PK: daire_id)
  daire_id, site_id, dolduran, oturan_ad,
  sahiplik ('sahip'|'kiraci'), aidat_odeyen ('sahip'|'kiraci'),
  sahip_ad, sahip_tel,
  arac_var, arac_plaka, arac_model, arac_otopark,
  acil_ad, acil_yakinlik, acil_tel,
  evcil_var, evcil_bilgi,
  dolduruldu, updated_at, ekstra jsonb

gorevli_detay  (PK: profil_id)
  profil_id, site_id, roller (array), unvan, telefon,
  acil_ad, acil_yakinlik, acil_tel,
  mesai_bas, mesai_bit, calisma_gun (array), dolduruldu, updated_at

ziyaretciler
  id, site_id, ad, firma, tel, daire_id, aciklama,
  durum ('beklenen'|'icerde'|'cikti'),
  beklenen boolean, beklenen_zaman, giris_zamani, cikis_zamani,
  kaydeden, created_at

puanlar
  id, site_id, profil_id, tip ('sakin'|'gorevli'), puan, sebep, veren, created_at

toplantilar
  id, site_id, baslik, gundem, yer, zaman, olusturan, created_at

toplanti_katilim  (PK: toplanti_id+profil_id)
  toplanti_id, profil_id, site_id, durum ('katiliyor'|'katilmiyor'|'kararsiz')
```

```sql
-- ═══ İÇERİK MODÜLLERİ ═══

makaleler
  id, slug (unique, regex kısıtlı), baslik, ozet, icerik (Markdown),
  kapak_url, etiketler (array), meta_baslik, meta_aciklama,
  yayinda boolean, yayin_tarihi, goruntulenme, olusturan,
  olusturma, guncelleme

belgeler
  id, site_id, baslik, aciklama,
  kategori ('yonetim_plani'|'sigorta'|'rapor'|'sozlesme'|'tutanak'|'fatura'|'ruhsat'|'diger'),
  dosya_yolu, dosya_adi, dosya_boyut, mime,
  herkese_acik boolean, yukleyen, created_at

anketler / anket_secenekler / anket_oylar
  Standart anket yapısı. anketler.gizli=true ise oy sahibi görünmez —
  anket_oylar tablosuna doğrudan SELECT yasak, yalnızca RPC ile
  toplu sonuç döner (bkz. §9, dokunulmaması gereken modüller).

ortak_alanlar / rezervasyonlar
  rezervasyonlar.durum: bekliyor | onayli | iptal | reddedildi
  Çakışma engeli EXCLUDE USING gist kısıtıyla veritabanı seviyesinde.

demirbaslar / demirbas_bakim
  Görüntüleme: herkes. Düzenleme: yalnızca yönetici (bkz. §8).

kamera_sistemi / kameralar / kamera_firmalar / kamera_kayit_talepleri
  KVKK uyum modülü. GÖRÜNTÜ TAŞIMAZ — yalnızca sistem künyesi, firma
  iletişim bilgisi ve erişim talebi defteri.
```

```sql
-- ═══ SİSTEM ═══

demo_talepleri
  Tanıtım sayfası formu buraya yazar. Yalnızca INSERT açık (RPC üzerinden).

riza_kayitlari
  KVKK rıza geçmişi. tur: aydinlatma | kullanim_kosullari | ticari_ileti | cerez

profil_gecmisi
  Kim, neyi, ne zaman değiştirdi (profil_guncelle RPC'sinden).

yonetici_basvurulari
  Ek yönetici başvuru/onay akışı. istenen_rol: yonetici_yrd | blok_yonetici

bildirimler
  Uygulama içi bildirim. alici_id, tur, baslik, metin, kaynak_tablo,
  kaynak_id, hedef_ekran, onem ('normal'|'yuksek'), okundu

makbuzlar   (yama-makbuz.sql ile eklendi, kullanıcının döktüğü şemada YOK
             çünkü o döküm bu yamadan önce alınmış)
  id, site_id, daire_id, makbuz_no, yil, ay, tutar, odeme_tarihi,
  site_ad, site_adres, site_iban, site_iban_sahibi,   -- SNAPSHOT
  daire_metin, odeyen_ad,                              -- SNAPSHOT
  imza_yolu, imzalayan_ad, imzalayan_id, olusturan, created_at
  UNIQUE (site_id, daire_id, yil, ay)
```

---

## 5 · İKİ PARALEL RLS YARDIMCI FONKSİYON AİLESİ — ÇOK ÖNEMLİ

Bu proje **iki farklı dönemde** yazılmış iki ayrı yardımcı fonksiyon seti
içeriyor. Bunu bilmeden RLS değişikliği yapmak hataya yol açar.

```
AİLE 1 — eski, temel tablolarda (talepler, rutinler):
  benim_site()      yonetici_mi()      super_mi()

AİLE 2 — yeni, sonradan eklenen modüllerde (kamera, belge, rezervasyon,
  anket, makbuz, kişi silme, kod/şifre, çoklu yönetici, bildirim vb.):
  kp_site_id()      kp_yonetici_mi()   kp_superadmin_mi()
  kp_gorevli_mi()   kp_kurucu_mu()     kp_sakin_mi()
  kp_blok_yetkisi() kp_kod_normalize() kp_ascii()  kp_onek_uret()
```

**Kural:** Bir tabloya dokunacaksan, o tablonun **zaten kullandığı** aileyi
kullan. `talepler`/`rutinler` politikalarını düzenlerken `benim_site()`,
`yonetici_mi()`, `super_mi()` kullan — `kp_*` fonksiyonlarını oraya
sokma. Yeni bir tablo/modül yazıyorsan `kp_*` ailesini kullan (daha
kapsamlı, `gorevli_mi()`, `kurucu_mu()`, `blok_yetkisi()` gibi ek
kontrolleri var).

`gorevli_mi()` karşılığı **Aile 1'de yok**. Görevli kontrolü gereken
yerlerde (örn. `p_talepler_insert`) doğrudan
`exists (select 1 from public.profiller p where p.id=auth.uid() and p.rol<>'gorevli')`
gibi bir alt sorgu kullanılıyor — `yama-talep-rls-duzelt.sql`'e bak.

---

## 6 · AUTHENTICATION — TAM AKIŞ

Supabase Auth e-posta/şifre kullanır ama **gerçek e-posta yoktur.**

```
Kod formatı:  <2 harf site öneki><5 rakam>   örn. CS84563
              (eski 6 haneli kodlar hâlâ geçerli — geriye dönük uyumlu)

Sanal e-posta: <normalize_kod>@site.local
              Bu dönüşüm YALNIZCA kodGiris() fonksiyonu içinde olur,
              kullanıcı asla bu e-postayı görmez/yazmaz.

Normalizasyon (istemci: kodNormalize(), SQL: kp_kod_normalize()):
  boşluk/tire/nokta at → büyük harfe çevir → Türkçe karakteri ASCII yap
  "çs 845-63" ve "ÇS84563" ve "cs84563" → hepsi CS84563'e eşitlenir
  ⚠ İKİ TARAFTA DA AYNI MANTIK OLMALI. Biri değişirse diğeri de değişmeli.

İLK GİRİŞ:
  kod (görünür alan) + şifre=kod yazılır
    → sb.auth.signInWithPassword başarısız olursa signUp denenir
      (yalnızca password===kod ise; aksi hâlde "şifre hatalı" hatası)
    → davet_ile_profil(kod) RPC'si profili oluşturur/bağlar
    → profiller.sifre_belirlendi=false ise scrSifreBelirle() ekranı
      AÇILIR VE ATLANAMAZ
    → kullanıcı kendi şifresini belirler (min 6 karakter, KARMAŞIKLIK
      ŞARTI YOK — bilinçli tercih, yaşlı sakinler için)
    → sifre_belirlendi_isaretle() RPC'si çağrılır

SONRAKİ GİRİŞLER:
  kod + kendi belirlediği şifre

EK YÖNETİCİ KAYDI (gerçek e-posta ile):
  emailKayit() → gerçek e-posta+şifre ile Supabase Auth hesabı
    → renderGiris() ekranında "siteniz kayıtlı mı?" sorusu
    → "evet" → site_ara() (en az 3 harf, en fazla 10 sonuç, yalnızca
       ad+ilçe döner — adres/IBAN/daire sayısı ASLA dönmez)
    → yonetici_basvur() ile başvuru
    → kurucu (kp_kurucu_mu()) basvuru_karar() ile onaylar/reddeder

ŞİFRE SIFIRLAMA (yönetici, unutan kullanıcı için):
  Tarayıcıdan YAPILAMAZ — service_role gerektirir.
  netlify/functions/sifre-sifirla.mjs:
    1. Çağıranın JWT'si doğrulanır
    2. Çağıranın gerçekten o sitenin yöneticisi olduğu kontrol edilir
    3. Hedef kodun aynı siteye ait olduğu kontrol edilir (⚠ kritik —
       yoksa bir yönetici başka sitenin şifresini sıfırlayabilir)
    4. Şifre kodun kendisine döndürülür, sifre_belirlendi=false yapılır
```

**Rol ↔ sakinlik ayrımı — kritik kural:**
`daire_id` dolu olan herkes, rolü ne olursa olsun, **aynı zamanda
sakindir** (`sakinMi()` / `kp_sakin_mi()`). Sitede oturan bir yönetici
hem yönetici yetkilerini hem sakin ekranlarını (kendi aidat borcu, kendi
oyu, kendi rezervasyonu, Makbuzlarım) kullanır. Bunu bozacak bir
değişiklik yapmadan önce iki kez düşün.

---

## 7 · ROLLER VE YETKİ MATRİSİ

```js
NAV.yonetici = [panel,aidat,sakinler,operasyon,kasa,ziyaret,duyuru,
                anket,rezerve,belge,demirbas,kamera,siralama,kodlar,ayar]
NAV.sakin    = [panel,aidat,sakinler,operasyon,kasa,ziyaret,duyuru,
                anket,rezerve,belge,demirbas,kamera,siralama]
NAV.gorevli  = [panel,      sakinler,operasyon,      ziyaret,duyuru,
                anket,rezerve,belge,demirbas,kamera,siralama]
                // ⚠ görevlide "aidat" ve "kasa" YOK (Karar 3)
```

| Rol | Yetki özeti |
|---|---|
| `superadmin` | Yalnızca `admin.html`. Uygulamada hiç görünmez. |
| `yonetici` | Kurucu (`kurucu=true`). Sitede her şey, diğer yöneticileri onaylar/çıkarır. |
| `yonetici_yrd` | Kurucu dışında her şey. `isYon()` true döner, `kurucuMu()` false. |
| `blok_yonetici` | `isYon()` true döner; yalnızca `sorumlu_bloklar` içindeki bloklarda tam yetkili olmalı (UI'da tam netleşmemiş, dikkatli kontrol et). |
| `gorevli` | Kasa/aidat göremez. **Talep açamaz** (yalnızca üstlenip tamamlar). Demirbaşı görür, düzenleyemez. |
| `sakin` | `daire_id` dolu. Yalnızca kendi dairesinin borcunu/makbuzunu görür. |

Yetki yardımcıları (`index.html`): `isYon()`, `isGor()`, `isSak()`,
`kurucuMu()`, `sakinMi()`.

**Talep/Bildiri modülü yetki matrisi (Faz 3 kararı):**

| İşlem | Sakin | Görevli | Yönetici |
|---|:-:|:-:|:-:|
| Talep aç | ✓ | ✗ | ✓ |
| Üstlen | ✗ | ✓ | ✓ |
| Tamamla (fotoğraf opsiyonel) | ✗ | ✓ | ✓ |
| Sil | ✗ | ✗ | ✓ |

Görevli **hiçbir kaydı silemez** — kendi üstlendiğini bile. Yalnızca
yönetici siler. Bu, "görevli hoşuna gitmeyen kaydı silsin" riskini
engellemek için bilinçli bir tasarım kararı.

---

## 8 · MODÜL DURUMLARI VE ÖNEMLİ NOTLAR

### Auth & Kimlik
Yukarıda §6'da tam anlatıldı. `yama-kod-sifre.sql`.

### Talepler / Bildiriler
`talepler.tur` sütunu var (`talep`|`bildiri`) ama **UI'dan `bildiri`
hiçbir zaman üretilmiyor** — kullanıcı isteğiyle bildiri modülü tamamen
kaldırıldı, yalnızca veritabanı sütunu/kısıtı kalıntı olarak duruyor
(zararsız). Talep açma/tamamlama ekranlarında fotoğraf **her zaman
opsiyonel**, galeri ve kamera için ayrı düğmeler var
(`fotoAlaniHtml()`/`fotoAlaniBagla()` ortak yardımcısı).

**⚠ KRİTİK RLS DÜZELTMESİ (`yama-talep-rls-duzelt.sql`):**
Eskiden `p_talepler_select` politikası yönetici olmayanı yalnızca
`acan=auth.uid()` (kendi açtığı kayıt) ile sınırlıyordu — bir sakin talep
açtığında diğer sakinler göremiyordu. Düzeltildi: artık `rutinler`
tablosuyla aynı desen, site içindeki herkes her şeyi görür.
`p_talepler_insert` politikası da görevliyi engelleyecek şekilde
güncellendi.

### Ziyaretçi Defteri
Yalnızca **tek düğme** var: "Ziyaretçi Bildir" (mode=`beklenen`).
Eski "Giriş Kaydet" (mode=`giris`) düğmesi tamamen kaldırıldı.
Sakin, görevli ve yönetici hepsi bildirebilir. Durum, girilen zamana
göre otomatik hesaplanır: 5 dk'dan ileri → `beklenen`, 2 saatten geri →
`cikti`, arası → `icerde`.

### Duyurular
WhatsApp paylaşım düğmesi **yalnızca yönetici** (`isYon()`) görür. Eskiden
hiçbir kısıtlama yoktu, sakin bile paylaşabiliyordu — düzeltildi.

### Toplantılar
RSVP sonuçlarında artık **isim listesi** var (`<details>` açılır liste,
`profiller`+`daireMap()` join). Anket/Oylama modülünden tamamen ayrı,
karıştırma.

### Anket ve Oylama — **DOKUNMA, çalışıyor**
Gizli oy mekanizması hassas. `anket_oylar` tablosuna doğrudan SELECT
kapalı, yalnızca `anket_sonuc`/`anket_katilimcilar` RPC'leriyle toplu
sonuç döner.

### Ortak Alan Rezervasyonu — **DOKUNMA, çalışıyor**
Çakışma engeli `EXCLUDE USING gist` ile veritabanı seviyesinde.
`rezervasyonlar.durum`: `bekliyor|onayli|iptal|reddedildi`. Yönetici
kendi rezervasyonu doğrudan onaylı; sakin onay gerektiren alanda
`bekliyor`a düşer, yönetici `rezervasyon_karar()` ile onaylar/reddeder.
Reddedilen kayıtlar `iptal` değil `reddedildi` olarak işaretlenir ki
sakin listesinde görünüp red notu okunabilsin (`yama-rezervasyon-2.sql`).

### Demirbaş ve Bakım
Görüntüleme: **herkes** (`NAV.sakin`'e eklendi). Düzenleme: **yalnızca
yönetici** — eskiden görevli de düzenleyebiliyordu, `db_yaz`/`dbb_yaz`
RLS politikaları `kp_yonetici_mi()`'ye çekildi (`yama-demirbas-yetki.sql`).

### Belge Arşivi — **temel kısım dokunma, üstüne eklendi**
Mevcut yükleme/görüntüleme akışına dokunulmadı. Ekranın sonuna iki bölüm
eklendi:
- **Makbuzlarım** — `sakinMi()` true olanlar (sakin + sitede oturan
  yönetici) yalnızca kendi dairesinin makbuzlarını görür.
- **Tüm Makbuzlar** — yalnızca `isYon()`, sitedeki tüm makbuzlar.

### Kamera KVKK Uyum Modülü
Görüntü taşımaz, yayın yapmaz. Yalnızca sistem künyesi, kamera envanteri
(hangi kamera neyi görüyor), kurulum/bakım firma iletişimi, görüntü
talep defteri, 10 maddelik uyum denetimi, aydınlatma metni üreteci.

### Bildirim Sistemi
Üst çubukta zil ikonu, 60 saniyede bir yoklama (sekme görünmezken durur).
Dokuz olay bildirim üretiyor (duyuru, talep üstlenildi/atandı/tamamlandı,
anket açıldı, rezervasyon bekliyor/onaylandı/reddedildi, yönetici
başvurusu/kararı). Kimse kendi eylemi için bildirim almaz. Kullanıcı
tercihleriyle kapatılabilir (aidat ve sistem bildirimleri hariç).
**Push bildirim yok** — mobil uygulama gelince eklenecek, tablo yapısı
buna hazır.

### Yapay Zekâ ile Makale Üretimi
`netlify/functions/makale-uret.mjs`. `GEMINI_API_KEY` yalnızca sunucuda,
tarayıcıya hiç inmez. Model: `gemini-2.5-flash` (⚠ `gemini-2.0-flash`
31 Mart 2026'da Google tarafından emekliye ayrıldı, o adı kullanma).
İki mod:
- **Manuel** — konu + anahtar kelime elle girilir
- **Otomatik (SEO)** — konu boş bırakılırsa sunucu önce
  `admin_makale_listesi` ile mevcut makale **başlıklarını** (içerikleri
  değil) çeker, Gemini'ye gösterip "bunlardan farklı, dar, SEO değeri
  yüksek bir konu seç" der. Seçilen konu kullanıcıya bildirimde gösterilir.

Üretilen yazı **her zaman taslak** kaydedilir, otomatik yayınlanmaz.
Oran sınırı: 5 dakikada en fazla 3 üretim.

### Dijital Makbuz ve İmza (`yama-makbuz.sql`)
```
Yönetici "Ödendi işaretle" der
  → makbuzOnayModal açılır (site+daire+tutar otomatik dolu, tutar
    düzenlenebilir)
  → canvas üzerine parmak/mouse ile imza — ZORUNLU, boşsa engellenir
  → imza PNG'e çevrilip Storage'a yüklenir (makbuzlar bucket'ı, özel)
  → makbuz_olustur_ve_onayla(...) RPC'si TEK TRANSACTION'da hem
    makbuz satırını oluşturur hem odemeler.durum='odendi' yapar
```
Eski `odeme_onayla` RPC'sine **dokunulmadı, çağrılmıyor** — kaynağı bu
projede yazılı değil (muhtemelen doğrudan panelde yazılmış), içini
bilmeden sarmalamak riskli görüldü. Yeni fonksiyon yalnızca kesin bilinen
sütunlara dokunuyor (`site_id,daire_id,yil,ay,durum`).

**İptal:** `makbuz_iptal()` aidat kaydını `beyan` durumuna döndürür
(sakinin beyanı silinmez, yalnızca yöneticinin onayı geri alınır),
makbuz satırını **tamamen siler** (yalnızca gizlemez). İmza dosyası
istemciden `sb.storage.remove()` ile silinir.

Makbuz no biçimi: `MK-<site öneki>-<YYYYMM>-<sıra>` örn. `MK-CS-202608-0007`

### Kişi Silme
Kod silme = kişi silme. **Kişiye ait her şey silinir** (profil, talepler,
oylar, rezervasyonlar, giriş kodu). **İstisna:** `odemeler` ve
`kasa_hareketleri` kayıtlarında yalnızca kişi bağı koparılır (`profil_id`
NULL), kayıt **daire bazında** kalır — sitenin kasa bakiyesi ve KMK m.34
kapsamındaki hesap verme yükümlülüğü bozulmasın diye. Onay ekranında
kişinin **adının yeniden yazılması** zorunlu (yanlışlıkla silme koruması).

### Typography / UI Standardizasyonu
68 `<h2>` başlığı üç kategoriye indirgendi:
- Modal başlığı → **19px**
- Sayfa içi bölüm başlığı → **16px** (`.sectitle h2` CSS kuralı dahil)
- Tam sayfa başlığı (kurulum sihirbazı, hata ekranları) → **22px**

---

## 9 · STORAGE KOVALARI

| Kova | Erişim | Yol düzeni | Kullanım |
|---|---|---|---|
| `fotolar` | Açık | `<site_id>/<tur>/<uuid>.<ext>` | Talep fotoğrafları |
| `belgeler` | Özel | `<site_id>/<uuid>.<ext>` | Belge arşivi, imzalı geçici linkle indirilir |
| `makbuzlar` | Özel | `<site_id>/<daire_id>/<uuid>.png` | Yalnızca imza PNG'i, 2 MB limit |

---

## 10 · NETLIFY FUNCTIONS VE ORTAM DEĞİŞKENLERİ

| Fonksiyon | Adres | Ne yapar |
|---|---|---|
| `sifre-sifirla.mjs` | `/api/sifre-sifirla` | service_role ile kullanıcı şifresini sıfırlar |
| `makale-uret.mjs` | `/api/makale-uret` | Gemini ile blog makalesi üretir |
| `sayfa.mjs` | `/blog`, `/y/*`, `/sitemap.xml`, `/rss.xml` | Sunucu tarafı SEO render |

**Gerekli ortam değişkenleri (Netlify → Environment variables):**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   ← şifre sıfırlama + makale üretimi için
GEMINI_API_KEY              ← makale üretimi için
SITE_URL                    ← blog/sitemap doğru domaine işaret etsin diye
```
Bu ikisi (`SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) eksikse yalnızca ilgili
iki özellik hata verir, geri kalan her şey çalışır.

---

## 11 · GÜVENLİK KURALLARI — İSTİSNASIZ UY

1. **`SECURITY DEFINER` fonksiyonlarda `set search_path = public, pg_temp`
   zorunlu.** Unutulursa yetki yükseltme açığı oluşur (bu projede bir kez
   yaşanıp düzeltildi).
2. **String birleştirmeli dinamik SQL yasak.** Tablo adı gerekiyorsa
   `format('... %I ...', ad)`.
3. **Yetki kontrolü fonksiyonun içinde, istemciden gelen role asla
   güvenme.** Her yeni özellik hem frontend'de gizlenmeli hem RLS'de
   gerçekten kısıtlanmalı — yalnızca biri yeterli değil.
4. **`RETURNS TABLE` fonksiyonlarında çıkış sütun adıyla çakışan
   niteliksiz kolon kullanma.** Bir kez `rezervasyon_gun` fonksiyonunda
   `where id=...` yazılıp "column reference id is ambiguous" hatası
   alınmıştı. Takma ad kullan: `oa.id`.
5. **`service_role` anahtarı asla istemci koduna yazılmaz.** Yalnızca
   Netlify Function ortam değişkeninde.
6. **Yeni CDN eklersen `netlify.toml`'daki CSP `script-src`'ye de ekle.**
   Bir kez `esm.sh` unutulup uygulama tamamen kilitlenmişti.
7. **RLS politikası değiştirirken önce `pg_policies`'ten gerçek metni
   oku.** Bu depodaki SQL dosyaları her zaman güncel/eksiksiz olmayabilir
   (§4'teki şema kullanıcının panelden çektiği gerçek döküm, bu dosyalar
   değil).
8. **Site izolasyonu asla gevşetilmez.** Her yeni tablo/sorgu `site_id`
   filtresi taşımalı.

---

## 12 · KOD YAZMA KURALLARI

1. **`index.html` 4700+ satır — asla baştan yazma.** Hedefli
   `str_replace`/`sed` ile değişiklik yap.
2. **Mevcut CSS sınıflarını kullan, yeni sınıf uydurma:** `.card .pad
   .btn .btn.ghost .btn.sm .field .inp .badge .vcard .vhead .vact .lrow
   .subtabs .subtab .kolon2 .tekkart .fchip .chips` — bunlar zaten var.
3. **`admin.html`'in kendi ayrı sınıf seti var** (`.btn.brass`, `.srow`
   vb.) — `index.html`'deki sınıfları (`.fchip` gibi) oraya taşımaya
   çalışma, orada tanımlı değil.
4. **Yardımcı fonksiyonlar (`index.html`):** `h()` HTML→element,
   `esc()` kaçışlama (XSS koruması, ZORUNLU), `guard()` düğme+hata
   sarmalayıcı, `modal()`/`closeModal()`, `toast()`, `empty()`,
   `fmtDate()`/`fmtDateTime()`/`money()`/`timeAgo()`, `niceError()`,
   `rpc()`, `isYon()/isGor()/isSak()/kurucuMu()/sakinMi()`,
   `tutarOku()`/`tutarOnizleme()` (para alanları için), `gozEkle()`
   (şifre göster/gizle, otomatik çalışır), `fotoAlaniHtml()`/
   `fotoAlaniBagla()` (galeri+kamera seçici), `kodNormalize()`.
5. **Kullanıcı dosyaların tam kaynağını her zaman paylaşmayabilir.**
   Görülmemiş koda dair varsayım yapma, önce `grep` ile ara.
6. **Her değişiklikten sonra doğrula:**
   ```bash
   python3 -c "
   import io,re
   s=io.open('index.html',encoding='utf-8').read()
   m=re.search(r'<script type=\"module\">([\s\S]*?)</script>', s)
   io.open('/tmp/x.mjs','w',encoding='utf-8').write(m.group(1))
   "
   node --check /tmp/x.mjs
   ```

---

## 13 · SEO / PAZARLAMA STRATEJİSİ (kısa özet)

Hedef anahtar kelimeler bilinçli olarak **"konut panel" markasından**
**"site yönetim programı" / "apartman yönetim programı" / "aidat takip
programı"** gibi arama niyeti taşıyan terimlere kaydırıldı — "konut
panel" genel aramada inşaat/enerji sektörüyle karışıyor.

Öncelik sırası: (1) Search Console + sitemap gönder, (2) marka aramasını
kilitle, (3) kalabalık terimleri şimdilik atla, (4) uzun kuyruklu
terimlere odaklan, (5) haftada 2 makale (yapay zekâ modülüyle), (6)
Google Business Profile, (7) backlink en sona.

---

## 14 · YASAL / TİCARİ DURUM (bağlam için)

- Şirket henüz kurulmadı, tahsilat IBAN ile.
- KVKK rıza kayıtları, veri işleyen sözleşmesi, aydınlatma metinleri
  yazıldı ama ticaret unvanı/vergi bilgisi alanları hâlâ boş.
- İYS kaydı (toplu ticari e-posta/SMS için) şirket kuruluşundan sonra
  yapılacak.
- **Sıfır ödeyen müşteri, sıfır pilot.** Ürün özellik olarak rakibinden
  fazlasını yapıyor ama hiçbir gerçek kullanıcı geri bildirimi yok. Yeni
  özellik eklemekten önce bunu göz önünde bulundur — bazı modüller
  gereğinden fazla olabilir.

---

## 15 · YENİ BİR AI PROJEYE BAŞLARKEN NE YAPMALI

1. Bu belgeyi ve program dosyalarını oku.
2. Kullanıcının isteğini uygularken **önce ilgili modülün §8'deki
   notunu oku** — çoğu modülün "neden böyle yapıldığı" burada yazılı.
3. RLS değiştireceksen **önce §5'teki iki aile ayrımını** kontrol et,
   doğru aileyi kullan.
4. Değişikliği hedefli yap, dosyayı yeniden yazma.
5. `node --check` ile doğrula.
6. Kullanıcıya SQL değişikliği varsa ayrı bir `.sql` dosyası olarak ver
   (kod olarak da yapıştırılabilir hâlde — kullanıcı bazen telefondan
   çalışıyor ve dosya yükleyemiyor).
7. Test önceliği: **auth akışı → yeni eklenen özellik → dokunulmaması
   gereken modüllerin bozulmadığını doğrulama.**

**Dokunulmaması istenen modüller (tekrar):** Anket ve Oylama, Ortak Alan
Rezervasyonu, Belge Arşivi (temel kısmı), Kılavuz ve Öğretici.
