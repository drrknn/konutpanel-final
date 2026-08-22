# Konut Panel — TWA Android Projesi

Derlemeye HAZIR. Dogru imzalama anahtari (`android.keystore`) proje
kokunde, `app/build.gradle` icinde bagli. Ek ayar gerekmiyor.

## Hizli derleme

1. Klasoru Android Studio'da ac (Gradle senkronu bitsin)
2. **Build -> Generate Signed Bundle / APK -> Android App Bundle**
   - Key store path: proje kokundeki `android.keystore`
   - Key store password / Key password: `lNxXe5wIyEVL`
   - Key alias: `my-key-alias`
3. Cikti: `app/build/outputs/bundle/release/app-release.aab`
4. Play Console -> Test etme -> Dahili test -> Yeni surum olustur

Terminalden: `gradlew bundleRelease`

## Surum

versionName 1.0.3 / versionCode 4.
Play "bu surum kodu kullaniliyor" derse `app/build.gradle` icinde artir.

## Anahtar bilgisi

| | |
|---|---|
| SHA1 | F7:48:D6:EE:A3:33:11:B1:0C:CF:B0:91:C7:DA:C0:99:EF:80:B6:80 |
| SHA256 | 37:85:8E:BE:DA:0D:56:C5:2C:33:AA:33:5C:40:0C:F1:D9:2D:B8:13:51:FC:70:35:4A:39:11:A2:CF:30:2B:DE |

Bu, Play Console'a kayitli yukleme anahtaridir. Baska bir anahtarla
imzalanan AAB reddedilir. `android.keystore` dosyasini kaybetme.

## Neden bu proje?

PWABuilder'ın ürettiği pakette adres çubuğu görünmeye devam ediyordu.
Sunucu tarafı (`assetlinks.json`) doğruydu ve Google'ın doğrulama servisi
doğru okuyordu; sorun paketin içindeki doğrulama tanımındaydı.

Bu projede kritik blok `app/src/main/AndroidManifest.xml` içinde:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="konutpanel.com" />
</intent-filter>
```

`android:autoVerify="true"` ve `android:host` değeri olmadan Android
Digital Asset Links doğrulamasını hiç yapmaz — adres çubuğu kalır.

## Ayarlanmış değerler

| Ayar | Değer |
|---|---|
| Paket adı | `com.konutpanel.app` |
| Host | `konutpanel.com` (www yok) |
| Başlangıç adresi | `https://konutpanel.com/?source=pwa` |
| Sürüm adı | 1.0.2 |
| Sürüm kodu | 3 |
| minSdk / targetSdk | 23 / 35 |

## Derleme adımları

### 1. Android Studio kur
https://developer.android.com/studio — kurulum sırasında Android SDK 35
ve build-tools otomatik gelir.

### 2. Keystore'u yerleştir
PWABuilder'dan indirdiğin ilk zip'teki `signing.keystore` dosyasını
proje köküne `android.keystore` adıyla kopyala.

**Bu adım şart.** Farklı bir anahtar kullanırsan Play
"yanlış anahtarla imzalanmış" hatası verir.

Şifre ve alias bilgileri aynı zipteki `signing-key-info.txt` içinde.

### 3. İmzalama bilgilerini ver

Windows PowerShell:
```powershell
$env:KP_KEYSTORE="C:\yol\android.keystore"
$env:KP_STORE_PASSWORD="..."
$env:KP_KEY_ALIAS="..."
$env:KP_KEY_PASSWORD="..."
```

Alternatif: `app/build.gradle` içindeki `signingConfigs.release`
bloğuna değerleri doğrudan yaz (bu dosyayı GitHub'a gönderme).

### 4. AAB üret

Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**

Veya terminalden:
```
gradlew bundleRelease
```

Çıktı: `app/build/outputs/bundle/release/app-release.aab`

### 5. Play Console'a yükle
Test edin ve yayınlayın → Test etme → Dahili test → Yeni sürüm oluştur

Sürüm kodu 3; daha önce 3 kullandıysan `app/build.gradle` içinde
`versionCode` değerini artır.

### 6. Telefonda doğrula
1. Uygulamayı **kaldır** (güncelleme değil, temiz kurulum)
2. Play'den kur
3. Aç → adres çubuğu olmamalı

## Doğrulama başarısız olursa

**Ayarlar → Uygulamalar → Konut Panel → Varsayılan olarak aç**
Burada `konutpanel.com` görünmeli.

Görünmüyorsa ADB ile sebebi öğren:
```
adb shell pm get-app-links com.konutpanel.app
```
Çıktıda `konutpanel.com` karşısında `verified` yazmalı.
`legacy_failure` veya `1024` görürsen doğrulama ağ hatasıyla
başarısız olmuş; cihazı internete bağlı halde yeniden kur.

Elle doğrulamayı tetikle:
```
adb shell pm verify-app-links --re-verify com.konutpanel.app
```

## Sunucu tarafı (zaten hazır)

`https://konutpanel.com/.well-known/assetlinks.json` şu iki parmak izini
içeriyor:

- Play uygulama imzalama anahtarı: `35:86:9A:36:...:2E:51`
- Yükleme anahtarı: `0B:71:9B:6A:...:2C:C2`

Bu dosyanın `Content-Type: application/json` ile ve **yönlendirmesiz**
servis edilmesi gerekir. Cloudflare kullanıldığı için bu yol için
cache bypass kuralı önerilir — uzun cache, doğrulamanın eski dosyayı
görmesine yol açıyor.

## Üretilen görseller

- `mipmap-*/ic_launcher.png` — klasik launcher ikonu
- `mipmap-*/ic_launcher_round.png` — yuvarlak varyant
- `mipmap-*/ic_launcher_foreground.png` — uyarlanabilir ikon ön planı
- `mipmap-anydpi-v26/ic_launcher.xml` — uyarlanabilir ikon tanımı
- `drawable-*/splash.png` — açılış ekranı
- `drawable-*/ic_notification.png` — bildirim ikonu
- `store-icon-512.png` — Play Store listeleme ikonu (512x512)

Hepsi sitedeki gerçek Konut Panel logosundan üretildi.

## Eksik olan tek şey: Gradle wrapper

`gradlew`, `gradlew.bat` ve `gradle/wrapper/` dosyaları pakette yok.
Android Studio projeyi ilk açtığında bunları kendisi oluşturur.
Terminalden derlemek istersen önce Android Studio'da bir kez aç.
