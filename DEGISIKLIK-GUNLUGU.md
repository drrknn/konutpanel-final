╔══════════════════════════════════════════════════════════════════╗
║  KONUT PANEL — YAYIN PAKETİ                                      ║
╚══════════════════════════════════════════════════════════════════╝

KURULUM — SIRAYLA YAP
═════════════════════

1) VERİTABANI
   Supabase → SQL Editor → sql/konutpanel-kurulum.sql dosyasının
   TAMAMINI yapıştır → Run.
   Tek dosyadır, her şeyi kurar. Tekrar çalıştırılabilir, veri bozmaz.

2) SİTEYİ YAYINLA
   Bu klasörün tamamını (sql/ klasörü hariç olabilir) zip'leyip
   Netlify'a sürükle.

3) DENETİM
   sql dosyasının en altındaki (a) (b) (c) (d) sorgularını tek tek
   çalıştır. Dördü de BOŞ sonuç vermeli. Çıkan olursa bana yapıştır.

4) YEDEKLEME
   sql/drive-yedekleme.gs dosyasının başındaki 6 adımı uygula.


═══════════════════════════════════════════════════════════════════
DOSYALAR
═══════════════════════════════════════════════════════════════════
index.html                    Sakin ve yönetici uygulaması
admin.html                    Süper-admin paneli
config.js                     Supabase bağlantı ayarları
manifest.json, sw.js          PWA tanımı ve service worker
icons/                        Simgeler

anasayfa.html                 Tanıtım sayfası (sunum biçimli)
kvkk.html                     KVKK aydınlatma metni
gizlilik.html                 Gizlilik politikası
kullanim-kosullari.html       Kullanım koşulları

netlify.toml                  Yönlendirme + güvenlik başlıkları
robots.txt                    Arama motoru yönergesi
netlify/functions/sayfa.mjs   Blog, makale, sitemap, RSS (sunucu tarafı)

sql/konutpanel-kurulum.sql    TEK DOSYA — bütün veritabanı kurulumu
sql/drive-yedekleme.gs        Google Apps Script yedekleme betiği
GUVENLIK.md                   Güvenlik denetim listesi


═══════════════════════════════════════════════════════════════════
BU SÜRÜMDE EKLENEN 4 YENİ ÖZELLİK
═══════════════════════════════════════════════════════════════════
Tanıtım sayfasında vaat edilip veritabanında karşılığı olmayan
dört özellik artık gerçekten çalışıyor:

BELGE ARŞİVİ        Yönetim planı, sigorta poliçesi, rapor, sözleşme…
                    Yönetici yükler, sakinler indirir. "Yalnızca
                    yönetim görsün" seçeneği var. Dosyalar özel bir
                    depolama kovasında; indirme imzalı bağlantıyla.

ANKET & OYLAMA      Yönetici soru ve seçenekleri girer, herkes oy
                    verir. Tek/çoklu seçim, gizli oylama, bitiş
                    tarihi. Oyunu anket kapanana kadar
                    değiştirebilirsin. Gizli anketlerde kimin ne oy
                    verdiği hiçbir yerde görünmez — ham oy tablosu
                    okunamaz, sonuçlar yalnızca RPC ile döner.

ORTAK ALAN REZERV.  Yönetici alanları tanımlar (havuz, spor salonu,
                    kort): açılış-kapanış saati, kullanım süresi,
                    daire başına günlük hak, onay gerekip gerekmediği.
                    Sakin gün seçer, boş saatlere tıklayıp ayırtır.
                    Çakışma engeli VERİTABANI seviyesindedir; iki kişi
                    aynı anda tıklasa bile ikincisi reddedilir.

DEMİRBAŞ & BAKIM    Asansör, jeneratör, hidrofor, yangın sistemi…
                    Marka, model, seri no, garanti, bakım periyodu.
                    Bakım işlendiğinde sonraki tarih otomatik hesaplanır
                    ve istenirse tutar kasaya gider olarak yazılır.
                    Gecikmiş ve yaklaşan bakımlar ekranın üstünde
                    uyarı olarak çıkar.

Menüde yeni sekmeler:
  Yönetici : Anket, Rezervasyon, Belge, Demirbaş
  Sakin    : Anket, Rezervasyon, Belge
  Görevli  : Anket, Rezervasyon, Belge, Demirbaş

Not: Yeni ekranların Rusça ve Almanca çevirisi yok; o dillerde
Türkçe metin görünür. Türkçe ve İngilizce tamdır.


═══════════════════════════════════════════════════════════════════
YEDEKLEME — ARTIK TÜM SUNUCUYU KAPSIYOR
═══════════════════════════════════════════════════════════════════
Her gece 03:00'te Google'ın sunucusunda çalışır, Drive'a yazar:

  KonutPanel Yedek/
    Veri/       konutpanel-<tarih>.json    bütün tabloların verisi
                kullanicilar-<tarih>.json  auth hesapları
    Yapi/       sema-<tarih>.json          tablolar, RLS, RPC tanımları
    Dosyalar/   <kova>/<yol>               BÜTÜN yüklenen dosyalar
                                           (arıza fotoğrafları, belgeler…)

