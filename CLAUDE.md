# CLAUDE.md

## Proje

**Konut Panel** — Türkiye'deki site ve apartman yönetimleri için bulut tabanlı
yönetim SaaS'ı. Solo geliştirici projesi (Haydar Kenan Kılıç), henüz ödeyen
müşteri yok.

**Temel çalışma mantığı:** Her site (`siteler` tablosu) kendi izole tenant'ı.
Kullanıcılar bir siteye ya davet koduyla (sakin/görevli) ya da başvuru
onayıyla (ek yönetici) bağlanır. Tek bir kullanıcı (`profiller.id = auth.users.id`)
her zaman tam olarak bir siteye ve bir role bağlıdır.

## Teknoloji

- **Frontend:** Vanilla JavaScript (framework yok, build sistemi yok).
  Tek dosyalık uygulamalar: `index.html` (~4600 satır), `admin.html` (~1340
  satır), `anasayfa.html` (tanıtım). `<script type="module">` içinde ES modülü.
- **Backend:** Yok. Supabase Postgres RPC fonksiyonları backend görevi görüyor.
- **Database:** Supabase (PostgreSQL + PostgREST + Row Level Security).
- **Authentication:** Supabase Auth. Bkz. "Authentication" bölümü.
- **Storage:** Supabase Storage. Bucket'lar: `fotolar` (açık), `belgeler` (özel).
- **UI framework:** Yok — el yazımı CSS, `:root` değişkenleriyle tema (koyu/açık).
- **Önemli paketler:** `@supabase/supabase-js@2` (yalnızca `esm.sh` CDN üzerinden,
  npm/bundler yok).
- **Sunucu tarafı fonksiyonlar:** Netlify Functions (`netlify/functions/*.mjs`).
  Deno/Node uyumlu `export default` biçiminde.

## Mimari

```
index.html                    Sakin + yönetici + görevli uygulaması (tek dosya)
admin.html                    Süper-admin paneli (tek dosya)
anasayfa.html                 Tanıtım sayfası
site-yonetim-programi.html    SEO içerik sayfaları
apartman-yonetim-programi.html
aidat-takip-programi.html
config.js                     window.KONUT_PANEL_CONFIG = {SUPABASE_URL, SUPABASE_ANON_KEY}
netlify/functions/
  sifre-sifirla.mjs           service_role gerektiren şifre sıfırlama
  makale-uret.mjs             Gemini API ile blog makalesi üretimi
  sayfa.mjs                   Blog/makale/sitemap/RSS sunucu tarafı üretimi
sql/
  konutpanel-kurulum.sql      Ana kurulum — TEK dosyada tüm şema (tekrar
                               çalıştırılabilir, idempotent)
  yama-*.sql                  Kurulumdan sonra eklenen artımlı değişiklikler
                               (henüz ana dosyaya birleştirilmemiş olabilir)
netlify.toml                  Yönlendirmeler + CSP + güvenlik başlıkları
```

**Önemli component'ler yok** — her "ekran" `index.html` içinde `scrXxx(c)`
adlı bir fonksiyon. Fonksiyon, verilen kapsayıcıya (`c`) `innerHTML` yazar.

**State management:** Global `S` nesnesi (`S.user`, `S.prof`, `S.site`,
`S.active`, `S.sub`). Framework state management yok, elle güncelleniyor.

**API/servis katmanı:** Doğrudan `sb.from(...)` (PostgREST) ve `sb.rpc(...)`
çağrıları; ayrı bir servis katmanı yok.

## Roller

Kodda gerçekten var olan roller (bkz. `const NAV=` satır ~1358):

| Rol | Yetki özeti |
|---|---|
| `superadmin` | `admin.html` üzerinden bütün siteleri yönetir. Uygulama içinde görünmez. |
| `yonetici` | Kurucu yönetici. Sitede her şeye erişir. |
| `yonetici_yrd` | Yardımcı yönetici. `isYon()` true döner, kurucu-özel işlemler (`kurucuMu()`) hariç her şeyi yapar. |
| `blok_yonetici` | Blok sorumlusu. `isYon()` true döner ama yetki sınırlaması UI'da tam uygulanmamış olabilir — kontrol et. |
| `gorevli` | Saha personeli. Kasa ve aidat ekranlarını göremez (`NAV.gorevli`). |
| `sakin` | Kat maliki/kiracı. `daire_id` dolu. |

