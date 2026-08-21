# Push Bildirimleri — Kurulum

Bu sürümde üç şey eklendi:

1. **Banner düzeltmesi** — "Bildirimleri Aç" bandı izin verilince artık kayboluyor
2. **Gerçek web push** — uygulama kapalıyken de bildirim gelir
3. **Özel zil sesi** — bildirimler Konut Panel melodisiyle çalar

Aşağıdaki adımlar tamamlanmadan **push çalışmaz**. Sıra önemli.

---

## 1. Supabase tablosu

`scripts/push_abonelikleri.sql` dosyasını Supabase > SQL Editor'de çalıştır.
Bir kez yeterli.

## 2. VAPID anahtarlarını üret

Push mesajlarını imzalamak için gereken anahtar çifti. Bilgisayarında:

```
npx web-push generate-vapid-keys
```

İki değer verir: **Public Key** ve **Private Key**. İkisini de sakla.

## 3. Netlify ortam değişkenleri

Netlify > Site configuration > Environment variables:

| Değişken | Değer |
|---|---|
| `VAPID_PUBLIC_KEY` | üretilen public key |
| `VAPID_PRIVATE_KEY` | üretilen private key |
| `VAPID_SUBJECT` | `mailto:info@konutpanel.com` |

Private key'i asla istemci koduna koyma.

## 4. config.js

`config.js` içindeki `VAPID_PUBLIC_KEY` alanına **public** anahtarı yaz.
Netlify'daki `VAPID_PUBLIC_KEY` ile birebir aynı olmalı — farklıysa abonelik
kurulur ama gönderim sessizce başarısız olur.

Boş bırakılırsa push devre dışı kalır; izin istenir ama bildirim gelmez.

## 5. Deploy

GitHub'a commit → Netlify deploy → `sw.js` cache sürümü v10 olduğu için
service worker kendini günceller.

---

## Android tarafı (zil sesi)

TWA projesine iki dosya eklenecek:

```
app/src/main/java/com/konutpanel/app/KonutPanelDelegationService.java
app/src/main/res/raw/konut_panel_bildirim.ogg
```

Sonra `app/src/main/AndroidManifest.xml` içinde servis adını değiştir:

```xml
<!-- ESKİ -->
<service
    android:name="com.google.androidbrowserhelper.trusted.DelegationService"

<!-- YENİ -->
<service
    android:name="com.konutpanel.app.KonutPanelDelegationService"
```

Diğer satırlara (enabled, exported, meta-data, intent-filter) dokunma.

`versionCode`'u artır, yeniden derle.

**Not:** Android, bir bildirim kanalının sesini kanal oluşturulduktan sonra
değiştirmeye izin vermiyor. Sesi ileride değiştirirsen `KANAL_ID` değerini
`konutpanel_bildirim_v2` yap; yoksa mevcut kullanıcılarda eski ses çalmaya
devam eder.

---

## Bildirim gönderme

```
POST /.netlify/functions/push-gonder
Authorization: Bearer <yönetici oturum jetonu>

{
  "site_id": "…",
  "baslik": "Aidat hatırlatması",
  "govde": "Ağustos aidatı için son 3 gün.",
  "url": "/uygulama#aidat",
  "tur": "aidat"
}
```

Belirli kişilere göndermek için `"kullanici_idler": ["…","…"]` ekle.
Yalnızca ilgili sitenin yöneticisi çağırabilir.

Geçersiz hale gelen abonelikler (uygulama silinmiş, izin kaldırılmış)
gönderim sırasında otomatik temizlenir.

---

## Test

1. Telefonda uygulamayı aç, bildirim iznini ver → **bant kaybolmalı**
2. Ayarlar > Uygulamalar > Konut Panel > Bildirimler → "Konut Panel
   Bildirimleri" kanalı görünmeli
3. Yönetici hesabıyla `push-gonder` çağır
4. Uygulamayı **tamamen kapat**, bildirimin gelmesini bekle
5. Bildirime dokun → uygulama ilgili sayfada açılmalı

Bildirim gelmiyorsa sırayla bak: Supabase'de `push_abonelikleri` tablosunda
kayıt var mı, `config.js`'teki public key Netlify'dakiyle aynı mı, Netlify
fonksiyon loglarında hata var mı.