Dosyalar ARTIMLI yedeklenir: aynı dosya her gün tekrar indirilmez.
İlk çalıştırma dosya sayısına göre birkaç gece sürebilir, normaldir.
Bir çalıştırmada bitmezse ertesi gece kaldığı yerden devam eder.

JSON yedekleri 30 gün saklanır, eskiler silinir.
Bir sorun olursa e-posta gelir.

Maliyet: 0 TL.


═══════════════════════════════════════════════════════════════════
ADRESLER
═══════════════════════════════════════════════════════════════════
  /                     Tanıtım sayfası
  /uygulama             Sakin ve yönetici uygulaması
  /index.html           Aynısı (eski linkler çalışır)
  /yonetim              Süper-admin paneli
  /admin.html           Aynısı (eski linkler çalışır)
  /blog                 Makale listesi     (sunucuda üretilir)
  /y/<adres>            Tek makale         (sunucuda üretilir)
  /sitemap.xml          Site haritası      (otomatik)
  /rss.xml              RSS akışı          (otomatik)


═══════════════════════════════════════════════════════════════════
DOLDURULMASI GEREKENLER
═══════════════════════════════════════════════════════════════════
1) E-posta: "info@konutpanel.com" yazan yerler
2) Sosyal medya bağlantıları (href="#" olanlar)
3) App Store / Google Play bağlantıları ve "Yakında" yazısı
4) Yasal metinlerdeki [köşeli parantez] alanları — şirket unvanı,
   adres, vergi bilgisi, yetkili mahkeme şehri.
   Yayına almadan önce bir hukukçuya kontrol ettir.

Telefon 0539 606 8442 eklendi.
Fiyat: aylık 100 ₺ + KDV / yıllık 60 ₺ + KDV (anasayfa.html içinde).


═══════════════════════════════════════════════════════════════════
DOMAIN ALINCA
═══════════════════════════════════════════════════════════════════
Şu an bütün adresler https://konutpanel.com olarak ayarlı.

konutpanel.com'u aldığında:
  1) Netlify → Domain management → Add a domain
  2) Netlify → Environment variables → SITE_URL = https://konutpanel.com
     (blog ve sitemap adresleri anında düzelir)
  3) Şu 5 dosyada "konutpanel.com" → "konutpanel.com":
       anasayfa.html, kvkk.html, gizlilik.html,
       kullanim-kosullari.html, robots.txt
  4) Google Search Console'da yeni domaini doğrula, sitemap gönder


═══════════════════════════════════════════════════════════════════
İLK KULLANIMDA YAPILACAKLAR
═══════════════════════════════════════════════════════════════════
Yönetici olarak giriş yapıp:
  • Rezervasyon sekmesi → "Ortak alan ekle" ile havuz, spor salonu
    gibi tesisleri tanımla. Tanımlanmadan sakinler rezervasyon
    yapamaz.
  • Demirbaş sekmesi → asansör, jeneratör gibi ekipmanları ekle ve
    bakım periyodunu gir. Hatırlatmalar buradan çalışır.
  • Belge sekmesi → yönetim planını ve sigorta poliçesini yükle.


═══════════════════════════════════════════════════════════════════
MASAÜSTÜ YERLEŞİM İYİLEŞTİRMESİ
═══════════════════════════════════════════════════════════════════
Geniş ekranlarda oluşan boşluklar giderildi. Bütün kurallar
min-width sorgularıyla yazıldı; mobil ve tablet görünümüne
hiç dokunulmadı (tek max-width:920px bloğu olduğu gibi duruyor).

  • İçerik alanı 1400px+ ekranlarda 1360px'e, 1680px+ ekranlarda
    1520px'e genişliyor (önceden sabit 1220px'ti)
  • Form kartı, yanındaki uzun listeyi kaydırırken takip ediyor
    (sticky) — altında dev boşluk kalmıyor
  • Uzun kart listeleri 1300px'te iki, 1750px'te üç kolona iniyor:
    giriş kodları, ziyaretçi defteri, belgeler, demirbaşlar, anketler
  • Daire kartları 1400px'te dört, 1750px'te beş kolona çıkıyor
  • Rezervasyon saat kutuları geniş ekranda daha sık diziliyor


═══════════════════════════════════════════════════════════════════
KAMERA SİSTEMİ MODÜLÜ (yeni)
═══════════════════════════════════════════════════════════════════
GÖRÜNTÜ TAŞIMAZ, YAYIN YAPMAZ, KAYIT SAKLAMAZ.
KVKK'nın 08.06.2026 duyurusu: kamera görüntülerine erişim yalnızca
yönetici ve güvenlik amiri gibi yetkili kişilerle sınırlı olmalıdır.
Her sakine izleme yetkisi vermek "amaç dışı paylaşım"dır.