**Kritik ayrım — rol ≠ sakinlik:** `S.prof.daire_id` doluysa kişi aynı
zamanda sakindir, rolü ne olursa olsun (`sakinMi()` fonksiyonu). Bir
yönetici kendi dairesinde oturuyorsa hem yönetici hem sakin ekranlarını
görür. Bunu bozma.

Yetki yardımcıları: `isYon()`, `isGor()`, `isSak()`, `kurucuMu()`, `sakinMi()`
— hepsi `index.html` içinde satır ~1572 civarında.

## Authentication

**Format:** Supabase Auth e-posta/şifre kullanır, gerçek e-posta yoktur.
Her davet kodu sanal bir e-postaya eşlenir: `<NORMALIZE_KOD>@site.local`

**Kod biçimi:** `<2 harf site öneki><5 rakam>`, örn. `CS84563`. Eski 6 haneli
kodlar da geçerli (geriye dönük uyumluluk). Normalizasyon hem istemcide
(`kodNormalize()`) hem SQL'de (`kp_kod_normalize()`) aynı mantıkla yapılır —
biri değişirse diğeri de değişmeli.

**Giriş akışı (kod ile — sakin/görevli):**
```
Kullanıcı arayüzde SADECE kodu görür/girer (örn. CS84563)
   ↓ kodGiris() fonksiyonu
   email = kod + "@site.local"   (yalnızca kod içinde, kullanıcıya gösterilmez)
   ↓ sb.auth.signInWithPassword({email, password})
   İlk giriş: password = kod (kullanıcı bunu bilir, yönetici verdiği için)
   ↓ başarısızsa signUp dener (yalnızca password===kod ise)
   ↓ davet_ile_profil(kod) RPC'si — profil oluşturur/günceller
```

**İlk girişte şifre belirleme:** `profiller.sifre_belirlendi=false` ise
`scrSifreBelirle()` ekranı açılır, atlanamaz. Kullanıcı kendi şifresini
belirler, `sifre_belirlendi_isaretle()` RPC'si çağrılır.

**Yönetici girişi (e-posta ile — yalnızca kurucu/kayıt):** `emailGiris()`
gerçek e-posta + şifre kullanır. Bu, `renderAuth()`'taki ikinci sekme.
**Sakin ve görevli bu sekmeyi hiç kullanmamalı** — kod sekmesi onlar için
yeterli ve doğru.

**Site eşleştirme:**
- Sakin/görevli → davet koduyla (`kod_uret`, `davet_ile_profil`)
- Ek yönetici → `site_ara()` RPC'siyle arayıp `yonetici_basvur()` ile
  başvurur, kurucu `basvuru_karar()` ile onaylar
- Yeni site kurma → `renderSetup()` kurulum sihirbazı, kuran kişi `yonetici`
  ve `kurucu=true` olur

**Şifre sıfırlama:** Tarayıcıdan yapılamaz (`service_role` gerekir).
`netlify/functions/sifre-sifirla.mjs` üzerinden, yalnızca aynı sitenin
yöneticisi çağırabilir.

## Database

Aşağıdaki liste `sql/konutpanel-kurulum.sql` ve `sql/yama-*.sql`
dosyalarından çıkarılmıştır. **Bazı tabloların (`talepler`, `rutinler`,
`duyurular`, `kasa_hareketleri`, `odemeler`) orijinal `CREATE TABLE` ve
temel RLS politikaları bu klasördeki SQL dosyalarında görünmüyor** — muhtemelen
bu conversation'dan önce doğrudan Supabase panelinde oluşturulmuş. Bu tablolar
üzerinde değişiklik yapmadan önce Supabase panelinden gerçek şemayı çek.

