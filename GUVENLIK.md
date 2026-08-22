# Konut Panel — Güvenlik Notları

Bu dosya, sitede uygulanan güvenlik önlemlerini ve senin kontrol etmen
gereken noktaları anlatır. Yayına almadan önce **Kontrol listesi**
bölümünü baştan sona geç.

---

## 1. SQL injection

### Gerçek risk nerede?

Supabase kullanıyorsun, yani istemci doğrudan SQL yazmıyor — PostgREST
üzerinden RPC çağrılıyor ve parametreler bağlı değişken olarak gidiyor.
Bu, klasik `' OR 1=1--` saldırısını baştan imkânsız kılar.

Tehlike tek bir yerde: **SECURITY DEFINER fonksiyonların içinde string
birleştirerek dinamik SQL kurmak.**

```sql
-- TEHLİKELİ — asla böyle yazma
execute 'select * from sakinler where ad = ''' || p_ad || '''';

-- GÜVENLİ — parametre bağlanır
select * from sakinler where ad = p_ad;

-- Zorunlu olarak dinamik SQL gerekiyorsa:
execute format('select * from %I where ad = $1', p_tablo) using p_ad;
--                              ^^ tanımlayıcı için format %I
--                                                    ^^ değer için using
```

### search_path — en çok atlanan açık

`SECURITY DEFINER` bir fonksiyon, onu yazan kullanıcının yetkisiyle
çalışır. `search_path` sabitlenmezse, saldırgan kendi şemasında sahte bir
`profiller` tablosu oluşturup fonksiyonu ona yönlendirebilir ve süper-admin
kontrolünü atlatabilir. Bu, Postgres'te en yaygın yetki yükseltme yoludur.

Bu paketteki **her** SECURITY DEFINER fonksiyonunda şu satır vardır:

```sql
set search_path = public, pg_temp
```

**Mevcut fonksiyonlarını denetle.** Supabase SQL Editor'de çalıştır —
sonuç boş gelmelidir:

```sql
select p.proname as acik_fonksiyon
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef
  and not exists (
    select 1 from unnest(coalesce(p.proconfig,'{}')) c
    where c like 'search_path=%'
  );
```

Listede çıkan her fonksiyonu şöyle düzelt:

```sql
alter function public.fonksiyon_adi(parametre_tipleri)
  set search_path = public, pg_temp;
```

### EXECUTE yetkisi

Supabase'de `public` rolüne verilen yetki anonim ziyaretçiyi de kapsar.
Yönetim fonksiyonlarında yetkiyi daralt:

```sql
revoke all on function public.admin_bir_sey(...) from public, anon;
grant execute on function public.admin_bir_sey(...) to authenticated;
```

Bu paketteki blog fonksiyonlarında bu yapıldı. **Mevcut `admin_*`
fonksiyonlarında da yapılmış mı kontrol et:**

```sql
select p.proname, array_to_string(p.proacl,', ') as yetkiler
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public' and p.proname like 'admin!_%' escape '!';
```

`=X/` ifadesinin `anon` rolüne verilmiş olması, anonim kullanıcının o
fonksiyonu çalıştırabildiği anlamına gelir. Yönetim fonksiyonlarında bu
olmamalı.

### Rol kontrolü istemciden gelmez

Her yazma fonksiyonu, çağıranın yetkisini **kendi içinde** doğrulamalı:

```sql
if not exists (select 1 from public.profiller
               where id = auth.uid() and rol = 'superadmin') then
  raise exception 'Yetkisiz erişim' using errcode = '42501';
end if;
```

İstemcinin gönderdiği `rol` alanına asla güvenme — kullanıcı onu
değiştirebilir.

---

## 2. XSS (siteye kod enjekte etme)

En büyük risk: Gemini API'sinden gelen makale içeriği. Bu içerik
**güvenilmez girdidir** — modelin ürettiği ya da bir şekilde araya
sokulmuş bir `<script>` etiketi sitende çalışabilir.

Alınan önlemler:

- **İçerik Markdown olarak saklanır.** Ham HTML kabul edilmez.
- Dönüştürücü önce metnin tamamını kaçışlar (`<` → `&lt;`), *sonra*
  yalnızca izin verilen etiketleri üretir. `<script>` yazmanın yapısal
  olarak yolu yoktur.
- Bağlantılarda yalnızca `http:` ve `https:` kabul edilir.
  `javascript:alert(1)` engellenir.
- Yönetim panelinde ekrana basılan her metin `esc()` ile kaçışlanır.
- CSP başlığı `object-src 'none'` ve `base-uri 'self'` ile ek katman kurar.

**Kural:** API'den gelen içeriği hiçbir zaman `innerHTML` ile doğrudan
sayfaya yazma. Markdown dönüştürücüsünden geçir.

---

## 3. RLS (satır düzeyi güvenlik)

Supabase'de RLS kapalıysa, anon key ile tablonun tamamı okunabilir.
Anon key tarayıcıda görünür — bu normaldir, veriyi koruyan şey RLS'tir.

**Hangi tablolarda RLS kapalı, kontrol et:**

```sql
select relname as tablo, relrowsecurity as rls_acik
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r'
order by relrowsecurity, relname;
```

`rls_acik = false` çıkan her tablo için:

```sql
alter table public.tablo_adi enable row level security;
```

Ardından o tabloya uygun politikayı yaz. RLS açıp politika yazmazsan
tablo kimseye görünmez — bu güvenlidir ama uygulaman çalışmaz, o yüzden
sırayla test et.

**Politikası olmayan ama RLS açık tabloları bul:**