Modülün tuttuğu şeyler:
  • KVKK uyum denetimi — 10 madde, yüzdeli skor, eksikler açıklamalı
  • Sistem künyesi — cihaz, kanal, kayıt süresi, ses/yüz tanıma durumu
  • Kat malikleri kurulu kararı — tarih, defter sayfası, oy oranı
  • Kameralar — hangi kamera nerede, NEYİ GÖRÜYOR (en kritik alan)
  • Kurulum ve bakım firmaları — firma, yetkili, telefon, e-posta,
    sözleşme bitişi. Yönetim değişse de bu bilgi kaybolmaz.
  • Görüntü talep ve erişim defteri — kim, ne zaman, hangi gerekçeyle
    hangi kaydı izledi. Denetimde istenen defter budur.
  • Aydınlatma metni üreteci — site bilgilerinden otomatik üretir,
    kopyalanır ve yazdırılır

Sakin de bu sekmeyi görür: aydınlatma metnini okuyabilir ve görüntü
talebinde bulunabilir. Canlı görüntü göremez.


═══════════════════════════════════════════════════════════════════
LİSANS YÖNETİMİ (yeni)
═══════════════════════════════════════════════════════════════════
TASARIM KARARI: Süre dolunca hesap KAPANMAZ, OKUNUR MODA geçer.
  • Veriler görünür ve Excel'e aktarılabilir
  • Hiçbir yeni kayıt eklenemez, güncellenemez, silinemez

Neden: müşterinin kendi aidat kayıtlarını rehin almak hem ticari
olarak yanlış hem hukuken tartışmalı. Okunur mod ödeme baskısını
korur, bu riski taşımaz.

ZORLAMA SUNUCU TARAFINDADIR. site_id sütunu olan her tabloya bir
tetikleyici bağlanır. Tarayıcıdaki kod değiştirilse bile veritabanı
yazma işlemini reddeder. profiller ve siteler tabloları hariç
tutulmuştur; aksi hâlde yönetici kilitlenip durumu düzeltemez.

Durumlar: deneme · aktif · askida · iptal
Paketler: demo · aylik · yillik

Yeni kurulan site otomatik olarak 14 günlük DENEME ile başlar.
Mevcut siteler kurulumda "aktif · süresiz" işaretlenir; hiçbiri
kesintiye uğramaz.

Yönetim paneli > "Lisans · Abonelik" kartı:
  site listesi, kalan gün, +14 gün / +1 ay / +1 yıl kısayolları,
  süresiz seçeneği, not alanı.

Sakin/yönetici tarafında: süre yaklaşınca ya da dolunca her ekranın
üstünde uyarı şeridi çıkar, WhatsApp ve arama düğmesiyle.


═══════════════════════════════════════════════════════════════════
DEMO TALEPLERİ (yeni)
═══════════════════════════════════════════════════════════════════
Tanıtım sayfasındaki form artık Netlify Forms'a değil doğrudan
Supabase'e yazıyor. Böylece talepler yönetim panelinde görünüyor.

Yönetim paneli > "Satış · Demo talepleri" kartı:
  yeni talep sayacı, durum filtreleri (yeni/arandı/demo verildi/
  müşteri/vazgeçti), WhatsApp kısayolu, görüşme notu.

Güvenlik: demo_talep_olustur fonksiyonu yalnızca KAYIT EKLEYEBİLİR,
tabloyu okuyamaz. Aynı telefondan 10 dakikada bir talep kabul edilir.
Formda gizli bot tuzağı alanı var.

Netlify Forms artık kullanılmıyor; panelindeki eski kayıtlar durur.


═══════════════════════════════════════════════════════════════════
KVKK PAKETİ (yeni)
═══════════════════════════════════════════════════════════════════
KAYIT AKIŞI
  • Davet kodu ile giriş: aydınlatma metni + kullanım koşulları onayı
    ZORUNLU. İşaretlenmeden giriş yapılamaz.
  • E-posta ile kayıt: aynı zorunlu onay + isteğe bağlı TİCARİ
    ELEKTRONİK İLETİ izni (ayrı kutu, zorunlu değil).
  • Telefon alanı da eklendi.

RIZA KAYITLARI — en kritik kısım
  KVKK'da rızayı almak yetmez, ALDIĞINI KANITLAYABİLMEK gerekir.
  riza_kayitlari tablosu kimin, ne zaman, hangi metin sürümünü
  onayladığını tutar. Rıza geri çekilirse kayıt SİLİNMEZ; yeni bir
  "geri_cekildi" satırı eklenir, geçmiş bozulmaz.

GİZLİLİK VE İZİNLERİM EKRANI
  Menü (☰) → "Gizlilik ve izinlerim"
  Kullanıcı verdiği onayları görür, ticari ileti iznini tek tıkla
  geri alabilir, yasal metinlere ulaşır, KVKK m.11 haklarını okur.
  Rızanın geri alınabilir olması Kanun gereğidir.