| Tablo | Amaç | Not |
|---|---|---|
| `siteler` | Her site/apartman = bir tenant | `kod_oneki`, `lisans_durumu` alanları var |
| `profiller` | Kullanıcı profili, `id = auth.users.id` | `rol`, `site_id`, `daire_id`, `kurucu`, `sorumlu_bloklar` |
| `daireler` | Blok + daire no | |
| `daire_detay` | Oturan, araç, acil kişi bilgisi | Kişi silindiğinde anonimleştirilir |
| `davet_kodlari` | Sakin/görevli davet kodları | `kod_norm` ile normalize edilmiş kopya |
| `talepler` | Arıza talepleri | `tur` alanı var (`talep`\|`bildiri`) ama **bildiri artık UI'dan erişilemiyor** — bkz. PROJECT_STATUS |
| `rutinler` / `rutin_kayitlari` | Periyodik görevler | |
| `duyurular` | Duyurular | |
| `toplantilar` / `toplanti_katilim` | Toplantı + RSVP | İsim listesi eksik, bkz. PROJECT_STATUS |
| `ziyaretciler` | Ziyaretçi defteri | İki mod var: `beklenen`/`giris` — `giris` modu kaldırılmalı |
| `odemeler` | Aidat ödeme durumu | `durum`: beyan/odendi/odenmedi |
| `kasa_hareketleri` | Gelir-gider | Görevli göremez (Karar 3) |
| `anketler` + `anket_secenekler` + `anket_oylar` | Anket/oylama | Gizli oy desteği var — DOKUNMA |
| `ortak_alanlar` + `rezervasyonlar` | Rezervasyon | Onay akışı var — DOKUNMA |
| `demirbaslar` + `demirbas_bakim` | Bakım takibi | Görevli düzenleyebiliyor, olmamalı — bkz. PROJECT_STATUS |
| `belgeler` | Belge arşivi | DOKUNMA, makbuz alt bölümü eklenecek |
| `kamera_*` | KVKK kamera uyum modülü | |
| `bildirimler` | Uygulama içi bildirim sistemi | Tetikleyicilerle otomatik üretiliyor |
| `yonetici_basvurulari` | Ek yönetici başvuruları | |
| `riza_kayitlari` | KVKK rıza geçmişi | |

## RLS

Genel desen: her tabloda `site_id = kp_site_id()` koşulu ile tenant izolasyonu.
Yardımcı fonksiyonlar (hepsi `SECURITY DEFINER`, `search_path` sabitli):

```
kp_site_id()          çağıranın site_id'si
kp_rol()               çağıranın rolü
kp_yonetici_mi()       yonetici/yonetici_yrd/blok_yonetici/superadmin
kp_gorevli_mi()        gorevli + yukarıdakiler
kp_kurucu_mu()         yalnızca kurucu (rol=yonetici veya kurucu=true)
kp_sakin_mi() / sakinMi() [istemci] daire_id dolu mu
kp_blok_yetkisi(blok)  blok_yonetici yalnızca kendi bloğunda
kp_kod_normalize(kod)  kod karşılaştırma normalizasyonu
```

**İki paralel yardımcı fonksiyon ailesi var — karıştırma.**

Bu proje aslında iki farklı dönemde yazılmış RLS yardımcı fonksiyonu
seti içeriyor:

```
Yeni aile (bu conversation'da eklenen modüller):
  kp_site_id()  kp_yonetici_mi()  kp_gorevli_mi()  kp_kurucu_mu()  vb.

Eski aile (talepler, rutinler — muhtemelen conversation öncesi kurulmuş):
  benim_site()  yonetici_mi()  super_mi()
```

`pg_policies` sorgusuyla doğrulandı: `talepler` ve `rutinler` politikaları
**eski aileyi** kullanıyor. Bu tablolara dokunacaksan aynı aileyi kullan
(`benim_site()`, `yonetici_mi()`, `super_mi()`), `kp_*` fonksiyonlarını
karıştırma — ikisi muhtemelen aynı işi yapıyor ama farklı fonksiyonlar,
birini diğeriyle değiştirmek hataya yol açabilir. `gorevli_mi()` karşılığı
eski ailede yok; görevli kontrolü gerektiğinde doğrudan
`profiller.rol <> 'gorevli'` sorgusu kullanılıyor (bkz.
`sql/yama-talep-rls-duzelt.sql`).

