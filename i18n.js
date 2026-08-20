/**
 * =============================================================================
 *  KONUT PANEL — Universal Multi-Language Engine (i18n.js)
 *  Supported Languages: Türkçe (TR), English (EN), Русский (RU), Deutsch (DE)
 *  Features:
 *   - Auto-detects device/browser language on first visit (e.g. Russian -> RU)
 *   - User manual language switcher with flags in header & dropdown
 *   - Syncs with localStorage ('kp_lang' and 'oa_lang') across web app & static pages
 *   - Translates all landing page sections, 12 building story steps, feature grids,
 *     pricing tables, FAQ accordions, demo forms, footer links, and subpages
 * =============================================================================
 */

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['tr', 'en', 'ru', 'de'];

  const LANG_NAMES = {
    tr: { name: 'Türkçe', flag: '🇹🇷', code: 'TR' },
    en: { name: 'English', flag: '🇬🇧', code: 'EN' },
    ru: { name: 'Русский', flag: '🇷🇺', code: 'RU' },
    de: { name: 'Deutsch', flag: '🇩🇪', code: 'DE' }
  };

  /**
   * Cihaz/Tarayıcı dilini tespit eder (Örn: Rusça cihaz -> ru)
   */
  function detectLanguage() {
    try {
      const saved = localStorage.getItem('kp_lang') || localStorage.getItem('oa_lang');
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        return saved;
      }
    } catch (_) {}

    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || 'tr'];
    for (const lang of browserLangs) {
      if (!lang) continue;
      const clean = lang.toLowerCase().split('-')[0];
      if (SUPPORTED_LANGS.includes(clean)) {
        return clean;
      }
    }
    return 'tr';
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 12 ADIMLIK BİNA / SAKİNLER NE DİYOR VERİLERİ (TR / EN / RU / DE)
   * ═══════════════════════════════════════════════════════════════════════════ */
  const BUILDING_STEPS = {
    tr: [
      { p:8,  sat:3, no:'Daire 8 — 3. kat',        kim:'Sakin',                ad:'Aidat ödeme ve makbuz',   s:'aidat',   metin:'“Aidatı tek tıkla ödedim, makbuz anında telefonuma düştü. Ne dekont fotoğrafı gönderdim ne de kapı çaldım.”' },
      { p:5,  sat:2, no:'Daire 5 — 2. kat',        kim:'Sakin',                ad:'Ziyaretçi defteri',       s:'ziyaret', metin:'“Online ziyaretçi defteri sayesinde siteye kimin girdiğini görebiliyorum. Plakası, saati, hangi daireye geldiği kayıtlı.”' },
      { p:11, sat:4, no:'Daire 11 — 4. kat',       kim:'Sakin',                ad:'Arıza ve talep takibi',   s:'ariza',   metin:'“Otoparktaki kırık lambayı fotoğrafla bildirdim. Talebim numara aldı, iki gün sonra çözüldü bildirimi geldi.”' },
      { p:2,  sat:1, no:'Daire 2 — 1. kat',        kim:'Kat maliki',           ad:'Gelir-gider şeffaflığı',  s:'kasa',    metin:'“Sitenin kasasında ne var, para nereye harcanmış — hepsi açık. Artık yıl sonu toplantısında kimse tartışmıyor.”' },
      { p:9,  sat:3, no:'Daire 9 — 3. kat',        kim:'Sakin',                ad:'Duyuru ve bildirim',      s:'duyuru',  metin:'“Asansör bakımı duyurusu bildirim olarak geldi. Asansöre yapıştırılan kâğıdı görmediğim için mağdur olmadım.”' },
      { p:6,  sat:2, no:'Daire 6 — 2. kat',        kim:'Sakin',                ad:'Anket ve oylama',         s:'oylama',  metin:'“Havuz saatleri için oylama açıldı, telefondan oy verdim. Kimse toplantı için akşamını ayırmak zorunda kalmadı.”' },
      { p:12, sat:4, no:'Daire 12 — 4. kat',       kim:'Sakin',                ad:'Ortak alan rezervasyonu', s:'rezerve', metin:'“Spor salonunu cumartesi sabahına telefondan ayırttım. Kapıda kimseyle sıra tartışması yaşamıyoruz.”' },
      { p:3,  sat:1, no:'Daire 3 — 1. kat',        kim:'Kiracı',               ad:'Kiracı ve malik ayrımı',  s:'kiraci',  metin:'“Aidatı ben ödüyorum, demirbaş payını ev sahibim. Sistem ikisini ayrı tutuyor, kimse kimseye borçlu kalmıyor.”' },
      { p:7,  sat:3, no:'Daire 7 — Yönetim odası', kim:'Site yöneticisi',      ad:'Yönetici raporları',      s:'rapor',   metin:'“Ay sonu raporunu tek tuşla aldım. Kim ne kadar borçlu, hangi gider hangi kaleme girmiş — dosya hazır.”' },
      { p:4,  sat:2, no:'Daire 4 — 2. kat',        kim:'Denetim kurulu üyesi', ad:'Yönetim devri ve arşiv',  s:'arsiv',   metin:'“Yönetim değişti ama hiçbir kayıt kaybolmadı. Yeni yönetici aynı sisteme girdi, geçmiş olduğu gibi duruyor.”' },
      { p:10, sat:4, no:'Daire 10 — 4. kat',       kim:'Kat maliki',           ad:'Belge arşivi',            s:'belge',   metin:'“Yönetim planı, sigorta poliçesi, asansör raporu… Hepsi belgeler bölümünde. Aradığımda buluyorum.”' },
      { p:1,  sat:1, no:'Daire 1 — 1. kat',        kim:'Sakin',                ad:'İki türlü kurulum',       s:'kurulum', metin:'“Uygulama mağazasından indirmeyi bilmiyordum. Yöneticinin gönderdiği linke tıkladım, telefon sordu, evet dedim; ana ekranıma eklendi.”' }
    ],
    en: [
      { p:8,  sat:3, no:'Apt 8 — 3rd floor',       kim:'Resident',             ad:'Dues payment & receipt',  s:'aidat',   metin:'“I paid my dues with one click, and the receipt appeared instantly on my phone. No photos of paper slips or door knocking.”' },
      { p:5,  sat:2, no:'Apt 5 — 2nd floor',       kim:'Resident',             ad:'Visitor logbook',         s:'ziyaret', metin:'“Thanks to the digital visitor log, I can see who enters our building. Plate number, time, and target apartment are all logged.”' },
      { p:11, sat:4, no:'Apt 11 — 4th floor',      kim:'Resident',             ad:'Issue & ticket tracking', s:'ariza',   metin:'“I submitted a photo of the broken parking lot light. It received a ticket number and was marked resolved two days later.”' },
      { p:2,  sat:1, no:'Apt 2 — 1st floor',       kim:'Property Owner',       ad:'Financial transparency',  s:'kasa',    metin:'“What is in the funds, where every cent is spent — all crystal clear. No more endless debates at the annual general meeting.”' },
      { p:9,  sat:3, no:'Apt 9 — 3rd floor',       kim:'Resident',             ad:'Announcements & alerts',  s:'duyuru',  metin:'“The elevator maintenance notice was pushed to my phone. I didn’t miss out because of an unread paper on the wall.”' },
      { p:6,  sat:2, no:'Apt 6 — 2nd floor',       kim:'Resident',             ad:'Polls & voting',          s:'oylama',  metin:'“A poll was opened for pool opening hours and I voted from my phone. Nobody had to sacrifice their evening for a meeting.”' },
      { p:12, sat:4, no:'Apt 12 — 4th floor',      kim:'Resident',             ad:'Amenity reservation',     s:'rezerve', metin:'“I booked the gym for Saturday morning directly from my phone. No more disputes about turns at the entrance.”' },
      { p:3,  sat:1, no:'Apt 3 — 1st floor',       kim:'Tenant',               ad:'Tenant & owner split',    s:'kiraci',  metin:'“I pay the recurring maintenance, my landlord pays fixture investments. The system separates them automatically.”' },
      { p:7,  sat:3, no:'Apt 7 — Management room', kim:'Property Manager',     ad:'Management reports',      s:'rapor',   metin:'“I generated the month-end balance sheet with a single click. Who owes what and all expense ledgers are instantly ready.”' },
      { p:4,  sat:2, no:'Apt 4 — 2nd floor',       kim:'Audit Board Member',   ad:'Handover & archiving',    s:'arsiv',   metin:'“The management changed but not a single record was lost. The new manager stepped into the same system seamlessly.”' },
      { p:10, sat:4, no:'Apt 10 — 4th floor',      kim:'Property Owner',       ad:'Document repository',     s:'belge',   metin:'“Management charter, insurance policies, elevator inspection certificates… All safe in the digital archive.”' },
      { p:1,  sat:1, no:'Apt 1 — 1st floor',       kim:'Resident',             ad:'Two install methods',     s:'kurulum', metin:'“I didn’t want to install from an app store. I opened the link, tapped add to home screen, and was ready in 5 seconds.”' }
    ],
    ru: [
      { p:8,  sat:3, no:'Кв. 8 — 3-й этаж',        kim:'Житель',               ad:'Оплата взносов и чек',    s:'aidat',   metin:'«Оплатил взнос в один клик, электронный чек мгновенно появился в телефоне. Никаких фото квитанций и походов к коменданту.»' },
      { p:5,  sat:2, no:'Кв. 5 — 2-й этаж',        kim:'Житель',               ad:'Журнал посетителей',      s:'ziyaret', metin:'«Благодаря онлайн-журналу я вижу, кто въезжает на территорию. Номер машины, время и квартира — всё зафиксировано.»' },
      { p:11, sat:4, no:'Кв. 11 — 4-й этаж',       kim:'Житель',               ad:'Заявки на ремонт',        s:'ariza',   metin:'«Сфотографировал перегоревшую лампу на парковке. Заявка получила номер, а через два дня пришло уведомление об устранении.»' },
      { p:2,  sat:1, no:'Кв. 2 — 1-й этаж',        kim:'Собственник',          ad:'Прозрачность кассы',      s:'kasa',    metin:'«Всё открыто: сколько денег в кассе, на что потрачено. Больше никаких споров на общем собрании жильцов.»' },
      { p:9,  sat:3, no:'Кв. 9 — 3-й этаж',        kim:'Житель',               ad:'Объявления и пуши',       s:'duyuru',  metin:'«Уведомление о техобслуживании лифта пришло прямо в телефон. Я ничего не пропустил из-за объявлений на стене.»' },
      { p:6,  sat:2, no:'Кв. 6 — 2-й этаж',        kim:'Житель',               ad:'Опросы и голосование',    s:'oylama',  metin:'«Открыли голосование по графику работы бассейна, проголосовал со смартфона за 10 секунд. Не пришлось тратить вечер на собрание.»' },
      { p:12, sat:4, no:'Кв. 12 — 4-й этаж',       kim:'Житель',               ad:'Бронь общих зон',         s:'rezerve', metin:'«Забронировал тренажерный зал на утро субботы через телефон. Никаких очередей и споров у дверей.»' },
      { p:3,  sat:1, no:'Кв. 3 — 1-й этаж',        kim:'Арендатор',            ad:'Разделение счетов',       s:'kiraci',  metin:'«Я оплачиваю текущие коммунальные расходы, а собственник — капитальный ремонт. Система разделяет счета без путаницы.»' },
      { p:7,  sat:3, no:'Кв. 7 — Офис управления', kim:'Управляющий',          ad:'Отчеты руководства',      s:'rapor',   metin:'«Сформировал отчет за месяц в один клик. Кто сколько должен, какие расходы куда пошли — всё готово для проверки.»' },
      { p:4,  sat:2, no:'Кв. 4 — 2-й этаж',        kim:'Член ревиз. комиссии', ad:'Передача дел и архив',    s:'arsiv',   metin:'«Руководство сменилось, но ни одна запись не потерялась. Новый управляющий вошел в ту же систему со всей историей.»' },
      { p:10, sat:4, no:'Кв. 10 — 4-й этаж',       kim:'Собственник',          ad:'Архив документов',        s:'belge',   metin:'«Устав, страховые полисы, акты проверки лифтов… Всё в разделе документов под рукой в любой момент.»' },
      { p:1,  sat:1, no:'Кв. 1 — 1-й этаж',        kim:'Житель',               ad:'Два способа входа',       s:'kurulum', metin:'«Перешел по ссылке от управляющего, телефон предложил добавить на главный экран, и всё готово без скачивания из магазинов.»' }
    ],
    de: [
      { p:8,  sat:3, no:'Whg. 8 — 3. OG',          kim:'Bewohner',             ad:'Hausgeld & Belege',       s:'aidat',   metin:'„Ich habe das Hausgeld mit einem Klick bezahlt, der Beleg war sofort auf meinem Smartphone. Kein Suchen nach Papierbelegen.“' },
      { p:5,  sat:2, no:'Whg. 5 — 2. OG',          kim:'Bewohner',             ad:'Digitales Besucherbuch',  s:'ziyaret', metin:'„Dank des Besucherbuchs sehe ich genau, wer die Anlage betritt. Kennzeichen, Uhrzeit und Zielwohnung sind erfasst.“' },
      { p:11, sat:4, no:'Whg. 11 — 4. OG',         kim:'Bewohner',             ad:'Schadensmeldungen',       s:'ariza',   metin:'„Habe die defekte Beleuchtung in der Tiefgarage fotografiert. Ticket erstellt, zwei Tage später kam die Erledigt-Meldung.“' },
      { p:2,  sat:1, no:'Whg. 2 — 1. OG',          kim:'Eigentümer',           ad:'Finanztransparenz',       s:'kasa',    metin:'„Jeder Euro ist nachvollziehbar: Was in der Kasse ist und wohin das Geld fließt. Keine Diskussionen mehr bei der Versammlung.“' },
      { p:9,  sat:3, no:'Whg. 9 — 3. OG',          kim:'Bewohner',             ad:'Mitteilungen & Alerts',   s:'duyuru',  metin:'„Wartungshinweis für den Aufzug kam direkt als Push-Meldung. Nichts mehr verpassen, weil man einen Papieraushang übersieht.“' },
      { p:6,  sat:2, no:'Whg. 6 — 2. OG',          kim:'Bewohner',             ad:'Umfragen & Beschlüsse',   s:'oylama',  metin:'„Abstimmung über Pool-Öffnungszeiten direkt am Smartphone erledigt. Niemand musste dafür den Feierabend opfern.“' },
      { p:12, sat:4, no:'Whg. 12 — 4. OG',         kim:'Bewohner',             ad:'Raumreservierung',        s:'rezerve', metin:'„Fitnessraum für Samstagmorgen reserviert. Keine Überschneidungen und keine Diskussionen an der Tür.“' },
      { p:3,  sat:1, no:'Whg. 3 — 1. OG',          kim:'Mieter',               ad:'Mieter & Eigentümer',     s:'kiraci',  metin:'„Ich zahle die Betriebskosten, mein Vermieter die Instandhaltungsrücklage. Das System trennt beides sauber.“' },
      { p:7,  sat:3, no:'Whg. 7 — Verwalterbüro',  kim:'Hausverwalter',        ad:'Verwalterberichte',       s:'rapor',   metin:'„Monatsabschlussbericht mit einem Klick exportiert. Offene Posten und Kostenstellen sofort griffbereit.“' },
      { p:4,  sat:2, no:'Whg. 4 — 2. OG',          kim:'Beiratsmitglied',      ad:'Übergabe & Archiv',       s:'arsiv',   metin:'„Verwalterwechsel ohne Datenverlust. Der neue Verwalter übernimmt ein lückenloses digitales Archiv.“' },
      { p:10, sat:4, no:'Whg. 10 — 4. OG',         kim:'Eigentümer',           ad:'Dokumentenarchiv',        s:'belge',   metin:'„Teilungserklärung, Versicherungspolicen, TÜV-Berichte… Alles zentral im Dokumentenbereich auffindbar.“' },
      { p:1,  sat:1, no:'Whg. 1 — 1. OG',          kim:'Bewohner',             ad:'Zwei Installationswege',  s:'kurulum', metin:'„Einfach auf den Link der Verwaltung geklickt, Bestätigung gedrückt und schon lag die App auf meinem Startbildschirm.“' }
    ]
  };

  /* ═══════════════════════════════════════════════════════════════════════════
   * ÇEVİRİ SÖZLÜĞÜ (TR / EN / RU / DE)
   * ═══════════════════════════════════════════════════════════════════════════ */
  const DICT = {
    tr: {
      nav_cozumler: "Çözümler",
      nav_blog: "Blog",
      nav_giris_uzun: "Giriş yap / Kaydol",
      nav_giris_kisa: "Giriş / Kaydol",
      nav_demo: "Demo isteyin",
      nav_demo_kisa: "Demo",
      nav_anasayfa: "Ana sayfa",

      hero_etiket: "Site ve apartman yönetim programı",
      hero_h1_em: "Aidat kovalamayı",
      hero_h1_rest: " bırakın.",
      hero_p: "Kim ödedi, kim ödemedi, kasada ne var, hangi arıza bekliyor — hepsi tek ekranda ve anlık. Defter, dağınık Excel ve kimsenin okumadığı WhatsApp grubu olmadan.",
      hero_btn_demo: "Ücretsiz demo isteyin",
      hero_btn_how: "Nasıl çalıştığını görün",
      hero_btn_pwa: "İndirmeden Kullan",
      hero_not_1: "Kurulum ücreti yok",
      hero_not_2: "İster indirin, ister indirmeden kullanın",
      hero_not_3: "Veriniz sizde kalır",

      story_sayac_suffix: "daire aydınlandı",

      feat_etiket: "Tek pakette",
      feat_title: "Yöneticinin bütün işi, tek panelde",
      feat_desc: "Sakinin gördüğü sade uygulama ve yöneticinin kullandığı panel aynı veriyi paylaşır. Kimse aynı bilgiyi iki kere girmez.",
      feat_1_h: "Aidat ve borç", feat_1_p: "Tahakkuk otomatik, gecikme ayrı. Herkes yalnızca kendi borcunu görür.",
      feat_2_h: "Gelir-gider ve kasa", feat_2_p: "Toplanan, harcanan, kalan. Ay kapanışı ve yıllık rapor tek tuşla.",
      feat_3_h: "Duyurular", feat_3_p: "Su kesintisi, bakım, toplantı çağrısı. Asansöre kâğıt asmadan.",
      feat_4_h: "Arıza ve talep", feat_4_p: "Fotoğrafla bildirilir, numara alır, durumu izlenir.",
      feat_5_h: "Ziyaretçi defteri", feat_5_p: "Siteye giren kişi, plaka ve saat kayıt altında.",
      feat_6_h: "Ortak alan rezervasyonu", feat_6_p: "Spor salonu, toplantı odası, kort. Sakin uygun saati ayırtır.",
      feat_7_h: "Anket ve oylama", feat_7_p: "Kararları dijital toplayın, sonuç anında görünsün.",
      feat_8_h: "Demirbaş ve bakım", feat_8_p: "Asansör, jeneratör, hidrofor. Bakım tarihi yaklaşınca hatırlatır.",
      feat_9_h: "Yetki ve roller", feat_9_p: "Yönetici, denetim, güvenlik, malik, kiracı. Herkes yetkisi kadarını görür.",

      how_etiket: "Üç adım",
      how_title: "Bugün başlarsanız, bu akşam sakinler girebilir",
      how_desc: "Kurulum sihirbazı blok ve daire sayısını sorar, düzeni sizin yerinize kurar. Elinizde Excel varsa toplu aktarırız.",
      how_1_h: "Siteyi tanımlayın", how_1_p: "Blok ve daire sayısını girin. Tek apartmansanız blok sayısına 1 yazmanız yeterli; sistem daire listesini kendisi oluşturur.",
      how_2_h: "Sakinleri davet edin", how_2_p: "Her daireye özel davet kodu üretilir. Sakin kodu girer, kendi dairesine bağlanır. Kodları WhatsApp grubundan toplu paylaşabilirsiniz.",
      how_3_h: "Aidatı çalıştırın", how_3_p: "Aylık tutarı ve dağıtım şeklini belirleyin. Tahakkuk otomatik işlenir, borç ekranı ilk günden doğru çalışır.",

      price_etiket: "Fiyatlandırma",
      price_title: "Tek paket, gizli kalem yok",
      price_desc: "Modül modül satmıyoruz. Ne varsa hepsi dahil. Yalnızca ödeme sıklığını seçiyorsunuz.",
      price_monthly_title: "Aylık ödeme",
      price_monthly_amount: "50 ₺",
      price_monthly_unit: "+ KDV / daire / ay",
      price_monthly_note: "+ KDV · Her ay faturalanır, istediğiniz zaman bırakabilirsiniz.",
      price_monthly_example: "50 daireli site → aylık <b>2.500 ₺</b> + KDV",
      price_yearly_badge: "%30 indirimli",
      price_yearly_title: "Yıllık ödeme",
      price_yearly_amount: "35 ₺",
      price_yearly_unit: "+ KDV / daire / ay",
      price_yearly_note: "+ KDV · Yıllık toplu peşin faturalanır.",
      price_yearly_example: "50 daireli site → yıllık <b>21.000 ₺</b> + KDV<br><span class=\"kazanc\">Aylık ödemeye göre yılda 9.000 ₺ tasarruf</span>",
      price_included_title: "İki pakette de aynısı var",
      price_offer_btn: "Sitenize özel teklif alın",
      price_offer_note: "Daire sayınıza göre net tutarı birlikte hesaplayalım. Kurulum ve eğitim ücretsiz.",

      faq_etiket: "Sık sorulanlar",
      faq_title: "Yöneticilerin en çok sorduğu sorular",
      faq_1_q: "Tek apartman için de kullanılabiliyor mu?",
      faq_1_a: "Evet. Kurulumda blok sayısına 1 yazmanız yeterli. Sistem tek blokluk bir apartman düzeni kurar; site için var olan bütün özellikler aynı şekilde çalışır.",
      faq_2_q: "Sakinler birbirinin borcunu görebiliyor mu?",
      faq_2_a: "Hayır. Her sakin yalnızca kendi dairesine ait borç ve ödemeleri görür. Sitenin toplam gelir-gider özetini paylaşmak ise yöneticinin tercihindedir.",
      faq_3_q: "Elimizdeki Excel listesini aktarabilir miyiz?",
      faq_3_a: "Evet. Daire, sakin ve borç listelerinizi Excel olarak yükleyebilir, aynı şekilde bütün verinizi istediğiniz an Excel olarak indirebilirsiniz.",
      faq_4_q: "Uygulama indirmek zorunda mıyız?",
      faq_4_a: "Hayır, iki seçeneğiniz var. İsterseniz App Store veya Google Play’den indirirsiniz. İsterseniz hiç indirmeden, siteye girip “İndirmeden Kullan” düğmesine basarsınız — uygulama telefonunuzun veya bilgisayarınızın ana ekranına eklenir ve doğrudan açılır.",
      faq_5_q: "Yönetim değişince veriler ne oluyor?",
      faq_5_a: "Hesap siteye aittir, kişiye değil. Yönetici değiştiğinde yetkiler devredilir; geçmiş kayıtlar, raporlar ve belgeler yerinde kalır.",
      faq_6_q: "Kiracı ile ev sahibinin borcu ayrılıyor mu?",
      faq_6_a: "Evet. Aidat ve ortak gider kiracıya, demirbaş ve büyük onarım payı malike yazılabilir. İkisi de yalnızca kendi borcunu görür.",

      demo_etiket: "Demo ve randevu",
      demo_title: "Sitenizi 20 dakikada birlikte kuralım",
      demo_desc: "Formu doldurun, size uygun saatte arayalım. Ekran paylaşarak sitenizin gerçek daire listesiyle demo hesabı açıyoruz — anlatmak yerine gösteriyoruz.",
      demo_lbl_name: "Ad soyad", demo_ph_name: "Adınız soyadınız",
      demo_lbl_phone: "Telefon", demo_ph_phone: "0 5__ ___ __ __",
      demo_lbl_email: "E-posta", demo_ph_email: "ornek@eposta.com",
      demo_lbl_site: "Site / apartman adı", demo_ph_site: "Örn. Papatya Konakları",
      demo_lbl_units: "Daire sayısı",
      demo_lbl_time: "Ne zaman arayalım?",
      demo_lbl_notes: "Eklemek istedikleriniz", demo_ph_notes: "Şu an aidat takibini nasıl yapıyorsunuz?",
      demo_btn_submit: "Demo talebi gönderin",

      about_etiket: "Hakkımızda",
      about_title: "Site yönetimini kâğıttan kurtarmak için kurduk",
      about_p1: "Konut Panel, apartman ve site yönetimlerinin gündelik işini tek bir yerde toplamak için geliştirildi. Aidat defterinin, dağınık Excel dosyalarının ve kimsenin okumadığı WhatsApp gruplarının yerini alan sade bir sistem kurmak istedik.",
      about_p2: "Ürünü sahadan gelen geri bildirimlerle geliştiriyoruz: gerçek yöneticilerle konuşuyor, gerçek sitelerde deniyor ve isteneni ekliyoruz. Bir özelliğin var olması bizim için yeterli değil; her sakinin kolayca kullanabilmesi gerekiyor.",
      about_p3: "Yazılım modern bulut mimarisiyle geliştirildi, çok dilli arayüzü ve yerel yönetim mevzuatına uygun yapısıyla güvenli bir yönetim deneyimi sunar.",

      close_title: "Sitenizin ışıklarını yakalım",
      close_desc: "Demo hesabınızı bugün açalım, ilk aidat dönemini birlikte kuralım.",
      close_btn_demo: "Demo isteyin",
      close_btn_login: "Giriş yapın",

      footer_copy: "Konut Panel. Tüm hakları saklıdır.",
      footer_terms: "Kullanım koşulları",
      footer_privacy: "Gizlilik",
      footer_kvkk: "KVKK",
      footer_dpa: "Veri işleyen sözleşmesi"
    },

    en: {
      nav_cozumler: "Solutions",
      nav_blog: "Blog",
      nav_giris_uzun: "Sign In / Register",
      nav_giris_kisa: "Sign In / Up",
      nav_demo: "Request Demo",
      nav_demo_kisa: "Demo",
      nav_anasayfa: "Home",

      hero_etiket: "Property & HOA Management Software",
      hero_h1_em: "Stop chasing",
      hero_h1_rest: " HOA dues.",
      hero_p: "Who paid, who is overdue, what is in the bank, pending repairs — all on a single real-time dashboard. No notebooks, messy spreadsheets, or noisy chat groups.",
      hero_btn_demo: "Request a Free Demo",
      hero_btn_how: "See How It Works",
      hero_btn_pwa: "Use Without Installing",
      hero_not_1: "No setup fees",
      hero_not_2: "Download the app or use as instant web app",
      hero_not_3: "Your data stays yours",

      story_sayac_suffix: "units illuminated",

      feat_etiket: "All-in-One",
      feat_title: "All property operations on one unified screen",
      feat_desc: "The clean portal residents see and the management console managers use share the same synchronized live data. No double entry.",
      feat_1_h: "Dues & Balances", feat_1_p: "Automated billing and late interest. Every resident sees only their own balance.",
      feat_2_h: "Cashflow & Expenses", feat_2_p: "Collections, expenses, live treasury balance. Generate monthly and annual reports in one click.",
      feat_3_h: "Announcements", feat_3_p: "Water cuts, maintenance alerts, meeting notices. No paper notices on hallway walls.",
      feat_4_h: "Maintenance & Tickets", feat_4_p: "Submit with photos, get ticket numbers, track resolution status live.",
      feat_5_h: "Visitor Logbook", feat_5_p: "Record guest entries, courier visits, vehicle plates, and timestamps safely.",
      feat_6_h: "Amenity Booking", feat_6_p: "Fitness centers, meeting halls, tennis courts. Residents reserve available slots instantly.",
      feat_7_h: "Polls & Voting", feat_7_p: "Collect decisions digitally with transparent, instantaneous tallies.",
      feat_8_h: "Equipment & Assets", feat_8_p: "Elevators, generators, pumps. Receive automated maintenance reminders.",
      feat_9_h: "Roles & Permissions", feat_9_p: "Managers, auditors, guards, owners, tenants. Tailored granular permission levels.",

      how_etiket: "Three Simple Steps",
      how_title: "Start today, residents can log in tonight",
      how_desc: "The setup wizard configures your blocks and units automatically. Import existing Excel lists in seconds.",
      how_1_h: "1. Define your property", how_1_p: "Enter block and apartment count. For single buildings, simply enter 1 block; the system auto-generates unit lists.",
      how_2_h: "2. Invite residents", how_2_p: "A unique code is generated for each unit. Residents enter their code to connect securely.",
      how_3_h: "3. Run your billing", how_3_p: "Set monthly amounts and distribution rules. Dues are billed automatically on day one.",

      price_etiket: "Transparent Pricing",
      price_title: "One complete tier, zero hidden fees",
      price_desc: "We don't sell add-ons piecemeal. Every feature is included. You simply choose billing frequency.",
      price_monthly_title: "Monthly Billing",
      price_monthly_amount: "50 ₺",
      price_monthly_unit: "+ VAT / unit / mo",
      price_monthly_note: "+ VAT · Billed monthly, cancel anytime without lock-in.",
      price_monthly_example: "50-unit property → <b>2,500 ₺</b> / month + VAT",
      price_yearly_badge: "30% Discount",
      price_yearly_title: "Annual Billing",
      price_yearly_amount: "35 ₺",
      price_yearly_unit: "+ VAT / unit / mo",
      price_yearly_note: "+ VAT · Billed annually upfront.",
      price_yearly_example: "50-unit property → <b>21,000 ₺</b> / year + VAT<br><span class=\"kazanc\">Save 9,000 ₺ per year vs monthly</span>",
      price_included_title: "Included in all plans",
      price_offer_btn: "Get Custom Quote",
      price_offer_note: "Let's calculate your exact quote based on unit count. Setup and staff onboarding are included.",

      faq_etiket: "FAQ",
      faq_title: "Frequently Asked Questions",
      faq_1_q: "Can this be used for a single apartment building?",
      faq_1_a: "Yes. Simply set the block count to 1 during setup. The system configures a tailored single-building hierarchy with all full features enabled.",
      faq_2_q: "Can residents see each other's financial debt?",
      faq_2_a: "No. Each resident exclusively accesses their own apartment's debts and transaction receipts. General financial summaries remain at the manager's discretion.",
      faq_3_q: "Can we import our existing Excel sheets?",
      faq_3_a: "Yes. You can upload unit, resident, and dues history via Excel, and export your entire dataset anytime in CSV/Excel formats.",
      faq_4_q: "Do residents need to download an app from an app store?",
      faq_4_a: "No, you have options. Residents can download from App Store/Google Play, or tap 'Use Without Installing' to add our instant web app directly to their home screen.",
      faq_5_q: "What happens when management changes?",
      faq_5_a: "The account belongs to the building, not a private person. Transferring privileges to a new manager keeps all historical archives and accounts fully intact.",
      faq_6_q: "Are tenant and landlord balances separated?",
      faq_6_a: "Yes. Monthly recurring dues can be assigned to tenants, while capital improvements and fixture funds are assigned to owners.",

      demo_etiket: "Demo & Appointment",
      demo_title: "Let's set up your property together in 20 minutes",
      demo_desc: "Fill in the form and we'll schedule a screen-sharing demo with your actual unit roster.",
      demo_lbl_name: "Full Name", demo_ph_name: "Your full name",
      demo_lbl_phone: "Phone Number", demo_ph_phone: "+1 (555) 000-0000",
      demo_lbl_email: "Email Address", demo_ph_email: "name@company.com",
      demo_lbl_site: "Property / Building Name", demo_ph_site: "e.g. Maple Residences",
      demo_lbl_units: "Unit Count",
      demo_lbl_time: "Best time to call?",
      demo_lbl_notes: "Additional notes", demo_ph_notes: "How are you currently managing HOA dues?",
      demo_btn_submit: "Submit Demo Request",

      about_etiket: "About Us",
      about_title: "Built to liberate property management from paper",
      about_p1: "Konut Panel was engineered to bring all daily building operations into one unified cloud solution. We replace paper ledgers, fragmented Excel files, and chaotic group chats with clarity.",
      about_p2: "We build directly from real feedback from property managers and residents, ensuring our software is intuitive for people of all technical backgrounds.",
      about_p3: "Built on high-performance cloud architecture, offering multi-language support and compliance with modern data privacy standards.",

      close_title: "Illuminate your property today",
      close_desc: "Open your demo account today and configure your first billing cycle with our team.",
      close_btn_demo: "Request Demo",
      close_btn_login: "Sign In",

      footer_copy: "Konut Panel. All rights reserved.",
      footer_terms: "Terms of Service",
      footer_privacy: "Privacy Policy",
      footer_kvkk: "GDPR / KVKK",
      footer_dpa: "Data Processing Agreement"
    },

    ru: {
      nav_cozumler: "Решения",
      nav_blog: "Блог",
      nav_giris_uzun: "Войти / Регистрация",
      nav_giris_kisa: "Войти / Рег.",
      nav_demo: "Запросить демо",
      nav_demo_kisa: "Демо",
      nav_anasayfa: "Главная",

      hero_etiket: "Программа для управления домами и ЖК",
      hero_h1_em: "Забудьте о погоне",
      hero_h1_rest: " за взносами.",
      hero_p: "Кто заплатил, кто должен, остаток в кассе, текущие аварии — всё на одном прозрачном экране в реальном времени. Без бумажных журналов, разрозненных таблиц Excel и шумных чатов.",
      hero_btn_demo: "Бесплатное демо",
      hero_btn_how: "Как это работает",
      hero_btn_pwa: "Использовать без установки",
      hero_not_1: "Без платы за подключение",
      hero_not_2: "В приложении или прямо в браузере",
      hero_not_3: "Ваши данные принадлежат вам",

      story_sayac_suffix: "квартир освещено",

      feat_etiket: "Всё в одном",
      feat_title: "Вся работа управляющего на одном экране",
      feat_desc: "Удобный кабинет для жильцов и панель управления синхронизированы в реальном времени. Никакого двойного ввода данных.",
      feat_1_h: "Взносы и задолженности", feat_1_p: "Автоматические начисления, учет пеней. Каждый житель видит только свои счета.",
      feat_2_h: "Касса, доходы и расходы", feat_2_p: "Сборы, траты, баланс. Формирование месячных и годовых отчетов в один клик.",
      feat_3_h: "Объявления и пуши", feat_3_p: "Отключения воды, ремонт, собрания. Без бумажных объявлений в подъездах.",
      feat_4_h: "Заявки на ремонт", feat_4_p: "Отправка с фото, присвоение номера, онлайн-контроль статуса выполнения.",
      feat_5_h: "Журнал посетителей", feat_5_p: "Учет гостей, курьеров, номеров авто и времени въезда для охраны.",
      feat_6_h: "Бронирование зон", feat_6_p: "Тренажерный зал, конференц-зал, корт. Жители сами выбирают свободное время.",
      feat_7_h: "Опросы и голосования", feat_7_p: "Электронное голосование по домовым вопросам с мгновенным подведением итогов.",
      feat_8_h: "Оборудование и ТО", feat_8_p: "Лифты, генераторы, насосы. Автоматические напоминания о плановом техобслуживании.",
      feat_9_h: "Роли и доступы", feat_9_p: "Управляющий, ревизор, охрана, собственник, арендатор. Разграничение прав доступа.",

      how_etiket: "Три простых шага",
      how_title: "Подключитесь сегодня — жильцы смогут войти уже вечером",
      how_desc: "Мастер настройки автоматически создаст структуру блоков и квартир. Есть готовый список в Excel? Загрузим за минуту.",
      how_1_h: "1. Укажите параметры дома", how_1_p: "Введите количество блоков и квартир. Для одного дома достаточно указать 1 блок.",
      how_2_h: "2. Пригласите жильцов", how_2_p: "Для каждой квартиры генерируется код приглашения. Жители вводят код и сразу попадают в свой кабинет.",
      how_3_h: "3. Запустите начисления", how_3_p: "Укажите размер ежемесячного взноса. Начисления будут формироваться автоматически.",

      price_etiket: "Прозрачные тарифы",
      price_title: "Один полный тариф, без скрытых платежей",
      price_desc: "Мы не продаем модули по отдельности. В тариф включено абсолютно всё. Вы выбираете только период оплаты.",
      price_monthly_title: "Ежемесячная оплата",
      price_monthly_amount: "50 ₺",
      price_monthly_unit: "+ НДС / кв. / мес.",
      price_monthly_note: "+ НДС · Оплата каждый месяц, отмена в любое время.",
      price_monthly_example: "Дом на 50 квартир → <b>2.500 ₺</b> в месяц + НДС",
      price_yearly_badge: "Скидка 30%",
      price_yearly_title: "Годовая оплата",
      price_yearly_amount: "35 ₺",
      price_yearly_unit: "+ НДС / кв. / мес.",
      price_yearly_note: "+ НДС · Оплата разовым платежом за год.",
      price_yearly_example: "Дом на 50 квартир → <b>21.000 ₺</b> в год + НДС<br><span class=\"kazanc\">Экономия 9.000 ₺ в год по сравнению с помесячной оплатой</span>",
      price_included_title: "В оба тарифа входит всё:",
      price_offer_btn: "Получить индивидуальный расчет",
      price_offer_note: "Рассчитаем точную стоимость под количество квартир. Настройка и обучение бесплатны.",

      faq_etiket: "Вопросы и ответы",
      faq_title: "Часто задаваемые вопросы",
      faq_1_q: "Подходит ли программа для одного отдельного дома?",
      faq_1_a: "Да. При регистрации просто укажите 1 блок. Система создаст оптимальную структуру для одного дома со всеми доступными функциями.",
      faq_2_q: "Видят ли соседи долги друг друга?",
      faq_2_a: "Нет. Каждый житель видит исключительно свои начисления и платежи. Публикация общего финансового отчета остается на усмотрение управляющего.",
      faq_3_q: "Можно ли загрузить данные из нашей таблицы Excel?",
      faq_3_a: "Да. Вы можете загрузить списки квартир, жильцов и историю взносов через Excel, а также в любой момент выгрузить всю базу.",
      faq_4_q: "Обязательно ли жильцам скачивать приложение?",
      faq_4_a: "Нет, есть выбор. Можно скачать из App Store / Google Play, либо открыть сайт и нажать «Использовать без установки», добавив PWA на экран телефона.",
      faq_5_q: "Что происходит с данными при смене управляющего?",
      faq_5_a: "Аккаунт привязан к объекту недвижимости, а не к человеку. При смене руководства права передаются новому управляющему, вся история и документы сохраняются.",
      faq_6_q: "Разделяются ли счета собственника и арендатора?",
      faq_6_a: "Да. Текущие коммунальные взносы можно выставлять арендатору, а взносы на капремонт — собственнику квартиры.",

      demo_etiket: "Демо и консультация",
      demo_title: "Настроим ваш дом вместе за 20 минут",
      demo_desc: "Заполните форму, и мы проведем онлайн-демонстрацию на примере вашего реального списка квартир.",
      demo_lbl_name: "Имя и фамилия", demo_ph_name: "Ваше имя",
      demo_lbl_phone: "Телефон", demo_ph_phone: "+7 (999) 000-00-00",
      demo_lbl_email: "Электронная почта", demo_ph_email: "example@mail.ru",
      demo_lbl_site: "Название ЖК / дома", demo_ph_site: "Например, ЖК Солнечный",
      demo_lbl_units: "Количество квартир",
      demo_lbl_time: "Удобное время для звонка",
      demo_lbl_notes: "Комментарий", demo_ph_notes: "Как вы сейчас ведете учет взносов?",
      demo_btn_submit: "Отправить заявку на демо",

      about_etiket: "О сервисе",
      about_title: "Создано, чтобы избавить управление домами от бумажной рутины",
      about_p1: "Konut Panel объединяет все повседневные задачи управления недвижимостью в единой облачной системе. Мы заменяем бумажные журналы и сложные таблицы удобным сервисом.",
      about_p2: "Продукт постоянно совершенствуется на основе отзывов реальных управляющих и жильцов, оставаясь простым и понятным для любого возраста.",
      about_p3: "Сервис работает на базе надежной облачной инфраструктуры, поддерживает мультиязычность и отвечает высоким стандартам безопасности данных.",

      close_title: "Включите свет в вашем доме",
      close_desc: "Откройте демо-аккаунт сегодня и настройте первый расчетный период вместе с нами.",
      close_btn_demo: "Запросить демо",
      close_btn_login: "Войти в систему",

      footer_copy: "Konut Panel. Все права защищены.",
      footer_terms: "Условия использования",
      footer_privacy: "Конфиденциальность",
      footer_kvkk: "Защита персональных данных",
      footer_dpa: "Договор обработки данных"
    },

    de: {
      nav_cozumler: "Lösungen",
      nav_blog: "Blog",
      nav_giris_uzun: "Anmelden / Registrieren",
      nav_giris_kisa: "Anmelden / Reg.",
      nav_demo: "Demo anfordern",
      nav_demo_kisa: "Demo",
      nav_anasayfa: "Startseite",

      hero_etiket: "Software für Haus- und Liegenschaftsverwaltung",
      hero_h1_em: "Schluss mit dem",
      hero_h1_rest: " Hinterherlaufen von Hausgeldern.",
      hero_p: "Wer hat bezahlt, wer ist im Rückstand, wie hoch ist der Kassenstand, welche Reparaturen stehen an — alles auf einem zentralen Dashboard in Echtzeit.",
      hero_btn_demo: "Kostenlose Demo anfordern",
      hero_btn_how: "Funktionsweise ansehen",
      hero_btn_pwa: "Ohne Download nutzen",
      hero_not_1: "Keine Einrichtungsgebühr",
      hero_not_2: "Als App laden oder direkt im Browser nutzen",
      hero_not_3: "Ihre Daten gehören Ihnen",

      story_sayac_suffix: "Einheiten beleuchtet",

      feat_etiket: "Alles in einem Paket",
      feat_title: "Die gesamte Hausverwaltung auf einem Bildschirm",
      feat_desc: "Das übersichtliche Bewohnerportal und die Verwaltungsplattform nutzen dieselben Live-Daten.",
      feat_1_h: "Hausgeld & Rückstände", feat_1_p: "Automatische Sollstellung und Verzugsberechnung. Bewohner sehen nur die eigenen Beträge.",
      feat_2_h: "Finanzen & Kasse", feat_2_p: "Einnahmen, Ausgaben und Kontostand in Echtzeit. Monats- und Jahresberichte per Mausklick.",
      feat_3_h: "Mitteilungen", feat_3_p: "Wartungen, Reparaturen und Versammlungstermine digital versenden statt Papieraushang.",
      feat_4_h: "Schadensmeldungen", feat_4_p: "Schadensfotos hochladen, Ticketnummer erhalten und Bearbeitungsstatus verfolgen.",
      feat_5_h: "Besucherbuch", feat_5_p: "Erfassung von Gästen, Lieferanten, Kennzeichen und Uhrzeiten für Sicherheitsdienste.",
      feat_6_h: "Raumreservierung", feat_6_p: "Fitnessräume, Gemeinschaftsräume oder Plätze bequem digital buchen.",
      feat_7_h: "Umfragen & Beschlüsse", feat_7_p: "Digitale Abstimmungen mit sofortiger, transparenter Auswertung.",
      feat_8_h: "Wartung & Inventar", feat_8_p: "Aufzüge, Heizungsanlagen, Pumpen. Automatische Erinnerung an anstehende Prüftermine.",
      feat_9_h: "Rollen & Rechte", feat_9_p: "Verwalter, Beirat, Sicherheitsdienst, Eigentümer, Mieter mit abgestuften Rechten.",

      how_etiket: "In drei Schritten",
      how_title: "Heute starten, heute Abend sind die Bewohner online",
      how_desc: "Der Einrichtungsassistent legt Gebäude und Wohneinheiten automatisch an. Excel-Listen können direkt importiert werden.",
      how_1_h: "1. Gebäude anlegen", how_1_p: "Anzahl der Eingänge und Einheiten eingeben. Bei Einzeleinheiten genügt 1 Block.",
      how_2_h: "2. Bewohner einladen", how_2_p: "Jede Einheit erhält einen individuellen Zugangscode zur sicheren Verknüpfung.",
      how_3_h: "3. Beiträge aktivieren", how_3_p: "Monatsbeitrag festlegen. Die Sollstellung erfolgt vollautomatisch ab Tag eins.",

      price_etiket: "Transparente Preise",
      price_title: "Ein Komplettpaket, keine versteckten Kosten",
      price_desc: "Kein Modul-Zukauf nötig. Alle Funktionen sind enthalten. Sie wählen nur das Abrechnungsintervall.",
      price_monthly_title: "Monatliche Zahlung",
      price_monthly_amount: "50 ₺",
      price_monthly_unit: "+ MwSt. / Einheit / Monat",
      price_monthly_note: "+ MwSt. · Monatlich kündbar, volle Flexibilität.",
      price_monthly_example: "Anlage mit 50 Einheiten → <b>2.500 ₺</b> / Monat + MwSt.",
      price_yearly_badge: "30% Rabatt",
      price_yearly_title: "Jährliche Zahlung",
      price_yearly_amount: "35 ₺",
      price_yearly_unit: "+ MwSt. / Einheit / Monat",
      price_yearly_note: "+ MwSt. · Jährliche Einmalzahlung.",
      price_yearly_example: "Anlage mit 50 Einheiten → <b>21.000 ₺</b> / Jahr + MwSt.<br><span class=\"kazanc\">9.000 ₺ Ersparnis pro Jahr gegenüber monatlicher Zahlung</span>",
      price_included_title: "In beiden Paketen komplett enthalten:",
      price_offer_btn: "Individuelles Angebot anfordern",
      price_offer_note: "Wir berechnen den genauen Betrag für Ihre Liegenschaft. Einrichtung und Schulung inklusive.",

      faq_etiket: "Häufige Fragen",
      faq_title: "Häufig gestellte Fragen von Verwaltern",
      faq_1_q: "Eignet sich das System auch für einzelne Mehrfamilienhäuser?",
      faq_1_a: "Ja. Tragen Sie bei der Einrichtung einfach 1 Block ein. Das System passt die Struktur optimal an ein einzelnes Gebäude an.",
      faq_2_q: "Können Bewohner die Zahlungsdaten anderer Nachbarn einsehen?",
      faq_2_a: "Nein. Jeder Bewohner sieht ausschließlich die eigenen Buchungen und Außenstände.",
      faq_3_q: "Können bestehende Excel-Listen importiert werden?",
      faq_3_a: "Ja. Wohnungs-, Eigentümer- und Beitragslisten lassen sich bequem per Excel importieren und jederzeit exportieren.",
      faq_4_q: "Muss zwingend eine App aus dem App Store geladen werden?",
      faq_4_a: "Nein. Sie können die native App laden oder über 'Ohne Download nutzen' direkt als moderne Web App auf dem Startbildschirm speichern.",
      faq_5_q: "Was geschieht bei einem Wechsel der Hausverwaltung?",
      faq_5_a: "Das Konto gehört der Liegenschaft. Bei einem Verwalterwechsel werden Zugriffsrechte übertragen; das gesamte digitale Archiv bleibt vollständig erhalten.",
      faq_6_q: "Werden Mieter- und Eigentümerkosten getrennt erfasst?",
      faq_6_a: "Ja. Laufende Betriebskosten können Mietern und Instandhaltungsrücklagen den Eigentümern zugeordnet werden.",

      demo_etiket: "Demo & Beratung",
      demo_title: "Lassen Sie uns Ihre Anlage in 20 Minuten einrichten",
      demo_desc: "Füllen Sie das Formular aus. Wir zeigen Ihnen das System per Bildschirmübertragung an Ihrem echten Objekt.",
      demo_lbl_name: "Vor- und Nachname", demo_ph_name: "Ihr vollständiger Name",
      demo_lbl_phone: "Telefonnummer", demo_ph_phone: "+49 (0) 123 456789",
      demo_lbl_email: "E-Mail-Adresse", demo_ph_email: "name@beispiel.de",
      demo_lbl_site: "Name der Liegenschaft / Wohnanlage", demo_ph_site: "z.B. Parkresidenz",
      demo_lbl_units: "Anzahl Einheiten",
      demo_lbl_time: "Wann dürfen wir Sie anrufen?",
      demo_lbl_notes: "Anmerkungen", demo_ph_notes: "Wie erfassen Sie derzeit Ihr Hausgeld?",
      demo_btn_submit: "Demo-Anfrage absenden",

      about_etiket: "Über uns",
      about_title: "Entwickelt, um die Hausverwaltung papierlos zu machen",
      about_p1: "Konut Panel bündelt alle täglichen Aufgaben der Liegenschaftsverwaltung in einer einzigen, intuitiven Cloud-Plattform.",
      about_p2: "Wir entwickeln die Software im ständigen Dialog mit Praktikern und stellen sicher, dass auch technisch weniger affine Bewohner sie mühelos nutzen können.",
      about_p3: "Entwickelt nach modernsten Standards für Datenschutz, Verfügbarkeit und Mehrsprachigkeit.",

      close_title: "Bringen Sie Licht in Ihre Hausverwaltung",
      close_desc: "Starten Sie heute Ihr Demokonto und richten Sie die erste Abrechnungsperiode mit uns ein.",
      close_btn_demo: "Demo anfordern",
      close_btn_login: "Anmelden",

      footer_copy: "Konut Panel. Alle Rechte vorbehalten.",
      footer_terms: "Nutzungsbedingungen",
      footer_privacy: "Datenschutzerklärung",
      footer_kvkk: "DSGVO-Hinweise",
      footer_dpa: "Auftragsverarbeitungsvertrag"
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
   * DİL DEĞİŞTİRME & DOM GÜNCELLEME MOTORU
   * ═══════════════════════════════════════════════════════════════════════════ */

  let currentLang = detectLanguage();

  function t(key, lang = currentLang) {
    const l = DICT[lang] || DICT.tr;
    return l[key] || DICT.tr[key] || key;
  }

  function setLanguage(lang, reload = false) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    try {
      localStorage.setItem('kp_lang', lang);
      localStorage.setItem('oa_lang', lang);
    } catch (_) {}

    document.documentElement.lang = lang;

    applyTranslations();
    updateLanguageButtons();

    window.dispatchEvent(new CustomEvent('kp-lang-changed', { detail: { lang } }));

    if (reload) {
      location.reload();
    }
  }

  /**
   * Sayfadaki tüm metinleri seçilen dile göre günceller.
   */
  function applyTranslations() {
    const d = DICT[currentLang] || DICT.tr;

    // 1. data-i18n niteliği taşıyan elemanlar
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (d[key]) {
        el.textContent = d[key];
      }
    });

    // 2. data-i18n-html niteliği taşıyanlar
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (d[key]) {
        el.innerHTML = d[key];
      }
    });

    // 3. data-i18n-placeholder niteliği taşıyanlar
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (d[key]) {
        el.setAttribute('placeholder', d[key]);
      }
    });

    // 4. Ana Sayfa ve Alt Sayfalar için Kapsamlı DOM Güncellemesi
    applyLandingPageSpecifics(d);
  }

  /**
   * anasayfa.html ve diğer sayfalardaki tüm bölümleri günceller
   */
  function applyLandingPageSpecifics(d) {
    // Header / Nav
    const solBag = document.querySelector('.ust-sag a[href="/site-yonetim-programi"], .ust-sag a[href*="cozumler"]');
    if (solBag) solBag.textContent = d.nav_cozumler;

    const blogBag = document.querySelector('.ust-sag a[href="/blog"], .ust nav a[href="/blog"], header nav a[href="/blog"]');
    if (blogBag) blogBag.textContent = d.nav_blog;

    const homeBag = document.querySelector('header nav a[href="/"], .ust nav a[href="/"]');
    if (homeBag) homeBag.textContent = d.nav_anasayfa;

    const girisBtnUzun = document.querySelector('.giris-btn .uzun');
    if (girisBtnUzun) girisBtnUzun.textContent = d.nav_giris_uzun;

    const girisBtnKisa = document.querySelector('.giris-btn .kisa, header nav a[href="/uygulama"], .ust nav a[href="/uygulama"]');
    if (girisBtnKisa) girisBtnKisa.textContent = d.nav_giris_kisa;

    const demoUstBtn = document.querySelector('.ust-sag button.dugme-ana');
    if (demoUstBtn) {
      const dUzun = demoUstBtn.querySelector('.uzun');
      const dKisa = demoUstBtn.querySelector('.kisa');
      if (dUzun || dKisa) {
        // spanli yapi: ust yaziyi silme, uzun/kisa etiketleri ayri ayri yaz
        if (dUzun) dUzun.textContent = d.nav_demo;
        if (dKisa) dKisa.textContent = d.nav_demo_kisa || d.nav_demo;
      } else {
        demoUstBtn.textContent = d.nav_demo;
      }
    }

    // Hero Section
    const heroEtiket = document.querySelector('.giris .etiket');
    if (heroEtiket) heroEtiket.textContent = d.hero_etiket;

    const heroH1 = document.querySelector('.giris h1');
    if (heroH1) {
      heroH1.innerHTML = `<em>${d.hero_h1_em}</em>${d.hero_h1_rest}`;
    }

    const heroP = document.querySelector('.giris-alt');
    if (heroP) heroP.textContent = d.hero_p;

    const heroDemoBtn = document.querySelector('.giris-dugmeler button.dugme-ana');
    if (heroDemoBtn) {
      heroDemoBtn.innerHTML = `${d.hero_btn_demo} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
    }

    const heroHowBtn = document.querySelector('.giris-dugmeler button[data-git="1"]');
    if (heroHowBtn) heroHowBtn.textContent = d.hero_btn_how;

    const heroPwaSpan = document.querySelector('#kurBtn1 span');
    if (heroPwaSpan && heroPwaSpan.textContent.indexOf('✓') === -1) {
      heroPwaSpan.textContent = d.hero_btn_pwa;
    }

    const heroNotes = document.querySelectorAll('.giris-notlar span');
    if (heroNotes.length >= 3) {
      const tikSvg = '<svg class="tik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ';
      heroNotes[0].innerHTML = tikSvg + d.hero_not_1;
      heroNotes[1].innerHTML = tikSvg + d.hero_not_2;
      heroNotes[2].innerHTML = tikSvg + d.hero_not_3;
    }

    // 12 Building Story Steps (ADIMLAR)
    const translatedSteps = BUILDING_STEPS[currentLang] || BUILDING_STEPS.tr;
    if (window.ADIMLAR && Array.isArray(window.ADIMLAR)) {
      for (let i = 0; i < window.ADIMLAR.length && i < translatedSteps.length; i++) {
        window.ADIMLAR[i].no = translatedSteps[i].no;
        window.ADIMLAR[i].kim = translatedSteps[i].kim;
        window.ADIMLAR[i].ad = translatedSteps[i].ad;
        window.ADIMLAR[i].metin = translatedSteps[i].metin;
      }
      if (typeof window.KP_adimGoster === 'function') {
        const curAdim = typeof window.KP_getAdim === 'function' ? window.KP_getAdim() : 0;
        window.KP_adimGoster(curAdim, false);
      }
    }

    // Features Section
    const featEtiket = document.querySelector('section[data-ad="Özellikler"] .etiket, section:nth-of-type(3) .etiket');
    if (featEtiket) featEtiket.textContent = d.feat_etiket;

    const featH2 = document.querySelector('section[data-ad="Özellikler"] h2, section:nth-of-type(3) h2');
    if (featH2) featH2.textContent = d.feat_title;

    const featDesc = document.querySelector('section[data-ad="Özellikler"] .baslik p, section:nth-of-type(3) .baslik p');
    if (featDesc) featDesc.textContent = d.feat_desc;

    const featCards = document.querySelectorAll('.izgara .hucre');
    const featKeys = [
      { h: 'feat_1_h', p: 'feat_1_p' },
      { h: 'feat_2_h', p: 'feat_2_p' },
      { h: 'feat_3_h', p: 'feat_3_p' },
      { h: 'feat_4_h', p: 'feat_4_p' },
      { h: 'feat_5_h', p: 'feat_5_p' },
      { h: 'feat_6_h', p: 'feat_6_p' },
      { h: 'feat_7_h', p: 'feat_7_p' },
      { h: 'feat_8_h', p: 'feat_8_p' },
      { h: 'feat_9_h', p: 'feat_9_p' }
    ];
    featCards.forEach((card, idx) => {
      if (featKeys[idx]) {
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        if (h3 && d[featKeys[idx].h]) h3.textContent = d[featKeys[idx].h];
        if (p && d[featKeys[idx].p]) p.textContent = d[featKeys[idx].p];
      }
    });

    // How to Start Section
    const howEtiket = document.querySelector('section[data-ad="Nasıl başlanır"] .etiket');
    if (howEtiket) howEtiket.textContent = d.how_etiket;

    const howH2 = document.querySelector('section[data-ad="Nasıl başlanır"] h2');
    if (howH2) howH2.textContent = d.how_title;

    const howDesc = document.querySelector('section[data-ad="Nasıl başlanır"] .baslik p');
    if (howDesc) howDesc.textContent = d.how_desc;

    const howSteps = document.querySelectorAll('.adimlar .adim');
    const howKeys = [
      { h: 'how_1_h', p: 'how_1_p' },
      { h: 'how_2_h', p: 'how_2_p' },
      { h: 'how_3_h', p: 'how_3_p' }
    ];
    howSteps.forEach((step, idx) => {
      if (howKeys[idx]) {
        const h3 = step.querySelector('h3');
        const p = step.querySelector('p');
        if (h3 && d[howKeys[idx].h]) h3.textContent = d[howKeys[idx].h];
        if (p && d[howKeys[idx].p]) p.textContent = d[howKeys[idx].p];
      }
    });

    // Pricing Section
    const priceEtiket = document.querySelector('section[data-ad="Fiyat"] .etiket');
    if (priceEtiket) priceEtiket.textContent = d.price_etiket;

    const priceH2 = document.querySelector('section[data-ad="Fiyat"] h2');
    if (priceH2) priceH2.textContent = d.price_title;

    const priceDesc = document.querySelector('section[data-ad="Fiyat"] .baslik p');
    if (priceDesc) priceDesc.textContent = d.price_desc;

    const paketler = document.querySelectorAll('.paketler .paket');
    if (paketler.length >= 2) {
      // Monthly
      const mAd = paketler[0].querySelector('.paket-ad');
      const mRakam = paketler[0].querySelector('.paket-rakam');
      const mNot = paketler[0].querySelector('.paket-not');
      const mOrnek = paketler[0].querySelector('.paket-ornek');
      if (mAd) mAd.textContent = d.price_monthly_title;
      if (mRakam) mRakam.innerHTML = `<b>${d.price_monthly_amount}</b><span>${d.price_monthly_unit}</span>`;
      if (mNot) mNot.textContent = d.price_monthly_note;
      if (mOrnek) mOrnek.innerHTML = d.price_monthly_example;

      // Yearly
      const yRozet = paketler[1].querySelector('.rozet');
      const yAd = paketler[1].querySelector('.paket-ad');
      const yRakam = paketler[1].querySelector('.paket-rakam');
      const yNot = paketler[1].querySelector('.paket-not');
      const yOrnek = paketler[1].querySelector('.paket-ornek');
      if (yRozet) yRozet.textContent = d.price_yearly_badge;
      if (yAd) yAd.textContent = d.price_yearly_title;
      if (yRakam) yRakam.innerHTML = `<b>${d.price_yearly_amount}</b><span>${d.price_yearly_unit}</span>`;
      if (yNot) yNot.textContent = d.price_yearly_note;
      if (yOrnek) yOrnek.innerHTML = d.price_yearly_example;
    }

    const yanBaslik = document.querySelector('.paket-yan .yan-baslik');
    if (yanBaslik) yanBaslik.textContent = d.price_included_title;

    const teklifBtn = document.querySelector('.paket-yan button[data-git="6"]');
    if (teklifBtn) teklifBtn.textContent = d.price_offer_btn;

    const yanNot = document.querySelector('.paket-yan .yan-not');
    if (yanNot) yanNot.textContent = d.price_offer_note;

    // FAQ Section
    const faqEtiket = document.querySelector('section[data-ad="Sık sorulanlar"] .etiket');
    if (faqEtiket) faqEtiket.textContent = d.faq_etiket;

    const faqH2 = document.querySelector('section[data-ad="Sık sorulanlar"] h2');
    if (faqH2) faqH2.textContent = d.faq_title;

    const faqItems = document.querySelectorAll('.sss details');
    const faqKeys = [
      { q: 'faq_1_q', a: 'faq_1_a' },
      { q: 'faq_2_q', a: 'faq_2_a' },
      { q: 'faq_3_q', a: 'faq_3_a' },
      { q: 'faq_4_q', a: 'faq_4_a' },
      { q: 'faq_5_q', a: 'faq_5_a' },
      { q: 'faq_6_q', a: 'faq_6_a' }
    ];
    faqItems.forEach((item, idx) => {
      if (faqKeys[idx]) {
        const sum = item.querySelector('summary');
        const p = item.querySelector('p');
        if (sum && d[faqKeys[idx].q]) sum.textContent = d[faqKeys[idx].q];
        if (p && d[faqKeys[idx].a]) p.textContent = d[faqKeys[idx].a];
      }
    });

    // Demo Section
    const demoEtiket = document.querySelector('section[data-ad="Demo ve iletişim"] .etiket');
    if (demoEtiket) demoEtiket.textContent = d.demo_etiket;

    const demoH2 = document.querySelector('section[data-ad="Demo ve iletişim"] h2');
    if (demoH2) demoH2.textContent = d.demo_title;

    const demoDesc = document.querySelector('section[data-ad="Demo ve iletişim"] .iletisim p');
    if (demoDesc) demoDesc.textContent = d.demo_desc;

    // Demo Form Inputs & Placeholders
    const inputAd = document.getElementById('ad');
    if (inputAd) inputAd.placeholder = d.demo_ph_name;

    const inputTel = document.getElementById('telefon');
    if (inputTel) inputTel.placeholder = d.demo_ph_phone;

    const inputEposta = document.getElementById('eposta');
    if (inputEposta) inputEposta.placeholder = d.demo_ph_email;

    const inputSite = document.getElementById('site');
    if (inputSite) inputSite.placeholder = d.demo_ph_site;

    const inputMesaj = document.getElementById('mesaj');
    if (inputMesaj) inputMesaj.placeholder = d.demo_ph_notes;

    const demoSubmitBtn = document.getElementById('demoBtn');
    if (demoSubmitBtn) demoSubmitBtn.textContent = d.demo_btn_submit;

    // About Us Section
    const aboutEtiket = document.querySelector('section[data-ad="Hakkımızda"] .etiket');
    if (aboutEtiket) aboutEtiket.textContent = d.about_etiket;

    const aboutH2 = document.querySelector('section[data-ad="Hakkımızda"] h2');
    if (aboutH2) aboutH2.textContent = d.about_title;

    const aboutParas = document.querySelectorAll('section[data-ad="Hakkımızda"] .hakkinda p');
    if (aboutParas.length >= 3) {
      aboutParas[0].textContent = d.about_p1;
      aboutParas[1].textContent = d.about_p2;
      aboutParas[2].textContent = d.about_p3;
    }

    // Closing CTA Section
    const closeH2 = document.querySelector('.kapanis h2');
    if (closeH2) closeH2.textContent = d.close_title;

    const closeP = document.querySelector('.kapanis p');
    if (closeP) closeP.textContent = d.close_desc;

    const closeDemoBtn = document.querySelector('.kapanis-dugmeler button[data-git="6"]');
    if (closeDemoBtn) closeDemoBtn.textContent = d.close_btn_demo;

    const closeLoginBtn = document.querySelector('.kapanis-dugmeler a[href="/uygulama"]');
    if (closeLoginBtn) closeLoginBtn.textContent = d.close_btn_login;

    // Footers across all pages
    const footerLinks = document.querySelectorAll('footer a, .alt a');
    footerLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.includes('kullanim-kosullari')) link.textContent = d.footer_terms;
      else if (href.includes('gizlilik')) link.textContent = d.footer_privacy;
      else if (href.includes('kvkk')) link.textContent = d.footer_kvkk;
      else if (href.includes('veri-isleyen')) link.textContent = d.footer_dpa;
    });

    const ctaSections = document.querySelectorAll('section.cta');
    ctaSections.forEach((sec) => {
      const h2 = sec.querySelector('h2');
      const p = sec.querySelector('p');
      const btn1 = sec.querySelector('.btn:not(.ikinci)');
      const btn2 = sec.querySelector('.btn.ikinci');
      if (h2 && h2.textContent.includes('kuralım')) h2.textContent = d.demo_title;
      if (p) p.textContent = d.demo_desc;
      if (btn1) btn1.textContent = d.hero_btn_demo;
      if (btn2) btn2.textContent = d.price_etiket;
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * DİL SEÇİCİ BİLEŞENİ (HEADER & MODAL)
   * ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Header içine şık, koyu temalı bir dil seçici butonu ve açılır menü ekler.
   */
  function injectLanguageSwitcher() {
    const existing = document.getElementById('kpLangSwitcher');
    if (existing) return;

    const headerRight = document.querySelector('.ust-sag') || document.querySelector('.ust nav') || document.querySelector('.ust-ic nav') || document.querySelector('header nav') || document.querySelector('header');
    if (!headerRight) return;

    const container = document.createElement('div');
    container.id = 'kpLangSwitcher';
    container.className = 'kp-lang-switcher';
    container.style.cssText = `
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-right: 6px;
      z-index: 100;
    `;

    const current = LANG_NAMES[currentLang] || LANG_NAMES.tr;

    container.innerHTML = `
      <button type="button" class="kp-lang-btn" id="kpLangBtn" aria-label="Select Language / Dil Seçimi" style="
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #E9ECF2;
        padding: 6px 10px;
        border-radius: 9px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <span class="kp-lang-flag">${current.flag}</span>
        <span class="kp-lang-code">${current.code}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <div class="kp-lang-dropdown" id="kpLangDropdown" style="
        display: none;
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        min-width: 144px;
        background: #141822;
        border: 1px solid #283040;
        border-radius: 12px;
        padding: 6px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      ">
        ${SUPPORTED_LANGS.map((code) => {
          const l = LANG_NAMES[code];
          const isSelected = code === currentLang;
          return `
            <button type="button" class="kp-lang-item" data-lang="${code}" style="
              width: 100%;
              text-align: left;
              background: ${isSelected ? 'rgba(124, 92, 255, 0.18)' : 'transparent'};
              border: 1px solid ${isSelected ? 'rgba(124, 92, 255, 0.35)' : 'transparent'};
              color: ${isSelected ? '#A58EFF' : '#D0D6E2'};
              padding: 8px 12px;
              border-radius: 8px;
              font-family: inherit;
              font-size: 13.5px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 9px;
              transition: background 0.15s;
            ">
              <span style="font-size: 15px;">${l.flag}</span>
              <span>${l.name}</span>
              ${isSelected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A58EFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto;"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    // Header içine yerleştir
    const girisBtn = headerRight.querySelector('.giris-btn') || headerRight.querySelector('.btn') || headerRight.firstElementChild;
    if (girisBtn && girisBtn.parentElement === headerRight) {
      headerRight.insertBefore(container, girisBtn);
    } else {
      headerRight.appendChild(container);
    }

    // Buton ve Menü Etkileşimi
    const btn = document.getElementById('kpLangBtn');
    const dropdown = document.getElementById('kpLangDropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      btn.querySelector('svg').style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
      btn.querySelector('svg').style.transform = 'rotate(0deg)';
    });

    dropdown.querySelectorAll('.kp-lang-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosen = item.getAttribute('data-lang');
        setLanguage(chosen);
        dropdown.style.display = 'none';
        btn.querySelector('svg').style.transform = 'rotate(0deg)';
      });
    });
  }

  function updateLanguageButtons() {
    const current = LANG_NAMES[currentLang] || LANG_NAMES.tr;
    const btn = document.getElementById('kpLangBtn');
    if (btn) {
      const flagSpan = btn.querySelector('.kp-lang-flag');
      const codeSpan = btn.querySelector('.kp-lang-code');
      if (flagSpan) flagSpan.textContent = current.flag;
      if (codeSpan) codeSpan.textContent = current.code;
    }

    const items = document.querySelectorAll('.kp-lang-item');
    items.forEach((it) => {
      const code = it.getAttribute('data-lang');
      const isSelected = code === currentLang;
      it.style.background = isSelected ? 'rgba(124, 92, 255, 0.18)' : 'transparent';
      it.style.borderColor = isSelected ? 'rgba(124, 92, 255, 0.35)' : 'transparent';
      it.style.color = isSelected ? '#A58EFF' : '#D0D6E2';
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * BAŞLATMA (INIT)
   * ═══════════════════════════════════════════════════════════════════════════ */
  function init() {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLang;
      injectLanguageSwitcher();
      applyTranslations();
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Global API
  if (typeof window !== 'undefined') {
    window.KP_I18N = {
      setLanguage,
      detectLanguage,
      t,
      getLanguage: () => currentLang,
      SUPPORTED_LANGS,
      LANG_NAMES
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DICT, BUILDING_STEPS, SUPPORTED_LANGS, LANG_NAMES, detectLanguage };
  }

})();