YENİ SAYFA: veri-isleyen-sozlesmesi.html
  Bu belge kritik. KVKK karşısında:
     Site yönetimi = VERİ SORUMLUSU
     Konut Panel   = VERİ İŞLEYEN
  Kanun aralarında yazılı sözleşme bulunmasını ZORUNLU kılar.
  İlk kurumsal müşterin bunu isteyecektir; hazır olması güven verir.

KVKK.HTML YENİLENDİ
  Şablon değil, gerçek içerik: veri kategorileri, hukuki sebepler,
  saklama süreleri, aktarım, haklar, ticari ileti bölümü.
  Şirket kuruluşu tamamlanınca ticaret unvanı ve vergi bilgileri
  eklenecek — tek köşeli parantez orada kaldı.

DEMO FORMU
  Aydınlatma onayı zorunlu + ticari ileti izni ayrı kutu olarak eklendi.

E-POSTA İMZASI
  zoho-imza.html dosyasında üç sürüm hazır (kurumsal, kişisel, banner).
  Kurulum ve test adımları dosyanın içinde.
  icons/imza-banner.png ve icons/konutpanel-logo-280.png eklendi.


⚠ TİCARİ ELEKTRONİK İLETİ — BİLMEN GEREKEN
  Toplu tanıtım e-postası veya SMS göndermeyi planlıyorsan Türkiye'de
  İleti Yönetim Sistemi'ne (İYS) kayıt ZORUNLUDUR ve her alıcının izni
  İYS'ye işlenmelidir. İzin kutusunu koymak tek başına yeterli değildir.
  Bire bir yazışmalar ve müşteri talebine verilen cevaplar bu kapsamda
  değildir; onlar için İYS gerekmez.
  İYS kaydı şirket kuruluşundan sonra yapılabilir.

⚠ VERBİS
  Yıllık çalışan sayısı 50'den az ve mali bilanço 25 milyon TL altındaysa
  ve ana faaliyetin özel nitelikli veri işlemek değilse VERBİS kaydı
  muafiyeti vardır. Durumunu mali müşavirinle teyit et.


═══════════════════════════════════════════════════════════════════
SEO — DOĞRU HEDEFLEME (yeni)
═══════════════════════════════════════════════════════════════════
STRATEJİ DEĞİŞİKLİĞİ
  "Konut panel" araması inşaat ve enerji sektörünün: monolitik panel,
  prefabrik konut, güneş paneli. Orada birinci olsan bile gelen kişi
  müşterin değil.

  Gerçek hedefler:
      "site yönetim programı"
      "apartman yönetim programı"
      "aidat takip programı"
  Bunlar hem doğru kişiyi getirir hem rekabeti çok daha az.

YENİ SAYFALAR (her biri içerik dolu, şemalı, iç bağlantılı)
  /site-yonetim-programi       ~1.400 kelime
  /apartman-yonetim-programi   ~1.100 kelime
  /aidat-takip-programi        ~1.100 kelime

  Her sayfada: H1/H2/H3 hiyerarşisi, karşılaştırma tablosu, 5 soruluk
  SSS (FAQPage şeması ile — Google sonuçlarında açılır kapanır soru
  olarak çıkabilir), CTA ve diğer sayfalara bağlantı.

  Adresler uzantısız çalışıyor (netlify.toml yönlendirmesi).

ŞEMALAR
  Ana sayfa: SoftwareApplication, Organization (knowsAbout ile),
  WebSite, FAQPage, Service (fiyat kataloğu ile)
  Alt sayfalar: WebPage, BreadcrumbList, FAQPage

İÇ BAĞLANTI
  Ana sayfa üst menüsünde "Çözümler", alt bilgide üç sayfanın linki.
  Üç sayfa birbirine ve bloga bağlı. Google için önemli.


⚠ SEO GERÇEĞİ — BEKLENTİYİ DOĞRU KUR
  Site bugün yayına girdi. Google'ın yeni bir alan adına güvenmesi
  aylar alır. Bu sayfalar altyapıyı doğru kurar ama tek başına
  sıralama getirmez. Sıralamayı getiren üç şey:

  1) İÇERİK SÜREKLİLİĞİ — blog. Haftada 2 yazı, 3 ay boyunca.
     Konular: aidat hesaplama, kat mülkiyeti soruları, yönetici
     değişimi, denetim kurulu, ortak gider paylaşımı.
  2) BACKLINK — başka sitelerin sana link vermesi. En kolay yol:
     emlak ve site yönetimi forumlarında gerçekten faydalı cevaplar,
     yerel haber sitelerinde tanıtım.
  3) GERÇEK KULLANICI — Google, insanların sitede kalıp kalmadığına
     bakar. 10 müşterin olduğunda sıralaman kendiliğinden yükselir.

  Kısacası: SEO'ya güvenip beklemek yerine kapı çalmaya devam et.
  SEO 6 ay sonra meyve verir; müşteri bu hafta lazım.