**Artık doğrulandı, bilinmiyor değil:** `talepler`/`rutinler` SELECT
politikaları okundu ve düzeltildi. `rutinler` zaten doğruydu (site
içindeki herkes görüyor). `talepler`'de sakin/görevli yalnızca kendi
açtığı kaydı görebiliyordu — düzeltildi, artık site içindeki herkes
görüyor. Ayrıntı `PROJECT_STATUS.md`'de.

## Storage

| Bucket | Erişim | Kullanım |
|---|---|---|
| `fotolar` | Açık (public) | Talep/arıza fotoğrafları. `uploadFoto(file,tur)` yardımcısıyla `<site_id>/<tur>/<uuid>.<ext>` yoluna yüklenir. **Bu bucket'ın `storage.buckets` INSERT'i mevcut SQL dosyalarında yok** — muhtemelen panelden manuel oluşturulmuş. |
| `belgeler` | Özel (private) | Belge arşivi. `<site_id>/<uuid>.<ext>` yolu, imzalı geçici bağlantıyla indiriliyor. |

## Değiştirilmemesi gereken çalışan modüller

Kullanıcı tarafından açıkça "sorunsuz çalışıyor, dokunma" olarak işaretlendi:

- **Anket ve Oylama** (`scrAnket`, `anketModal`, `anket_oy_ver` RPC) — gizli
  oy mekanizması hassas, RLS'i bozmadan dokunma.
- **Ortak Alan Rezervasyonu** (`scrRezerve`, `rezervasyon_yap`,
  `rezervasyon_karar`) — çakışma engeli `EXCLUDE USING gist` kısıtına
  dayanıyor, veritabanı seviyesinde.
- **Belge Arşivi** (`scrBelge`) — yalnızca üstüne "Makbuzlarım" alt bölümü
  eklenecek, mevcut yükleme/görüntüleme akışı değişmeyecek.
- **Kılavuz ve Öğretici** (`kilavuzAc()`, `KILAVUZ` nesnesi) — role özel
  içerik zaten doğru.

## Geliştirme kuralları

1. **Dosyayı baştan yazma.** `index.html` 4600+ satır; hedefli `str.replace`
   ile değişiklik yap, tüm dosyayı yeniden üretme.
2. **RLS'i frontend'den bypass etmeye çalışma.** Yetki kontrolü hem
   istemcide (görünürlük için) hem SQL'de (gerçek güvenlik için) olmalı.
   Yalnızca frontend'de gizlemek yeterli değil.
3. **`SECURITY DEFINER` fonksiyonlarda `set search_path = public, pg_temp`
   zorunlu.** Unutulursa yetki yükseltme açığı oluşur — bu proje geçmişinde
   bir kez atlanmış ve düzeltilmişti.
4. **`RETURNS TABLE` fonksiyonlarında çıkış sütun adıyla çakışan niteliksiz
   kolon kullanma.** Bir kez `rezervasyon_gun` fonksiyonunda `where id=...`
   yazılıp "column reference id is ambiguous" hatası alınmıştı. Takma ad kullan.
5. **`service_role` anahtarını asla istemci koduna yazma.** Yalnızca Netlify
   Function ortam değişkeninde. Şifre sıfırlama ve makale üretimi bu deseni
   kullanıyor, örnek al.
6. **Yeni CDN eklersen `netlify.toml`'daki CSP `script-src`'ye de ekle.**
   Bir kez `esm.sh` eklenmeyi unutulup uygulama tamamen kilitlenmişti.
7. **Site izolasyonunu asla gevşetme.** Her yeni tablo/sorgu `site_id`
   filtresi taşımalı.
8. **Gereksiz bağımlılık ekleme.** Proje bilinçli olarak framework'süz;
   bunu değiştirmeden önce kullanıcıya sor.
9. **Mevcut CSS sınıflarını kullan, yeni sınıf uydurma.** `.card .btn .field
   .inp .badge .vcard .lrow .subtabs` gibi sınıflar zaten var.
10. **Kod paylaşımı kısıtlı olabilir.** Kullanıcı bazen dosyanın tam
    kaynağını paylaşmaz; görülmemiş koda dair varsayım yapma, önce ara.