```sql
select c.relname
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and c.relrowsecurity
  and not exists (select 1 from pg_policies p
                  where p.schemaname='public' and p.tablename=c.relname);
```

---

## 4. Anahtar yönetimi

- `config.js` içindeki **anon key** tarayıcıda görünür, sorun değil.
- **`service_role` anahtarını hiçbir istemci dosyasına koyma.** O anahtar
  RLS'i tamamen atlar; sızarsa bütün veritabanı okunabilir ve silinebilir.
- Gemini API anahtarını da tarayıcıya koyma. Makale üretimini Netlify
  Function içinden çağır ve anahtarı Netlify ortam değişkeni olarak sakla
  (Site settings → Environment variables).

Anahtar sızdıysa: Supabase → Project Settings → API → anahtarı yenile.

---

## 5. HTTP başlıkları

`netlify.toml` içinde tanımlı:

| Başlık | Ne yapar |
|---|---|
| `Content-Security-Policy` | Yalnızca izin verilen kaynaklardan kod/veri yüklenir. XSS'e karşı en güçlü katman |
| `X-Frame-Options: DENY` | Site başka sayfanın iframe'ine gömülemez (clickjacking) |
| `X-Content-Type-Options: nosniff` | Tarayıcı içerik türünü tahmin etmez |
| `Strict-Transport-Security` | HTTPS zorunlu, bir yıl boyunca hatırlanır |
| `Referrer-Policy` | Dış sitelere tam adres sızmaz |
| `Permissions-Policy` | Mikrofon, konum, ödeme gibi izinler kapalı |

**Not:** CSP'de `script-src` içinde `'unsafe-inline'` var, çünkü mevcut
uygulaman satır içi script kullanıyor. Bu bir ödün. İleride scriptleri ayrı
dosyalara taşıyıp `'unsafe-inline'` kaldırılırsa koruma belirgin biçimde
güçlenir.

Yayına aldıktan sonra `securityheaders.com` üzerinden siteni tara.

---

## 6. Diğer noktalar

- **Kimlik doğrulama:** Supabase Auth → e-posta doğrulaması açık olsun,
  şifre en az 8 karakter, "leaked password protection" etkin.
- **Oran sınırlama:** Supabase → Auth → Rate limits bölümünden giriş
  denemelerini sınırla. Kaba kuvvet saldırısını engeller.
- **Yedek:** Supabase'in otomatik yedeği plana bağlıdır. Excel dışa
  aktarma özelliğini ayda bir kullanıp kopyayı kendi bilgisayarında tut.
- **Bağımlılıklar:** CDN'den yüklenen Supabase kütüphanesinin sürümünü
  sabitlemek, ele geçirilmiş bir sürümün otomatik gelmesini engeller.

---

## Kontrol listesi

Yayına almadan önce:

- [ ] `sql/konutpanel-blog.sql` Supabase SQL Editor'de çalıştırıldı
- [ ] `search_path` denetim sorgusu boş sonuç veriyor
- [ ] Bütün `public` tablolarda RLS açık
- [ ] RLS açık her tablonun en az bir politikası var
- [ ] `admin_*` fonksiyonlarında `anon` rolünün EXECUTE yetkisi yok
- [ ] `service_role` anahtarı hiçbir istemci dosyasında geçmiyor
- [ ] Gemini API anahtarı Netlify ortam değişkeninde, kodda değil
- [ ] `securityheaders.com` taramasında A veya üzeri
- [ ] Supabase Auth'ta e-posta doğrulaması ve şifre kuralları açık
- [ ] Yönetim paneline giriş yapmadan `/admin.html` boş ekran veriyor

---

## Yeni modüllerde alınan özel önlemler

**Anket gizliliği.** `anket_oylar` tablosunda RLS politikası yalnızca
kişinin kendi oyunu okumasına izin verir. Kimse başkasının oyunu tablodan
okuyamaz. Sonuçlar `anket_sonuc` RPC'siyle toplu sayı olarak döner; kim
ne oy verdi bilgisi ancak anket açıkça "gizli değil" işaretlendiyse ve
`anket_katilimcilar` çağrıldığında gelir.

**Rezervasyon çakışması.** İki kişinin aynı saati alması uygulama
kodundaki bir kontrolle değil, veritabanındaki `EXCLUDE USING gist`
kısıtıyla engellenir. İki istek aynı milisaniyede gelse bile ikincisi
veritabanı tarafından reddedilir. Uygulama kodu bu hatayı yakalayıp
kullanıcıya anlaşılır mesaj gösterir.

**Belge erişimi.** `belgeler` kovası özeldir, doğrudan adresle
açılamaz. Dosya yolu `<site_id>/...` biçimindedir ve Storage politikası
klasör adını çağıranın `site_id`'siyle karşılaştırır. Bir sitenin
belgesine başka sitenin sakini erişemez. İndirme 120 saniye geçerli
imzalı bağlantıyla yapılır.

**Yedekleme hesabı.** Yedekleme betiği `service_role` anahtarı yerine
ayrı bir süper-admin hesabıyla oturum açar. Anahtar sızıntısı riski
yoktur; sorun çıkarsa o hesabın şifresini değiştirmek yeterlidir.

---

## Son söz

Buradaki önlemler bu paketin getirdiği dosyalar ve modüller için geçerli.
Uygulamadaki daha eski kodu ve veritabanındaki eski `admin_*`
fonksiyonlarını denetleyemedim — onların kaynağı elimde yok.
Kurulum SQL'inin sonundaki denetim sorgularını çalıştırıp çıkan sonucu
paylaşırsan tek tek bakabiliriz.