YAPILACAKLAR (Trello'ya ekle)
  · Google Search Console'a konutpanel.com ekle, sitemap gönder
  · Bing Webmaster Tools'a ekle
  · PageSpeed Insights ölçümü
  · Google Business Profile aç (yerel aramalarda çıkmak için)
  · Haftada 2 blog yazısı programı kur


═══════════════════════════════════════════════════════════════════
FAZ 2 — KİMLİK, KOD VE ŞİFRE (yeni)
═══════════════════════════════════════════════════════════════════

KOD BİÇİMİ DEĞİŞTİ
  Eski: 845635              (6 rakam)
  Yeni: CS84563             (2 harf site öneki + 5 rakam)

  Önek site adından üretilir:
     Çelikler Sitesi   -> CS
     Papatya Konakları -> PK
     Güneş             -> GU
     Flamingo 8        -> F8
  Çakışma olursa sonuna sayı eklenir: CS2, CS3

  ⚠ MEVCUT KODLAR GEÇERLİ KALIR. Doğrulama hem eski hem yeni biçimi
  kabul eder. Hiçbir sakin giriş yapamaz duruma düşmez.

  Giriş esnek: çs84563 · ÇS-84563 · cs 84563 · CS84563 hepsi kabul.
  Türkçe karakter, boşluk, tire ve nokta göz ardı edilir.


KOD + ŞİFRE İLE GİRİŞ
  Artık kod tek başına yetmiyor. Giriş ekranında iki alan var.

  İlk giriş : kod + şifre olarak yine kod
              -> ardından ŞİFRE BELİRLEME ekranı açılır, atlanamaz
  Sonraki   : kod + kendi belirlediği şifre

  Şifre en az 6 karakter. Karmaşıklık şartı YOK — 70-80 yaşındaki
  sakinler zorlayıcı kural karşısında şifreyi kâğıda yazıp kapıya
  asıyor, bu hiç şifre olmamasından kötü.

  ⚠ Hâlihazırda giriş yapmış kullanıcılar etkilenmez; SQL onları
  "şifresini belirlemiş" olarak işaretliyor.


ŞİFRE SIFIRLAMA
  Giriş Kodları ekranında her kodun yanında anahtar simgesi.
  Şifre yeniden kodun kendisi olur, kullanıcı yeni şifre belirler.

  ⚠ NETLIFY ORTAM DEĞİŞKENİ GEREKLİ
     SUPABASE_SERVICE_ROLE_KEY
  Supabase > Project Settings > API > service_role anahtarını
  kopyalayıp Netlify > Environment variables bölümüne ekleyin.
  Bu anahtar ASLA koda yazılmaz; yalnızca sunucuda kullanılır.
  Eklenmezse şifre sıfırlama düğmesi hata verir, gerisi çalışır.


KİŞİ SİLME
  Kod silme artık kişi silmeye dönüşüyor. Kodla giriş yapmış biri
  varsa onay ekranı açılır ve ne silineceğini tek tek gösterir.
  Onaylamak için kişinin ADININ YAZILMASI gerekir — yanlışlıkla
  silme riski bu kadar ağır bir işlemde kabul edilemez.

  Silinen : profil, kişisel bilgiler, acil kişi, araç, evcil hayvan,
            talepler, oylar, rezervasyonlar, duyurular, ziyaretçi
            kayıtları, belgeler, puanlar, giriş kodu
  Kalan   : ödeme ve kasa kayıtları — kişi bağı koparılır, kayıtta
            yalnızca daire, tarih ve tutar kalır

  Neden ödeme kaydı silinmiyor: ödeme kişiye değil DAİREYE aittir.
  Silinirse sitenin kasa bakiyesi tutmaz, o dairenin borcu sakin
  değişince sıfırlanmış görünür ve site yönetiminin KMK m.34
  kapsamındaki hesap verme yükümlülüğü ihlal edilir. Profil bağı
  koparıldığında kayıtta kişisel veri kalmaz — KVKK anlamında
  silinmiş sayılır.


GÖREVLİ KODUNDA AD ZORUNLU
  Görevli kodu üretirken ad yazmak zorunlu hale geldi. Daire bağı
  olmadığı için başka türlü hangi kodun kime ait olduğu anlaşılmıyordu.


SQL YAMALARI — SIRAYLA ÇALIŞTIRIN
  1) yama-profil.sql
  2) yama-coklu-yonetici.sql
  3) yama-kod-sifre.sql
  4) yama-kisi-sil.sql


═══════════════════════════════════════════════════════════════════
FAZ 3 VE SONRASI (yeni)
═══════════════════════════════════════════════════════════════════

BİLDİR SEKMESİ KALDIRILDI
  Sakin menüsünden çıkarıldı. Talep açma artık Operasyon ekranından.

OPERASYON DÖRT ALT SEKMEYE AYRILDI
  Talepler · Bildiriler · Rutinler · Görevliler

  YETKİ MATRİSİ
                          Sakin  Görevli  Yönetici
  Talep/bildiri aç          ✓       ✓        ✓
  Üstlen                    —       ✓        ✓
  Tamamla                   —       ✓        ✓
  Sil                       —       —        ✓

  Görevli HİÇBİR kaydı silemez — kendi açtığını bile. Yalnızca
  yönetici siler. Hoşuna gitmeyen talebi silmesini engellemek için.

BİLDİRİ MODÜLÜ
  Yeni tablo açılmadı; talepler tablosuna "tur" alanı eklendi.
  İki kayıt türü aynı alanları kullanıyor — tek tablo, tek RLS seti.

  Bildiri kapatılırken FOTOĞRAF ZORUNLU. Zorunluluk veritabanı
  tetikleyicisinde uygulanıyor; istemci kodu değişse bile kural bozulmaz.

GÖREVLİ KASA GÖREMİYOR (Karar 3)
  Menüden kasa ve aidat çıkarıldı, RLS politikası da güncellendi.
  Sakinler ve yöneticiler görmeye devam ediyor.

BİLDİRİM SİSTEMİ
  Üst çubukta zil ikonu, okunmamış sayısı rozet olarak.
  Yüksek önemli varsa rozet kırmızı.

  Bildirim üreten olaylar:
    Duyuru yayınlandı        -> sitedeki herkes
    Yeni talep/bildiri       -> yönetici + görevliler
    Üstlenildi / atandı      -> açan kişi + atanan görevli
    Tamamlandı               -> açan kişi
    Yeni anket               -> sakinler + yöneticiler
    Rezervasyon bekliyor     -> yöneticiler
    Rezervasyon onay/red     -> talep eden
    Yönetici başvurusu       -> kurucu
    Başvuru kararı           -> başvuran

  Kimse kendi eylemi için bildirim almaz.
  Kullanıcı Ayarlar > Bildirim tercihleri'nden grup kapatabilir;
  aidat ve sistem bildirimleri kapatılamaz.

  60 saniyede bir yoklama yapılır; sekme görünmüyorken durur.
  Push bildirim mobil uygulamayla gelecek — bu tablo aynen kullanılacak.

YAPAY ZEKÂ İLE MAKALE ÜRETİMİ
  Yönetim paneli > Blog > "Yapay zekâ ile üret"
  Konu, anahtar kelime, uzunluk ve üslup girilir.

  ⚠ NETLIFY ORTAM DEĞİŞKENİ GEREKLİ
     GEMINI_API_KEY
  Google AI Studio'dan ücretsiz alınır. Netlify > Environment
  variables bölümüne eklenir. ANAHTAR ASLA KODA YAZILMAZ.

  Üretilen yazı HER ZAMAN TASLAK olarak kaydedilir. Yapay zekâ yanlış
  kanun maddesi ya da rakam üretebilir; okumadan yayınlamayın.
  Oran sınırı: 5 dakikada en fazla 3 makale.


SQL YAMALARI — SIRAYLA
  1) yama-profil.sql
  2) yama-coklu-yonetici.sql
  3) yama-kod-sifre.sql
  4) yama-kisi-sil.sql
  5) yama-bildiri.sql
  6) yama-bildirim.sql

NETLIFY ORTAM DEĞİŞKENLERİ
  SUPABASE_SERVICE_ROLE_KEY   (şifre sıfırlama + makale üretimi)
  GEMINI_API_KEY              (makale üretimi)
  SITE_URL                    (zaten ekli)


═══════════════════════════════════════════════════════════════════
19 MADDELİK REVİZYON — BU TURDA TAMAMLANANLAR
═══════════════════════════════════════════════════════════════════

Madde 1  (Auth kod ile giriş)         zaten dogruydu, sekme etiketi netlestirildi
Madde 2  (Bildiriler kaldirilmasi)    tamamlandi, onceki turda
Madde 3.1(Gorevli talep acamasin)     TAMAMLANDI — dugme + RLS INSERT
Madde 5  (Talep fotografi)            TAMAMLANDI — galeri/kamera secici,
                                       tamamlama fotografi geri geldi (bildiri
                                       kaldirilirken yanlislikla kaybolmustu)
Madde 6  (Giris Kaydet kaldirilsin)   TAMAMLANDI — tek buton kaldi, gorevliye acildi
Madde 7  (WhatsApp yalniz yonetici)   TAMAMLANDI — daha once HERKESE acikti
Madde 8  (Toplanti isim listesi)      TAMAMLANDI — acilir liste, kim ne oy verdi
Madde 9  (Site kayit mantigi)         zaten dogruydu (davet kodu + site arama)
Madde 16 (Demirbas yetki duzeltmesi)  TAMAMLANDI — sakin goruyor, gorevli
                                       artik duzenleyemiyor (onceki durum tersti)

HENUZ YAPILMAYANLAR (bkz. PROJECT_STATUS.md)
  Madde 3.2 / 4  talepler ve rutinler RLS SELECT — Supabase panelinden
                 gercek politika metni once okunmali
  Madde 10-15    makbuz + dijital imza sistemi — hic baslanmadi, en buyuk is
  Madde 17       typography denetimi — hic yapilmadi

⚠ ÖNEMLİ — RLS POLİTİKA ÇAKIŞMA RİSKİ
  yama-talep-yetki.sql dosyasini calistirmadan once icindeki kontrol
  sorgusunu calistir. talepler tablosunda baska isimde eski bir INSERT
  politikasi varsa, RLS politikalari OR ile birlesir ve yeni politika
  eskisini GECERSIZ KILMAZ. Ikisi birlikte calisirsa gorevli yine talep
  acabilir. Sorguyu calistirdiktan sonra sonucu bana yaz, gerekirse
  eski politikayi da kaldiralim.

SQL YAMALARI — SIRAYLA (öncekilere ek)
  ... (önceki liste) ...
  7) yama-talep-yetki.sql   — ÖNCE içindeki kontrol sorgusunu çalıştır
  8) yama-demirbas-yetki.sql


═══════════════════════════════════════════════════════════════════
MADDE 3.2 VE 4 — KESIN COZUM (RLS panelden okunarak)
═══════════════════════════════════════════════════════════════════

pg_policies sorgusuyla kok sebep bulundu:

  talepler tablosunda yonetici olmayan biri (sakin VEYA gorevli)
  yalnizca "acan = auth.uid()" olan, yani KENDI ACTIGI kayitlari
  gorebiliyordu. Bu, "bir sakin talep acti, digerleri goremedigi
  icin ayni sorunu tekrar bildirdi" sikayetinin tam kok sebebiydi.

  rutinler tablosu zaten DOGRUYDU — degisiklik gerekmedi.

⚠ ONEMLI: sql/yama-talep-yetki.sql dosyasi SILINDI/IPTAL EDILDI.
O dosya tahmini bir politika adi kullaniyordu (talep_ekle). Gercek
politika adinin p_talepler_insert oldugu ortaya cikti — eger o eski
dosya calistirilmis olsaydi iki politika OR ile birlesip gorevliyi
gercekte ENGELLEMEYECEKTI.

YENI DOGRU DOSYA: sql/yama-talep-rls-duzelt.sql
  - p_talepler_select: artik herkes gorebiliyor (rutinler ile ayni desen)
  - p_talepler_insert: gorevli haric herkes talep acabiliyor

Eger daha once yama-talep-yetki.sql'i calistirdiysen, once sunu calistir:
  drop policy if exists talep_ekle on public.talepler;

ONEMLI KESIF: Proje iki paralel RLS yardimci fonksiyon ailesi kullaniyor:
  Yeni (bu oturumda eklenenler) : kp_site_id(), kp_yonetici_mi() vb.
  Eski (talepler/rutinler)      : benim_site(), yonetici_mi(), super_mi()
Ikisini karistirma. Ayrinti CLAUDE.md'de.



═══════════════════════════════════════════════════════════════════
DİJİTAL MAKBUZ VE İMZA SİSTEMİ (Madde 10-15, tamamlandı)
═══════════════════════════════════════════════════════════════════

AKIŞ
  Yönetici "Ödendi işaretle" der
    → makbuz onizleme ekrani acilir (site + daire + tutar otomatik)
    → tutar duzenlenebilir
    → yonetici canvas uzerine parmak/mouse ile imza atar — ZORUNLU
    → "Makbuzu Kes ve Onayla"
    → tek RPC cagrisi hem makbuzu olusturur hem aidati "Odendi" yapar
      (gercek Postgres transaction — biri basarisiz olursa ikisi de
      geri sarilir, yetim kayit kalmaz)

MAKBUZ NUMARASI
  MK-<site onegi>-<YYYYMM>-<sira>  ornek: MK-CS-202608-0007

IPTAL (onay geri alma)
  Aidat "beyan edildi" durumuna doner (sakinin beyani silinmez, yalnizca
  yoneticinin onayi geri alinir). Makbuz veritabanindan TAMAMEN silinir,
  yalnizca gizlenmez. Imza dosyasi da Storage'dan siliniyor.

BELGE ARSIVI'NE EKLENENLER
  Makbuzlarim   — sakin/sitede oturan yonetici kendi makbuzlarini gorur
  Tum Makbuzlar — yalnizca yonetici, sitedeki butun makbuzlar

STORAGE
  Yeni ozel kova: makbuzlar (2 MB limit, yalnizca imza PNG'i icin)
  Yol: <site_id>/<daire_id>/<uuid>.png

⚠ ONEMLI: eski odeme_onayla RPC'sine DOKUNULMADI, cagirilmiyor artik.
Kaynagi bu depoda olmadigi icin icini bilmeden sarmalamak riskliydi.
Yeni fonksiyon yalnizca kesin bilinen sutunlara dokunuyor
(site_id, daire_id, yil, ay, durum). Eger odemeler tablosunda o donem
icin bir tahakkuk satiri yoksa (yani aidat hic tahakkuk etmemisse)
makbuz kesilemez, anlamli hata doner — bu beklenen davranistir, once
aidat tahakkuku olusmali.

SQL YAMASI — 8. sirada calistir
  8) sql/yama-makbuz.sql


═══════════════════════════════════════════════════════════════════
MADDE 17 — TYPOGRAPHY STANDARDİZASYONU (tamamlandı, plan bitti)
═══════════════════════════════════════════════════════════════════

68 baslik (<h2>) tarandi, her biri modal mi sayfa basligi mi otomatik
siniflandirildi. Ayni bilesen 19 farkli boyut/bosluk kombinasyonuyla
yaziliydi. Kod tabaninin kendi baskin degerlerine yakinsandi:

  Modal basligi        -> 19px  (34 yer)
  Sayfa ici bolum       -> 16px  (19 inline + .sectitle CSS kurali)
  Tam sayfa basligi     -> 22px  (11 yer)

Yazdirilabilir makbuz sablonu (beyaz zemin) ve WhatsApp yesili gibi
kasitli renkler DEGISTIRILMEDI — bunlar hata degil.

⚠ SQL DEGISIKLIGI YOK — bu madde yalnizca index.html'de CSS/inline
stil duzenlemesi. Yeni yama dosyasi gerekmiyor.

═══════════════════════════════════════════════════════════════════
19 MADDELİK REVİZYON PLANI — TAMAMLANDI
═══════════════════════════════════════════════════════════════════
Simdi yapilmasi gereken: genel test. GOREV-PLANI.md ve PROJECT_STATUS.md
dosyalarinda her maddenin nihai durumu ve ilgili dosya/satirlar var.


═══════════════════════════════════════════════════════════════════
YAPAY ZEKÂ MAKALE ÜRETİMİ — İKİ DÜZELTME/EKLEME
═══════════════════════════════════════════════════════════════════

1) MODEL ADI DÜZELTİLDİ
   gemini-2.0-flash 31 Mart 2026'da Google tarafından emekliye
   ayrıldı. "Yapay zekâ servisi yanıt vermedi" hatasının sebebi buydu.
   Model artık: gemini-2.5-flash (kararlı, GA, şu an desteklenen).

2) OTOMATİK KONU SEÇİMİ (SEO ODAKLI) EKLENDİ
   Yönetim paneli > Blog > Yapay zekâ ile üret ekranında artık iki mod var:

     "Konuyu ben yazayım"     — eskisi gibi, konu ve anahtar kelime elle girilir
     "Konuyu AI seçsin (SEO)" — konu alanı devre dışı kalır

   AI SEÇSİN modunda:
     - Sunucu önce admin_makale_listesi RPC'siyle sitedeki TÜM makale
       BAŞLIKLARINI çeker (içerikleri değil — gereksiz token harcanmasın)
     - Bu başlıkları Gemini'ye gösterip "bunlardan farklı, dar ve
       spesifik, Türkiye'de site/apartman yönetimi aramalarında üst
       sıraya çıkma ihtimali yüksek bir konu seç" der
     - Gemini konuyu kendi seçer, o konuda makaleyi yazar
     - Hangi konuyu seçtiği üretim bittiğinde bildirimde gösterilir

   Bu sayede "üret" dedikçe hep aynı ya da birbirine çok benzeyen
   konular çıkmıyor; her makale öncekilerden haberdar üretiliyor.

⚠ SQL DEĞİŞİKLİĞİ YOK — yalnızca netlify/functions/makale-uret.mjs
ve admin.html değişti. Yeni yama dosyası gerekmiyor, yalnızca zip'i
yeniden deploy etmen yeterli.


═══════════════════════════════════════════════════════════════════
MAKBUZ ONAYLAMA HATASI DÜZELTİLDİ
═══════════════════════════════════════════════════════════════════
Hata: "column reference id is ambiguous" — imza atılıp "Makbuzu Kes ve
Onayla" dendiğinde çıkıyordu.

Sebep: makbuz_olustur_ve_onayla fonksiyonu RETURNS TABLE(id uuid,...)
tanımlıyor. İçinde iki yerde niteliksiz "id" kullanılmıştı
(siteler/daireler tablosundan çekerken) — fonksiyonun kendi çıkış
parametresi olan "id" ile çakışıyordu. Bilinen hata kalıbı, bu projede
daha önce rezervasyon_gun'da da yaşanmıştı.

⚠ ÇALIŞTIRILACAK: yama-makbuz-duzeltme.sql (Supabase SQL Editor)
   Yalnızca tek fonksiyonu düzeltilmiş hâliyle yeniden tanımlıyor.
   sql/yama-makbuz.sql dosyası da güncellendi (sıfırdan kuruluma bu
   düzeltme dahil).
