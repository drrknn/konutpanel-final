import { randomUUID } from 'crypto';

const SB_URL = process.env.SUPABASE_URL || 'https://byuygverwpjskloqrele.supabase.co';
const SERVIS = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVIS) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

async function sbRest(table, method, body = null, query = '') {
  const url = `${SB_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const options = {
    method,
    headers: {
      apikey: SERVIS,
      Authorization: `Bearer ${SERVIS}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) {
    throw new Error(`REST ${method} ${table} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

async function getOrCreateAuthUser(email, password, metadata = {}) {
  // Check if exists
  const rList = await fetch(`${SB_URL}/auth/v1/admin/users?per_page=100`, {
    headers: { apikey: SERVIS, Authorization: `Bearer ${SERVIS}` }
  });
  const uList = await rList.json();
  const existing = (uList.users || []).find(u => u.email === email);
  if (existing) {
    return existing.id;
  }

  const res = await fetch(`${SB_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVIS,
      Authorization: `Bearer ${SERVIS}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Auth create user failed: ${JSON.stringify(data)}`);
  }
  return data.id;
}

async function runSeed() {
  console.log('🚀 Starting Pilot Site Seeding...');

  const siteId = 'a9fb1d9e-b08d-4615-a5a4-b582d0239565';
  const managerUserId = '09ba294a-001c-4ee7-ae08-d17ec8d37c43';

  // 1. Update Site Info
  console.log('1. Updating site info...');
  const siteData = {
    ad: 'Zümrüt Konakları Sitesi',
    adres: 'Atatürk Mah. Ihlamur Bulvarı No:42 Ataşehir / İstanbul',
    iban: 'TR330006200012345678901234',
    iban_sahibi: 'Zümrüt Konakları Site Yönetimi',
    aidat_tutari: 2250,
    takip_baslangic: '2026-01-01',
    makbuz_sayac: 129,
    abonelik_durumu: 'pilot',
    abonelik_daire_ucreti: 150,
    lisans_durumu: 'aktif',
    lisans_paket: 'demo',
    lisans_bitis: '2027-01-01',
    lisans_notu: 'Pilot Demo Lisansı (72 Daire - 3 Blok)',
    kod_oneki: 'ZK',
    kurallar: `1. Site içi hız sınırı azami 20 km/s'dir.
2. Akşam 22:00 ile sabah 08:00 saatleri arasında ortak alanlarda ve dairelerde gürültü yapılması yasaktır.
3. Evcil hayvanların ortak alanlarda tasmayla dolaştırılması ve çevre temizliğine özen gösterilmesi zorunludur.
4. Çöpler her gün 19:30 - 20:30 saatleri arasında bina görevlisi tarafından katlardan toplanacaktır; bu saatler dışında kapı önüne çöp bırakılmaması rica olunur.
5. Her daire yalnızca kendisine tahsis edilen kapalı/açık otopark numarasına park etmelidir.
6. Balkonlardan dışarıya halı, kilim veya örtü çırpılması kesinlikle yasaktır.
7. Ortak alanların (fitness, çocuk oyun odası, toplantı salonu vb.) temiz ve özenli kullanılması tüm sakinlerimizin sorumluluğundadır.`,
  };

  await sbRest('siteler', 'PATCH', siteData, `id=eq.${siteId}`);

  // 2. Clean old related data for site
  console.log('2. Cleaning existing records for clean seed...');
  const tablesToClean = [
    'bildirimler', 'toplanti_katilim', 'toplantilar', 'ziyaretciler', 'talepler',
    'rutin_kayitlari', 'rutinler', 'makbuzlar', 'odemeler', 'kasa_hareketleri',
    'duyurular', 'anket_oylar', 'anketler', 'davet_kodlari', 'daire_detay', 'gorevli_detay',
    'kameralar', 'kamera_sistemi', 'demirbas_bakim', 'demirbaslar',
    'rezervasyonlar', 'ortak_alanlar', 'rizalar', 'kullanici_bildirim_tercihleri'
  ];

  for (const t of tablesToClean) {
    try {
      await sbRest(t, 'DELETE', null, `site_id=eq.${siteId}`);
    } catch (e) {
      console.log(`Clean note for ${t}:`, e.message);
    }
  }

  // managerUserId 71. satirda tanimli — tekrar tanimlanmasi sozdizimi hatasina yol aciyordu
  const superAdminUserIds = [
    '6c9533bc-bd67-4fb0-b6f5-57500aecc018', // info@konutpanel.com (Süper Admin)
    '7a11b51c-d4ba-4717-a808-84b5e5cd9f5d'  // drrknn121@gmail.com (Süper Admin)
  ];

  // Remove other profiles on this site (except manager and superadmins)
  await sbRest('profiller', 'PATCH', { daire_id: null }, `id=eq.${managerUserId}`);
  await sbRest('profiller', 'DELETE', null, `site_id=eq.${siteId}&id=neq.${managerUserId}`);
  // Clean daireler
  await sbRest('daireler', 'DELETE', null, `site_id=eq.${siteId}`);

  // 3. Create 72 Apartments (3 Blocks x 24 Units)
  console.log('3. Generating 72 apartments (3 blocks x 24 units)...');
  const blocks = ['A', 'B', 'C'];
  const dairelerToInsert = [];
  let sira = 1;

  for (const blok of blocks) {
    for (let no = 1; no <= 24; no++) {
      dairelerToInsert.push({
        id: randomUUID(),
        site_id: siteId,
        blok,
        no: String(no),
        aidat_tutari: 2250,
        sira: sira++,
      });
    }
  }

  const insertedDaireler = await sbRest('daireler', 'POST', dairelerToInsert);
  console.log(`✓ Inserted ${insertedDaireler.length} apartments.`);

  // Map daire by blok-no
  const daireMap = {};
  insertedDaireler.forEach(d => {
    daireMap[`${d.blok}-${d.no}`] = d.id;
  });

  const managerDaireId = daireMap['A-1'];

  // 4. Update Manager Profile (drrknn1211@gmail.com living in A-1)
  console.log('4. Updating manager profile (Haydar Kenan Kılıç living in A-1)...');
  await sbRest('profiller', 'PATCH', {
    site_id: siteId,
    ad: 'Haydar Kenan Kılıç',
    rol: 'yonetici',
    daire_id: managerDaireId,
    telefon: '0532 555 12 34',
    aktif: true,
    kurucu: true,
    sifre_belirlendi: true,
  }, `id=eq.${managerUserId}`);

  // 4b. Ensure Super Admins
  for (const sId of superAdminUserIds) {
    try {
      await sbRest('profiller', 'PATCH', {
        rol: 'superadmin',
        site_id: null,
        daire_id: null,
        ad: 'Süper Admin',
        aktif: true,
        kurucu: true,
        sifre_belirlendi: true,
      }, `id=eq.${sId}`);
    } catch(e) {}
  }

  // 5. Generate 72 Resident Cards (daire_detay)
  console.log('5. Populating all 72 resident cards (daire_detay)...');

  const turkishNames = [
    { ad: "Haydar Kenan Kılıç", sahip: "sahip", tel: "0532 555 12 34", plaka: "34 ZK 100", model: "Volvo XC60", acil: "Selma Kılıç", acilYak: "Eşi", acilTel: "0533 111 22 33", evcil: "Kedi - Duman" },
    { ad: "Mustafa Kemal Şahin", sahip: "sahip", tel: "0533 241 85 90", plaka: "34 ZK 102", model: "Toyota Corolla", acil: "Ayşe Şahin", acilYak: "Eşi", acilTel: "0533 241 85 91", evcil: null },
    { ad: "Zeynep Kaya Çelik", sahip: "sahip", tel: "0535 312 44 55", plaka: "34 ZK 103", model: "Peugeot 3008", acil: "Burak Çelik", acilYak: "Eşi", acilTel: "0535 312 44 56", evcil: "Golden - Tarçın" },
    { ad: "Emre Can Yılmaz", sahip: "kiraci", tel: "0542 678 90 12", plaka: "34 ZK 104", model: "Renault Megane", sahipAd: "Mehmet Akif Yıldırım", sahipTel: "0532 999 11 22", acil: "Derya Yılmaz", acilYak: "Kardeşi", acilTel: "0542 678 90 13", evcil: null },
    { ad: "Fatma Nur Öztürk", sahip: "sahip", tel: "0536 789 01 23", plaka: "34 ZK 105", model: "Volkswagen Golf", acil: "Hakan Öztürk", acilYak: "Oğlu", acilTel: "0536 789 01 24", evcil: "Kedi - Pamuk" },
    { ad: "Ahmet Turan Arslan", sahip: "sahip", tel: "0537 890 12 34", plaka: "34 ZK 106", model: "Honda Civic", acil: "Nurcan Arslan", acilYak: "Eşi", acilTel: "0537 890 12 35", evcil: null },
    { ad: "Selin Demirci", sahip: "kiraci", tel: "0538 901 23 45", plaka: "34 ZK 107", model: "Fiat Egea", sahipAd: "Gülten Karaca", sahipTel: "0533 888 22 33", acil: "Mehmet Demirci", acilYak: "Babası", acilTel: "0538 901 23 46", evcil: "Kuş - Maviş" },
    { ad: "Ali Rıza Güneş", sahip: "sahip", tel: "0539 012 34 56", plaka: "34 ZK 108", model: "Ford Focus", acil: "Hatice Güneş", acilYak: "Eşi", acilTel: "0539 012 34 57", evcil: null },
    { ad: "Merve Doğan Aydın", sahip: "sahip", tel: "0541 123 45 67", plaka: "34 ZK 109", model: "Hyundai Tucson", acil: "Murat Aydın", acilYak: "Eşi", acilTel: "0541 123 45 68", evcil: "Pug - Paşa" },
    { ad: "Burak Özkan", sahip: "kiraci", tel: "0543 234 56 78", plaka: "34 ZK 110", model: "Nissan Qashqai", sahipAd: "Hasan Çetin", sahipTel: "0535 777 33 44", acil: "Gülşen Özkan", acilYak: "Annesi", acilTel: "0543 234 56 79", evcil: null },
    { ad: "Ayşe Gül Erdem", sahip: "sahip", tel: "0544 345 67 89", plaka: "34 ZK 111", model: "BMW 320i", acil: "Serkan Erdem", acilYak: "Eşi", acilTel: "0544 345 67 90", evcil: "Kedi - Boncuk" },
    { ad: "Oğuzhan Koç", sahip: "sahip", tel: "0545 456 78 90", plaka: "34 ZK 112", model: "Skoda Octavia", acil: "Bahar Koç", acilYak: "Kardeşi", acilTel: "0545 456 78 91", evcil: null },
    { ad: "Gamze Yıldızhan", sahip: "kiraci", tel: "0546 567 89 01", plaka: "34 ZK 113", model: "Opel Corsa", sahipAd: "Recep Bal", sahipTel: "0536 666 44 55", acil: "Kenan Yıldızhan", acilYak: "Babası", acilTel: "0546 567 89 02", evcil: null },
    { ad: "Hasan Basri Çakır", sahip: "sahip", tel: "0547 678 90 12", plaka: "34 ZK 114", model: "Mercedes C200", acil: "Şule Çakır", acilYak: "Eşi", acilTel: "0547 678 90 13", evcil: "Terrier - Lokum" },
    { ad: "Elif Buse Taşkın", sahip: "sahip", tel: "0548 789 01 23", plaka: "34 ZK 115", model: "Dacia Duster", acil: "Kadir Taşkın", acilYak: "Babası", acilTel: "0548 789 01 24", evcil: null },
    { ad: "Deniz Alp Aksoy", sahip: "kiraci", tel: "0549 890 12 34", plaka: "34 ZK 116", model: "Seat Leon", sahipAd: "Salih Gündüz", sahipTel: "0537 555 55 66", acil: "Aslı Aksoy", acilYak: "Ablası", acilTel: "0549 890 12 35", evcil: "Kedi - Zeytin" },
    { ad: "Bülent Vural", sahip: "sahip", tel: "0551 901 23 45", plaka: "34 ZK 117", model: "Audi A4", acil: "Nermin Vural", acilYak: "Eşi", acilTel: "0551 901 23 46", evcil: null },
    { ad: "Tuğba Candan", sahip: "sahip", tel: "0552 012 34 56", plaka: "34 ZK 118", model: "Kia Sportage", acil: "Volkan Candan", acilYak: "Eşi", acilTel: "0552 012 34 57", evcil: null },
    { ad: "Serkan Bozkurt", sahip: "kiraci", tel: "0553 123 45 67", plaka: "34 ZK 119", model: "Fiat Fiorino", sahipAd: "Ali Osman Kurt", sahipTel: "0538 444 66 77", acil: "Cemile Bozkurt", acilYak: "Annesi", acilTel: "0553 123 45 68", evcil: null },
    { ad: "Dilek Keskin", sahip: "sahip", tel: "0554 234 56 78", plaka: "34 ZK 120", model: "Citroen C3", acil: "Emin Keskin", acilYak: "Kardeşi", acilTel: "0554 234 56 79", evcil: "Kedi - Tekir" },
    { ad: "İlker Bayraktar", sahip: "sahip", tel: "0555 345 67 89", plaka: "34 ZK 121", model: "Toyota C-HR", acil: "Neslihan Bayraktar", acilYak: "Eşi", acilTel: "0555 345 67 90", evcil: null },
    { ad: "Pelin Karahan", sahip: "kiraci", tel: "0532 111 22 44", plaka: "34 ZK 122", model: "Renault Clio", sahipAd: "Muzaffer Tezcan", sahipTel: "0539 333 77 88", acil: "Ahmet Karahan", acilYak: "Babası", acilTel: "0532 111 22 45", evcil: null },
    { ad: "Metin Şimşek", sahip: "sahip", tel: "0533 222 33 55", plaka: "34 ZK 123", model: "Ford Kuga", acil: "Gülay Şimşek", acilYak: "Eşi", acilTel: "0533 222 33 56", evcil: "Labrador - Gölge" },
    { ad: "Yasemin Ulu", sahip: "sahip", tel: "0534 333 44 66", plaka: "34 ZK 124", model: "Peugeot 208", acil: "Murat Ulu", acilYak: "Oğlu", acilTel: "0534 333 44 67", evcil: null }
  ];

  const firstNamesPool = ["Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "İsmail", "Osman", "Murat", "Ömer", "Emre", "Can", "Burak", "Serkan", "Hakan", "Oğuzhan", "Kadir", "Kemal", "Barış", "Ayşe", "Fatma", "Emine", "Hatice", "Zeynep", "Merve", "Büşra", "Elif", "Derya", "Selin", "Tuğba", "Pelin", "Deniz", "Gamze", "Seda", "Gözde", "Ceren", "Ebru", "Şule", "Özlem"];
  const lastNamesPool = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Özcan", "Korkmaz", "Çakır", "Erdoğan", "Yavuz", "Güneş", "Acar", "Taş", "Bulut", "Güler", "Ünal", "Bozkurt", "Keskin", "Aksoy", "Turan", "Gül", "Avcı", "Işık", "Bayrak"];
  const carModels = ["Toyota Corolla", "Renault Megane", "VW Golf", "Fiat Egea", "Ford Focus", "Honda Civic", "Hyundai Tucson", "Peugeot 3008", "Nissan Qashqai", "BMW 320i", "Mercedes C200", "Audi A3", "Skoda Octavia", "Kia Sportage", "Dacia Duster", "Volvo XC40", "Renault Clio", "Opel Astra"];
  const petList = ["Kedi - Boncuk", "Golden - Tarçın", "Kedi - Pamuk", "Pug - Paşa", "Kuş - Maviş", "Terrier - Lokum", "Kedi - Zeytin", "Kedi - Duman", "Labrador - Gölge", "Kedi - Mia", "Siyam Kedisi - Şila"];

  const daireDetayList = [];
  const davetKodlariList = [];

  insertedDaireler.forEach((d, idx) => {
    let item;
    if (idx < turkishNames.length) {
      item = { ...turkishNames[idx] };
    } else {
      const fn = firstNamesPool[(idx * 7) % firstNamesPool.length];
      const ln = lastNamesPool[(idx * 11) % lastNamesPool.length];
      const isKiraci = idx % 3 === 0;
      const hasCar = idx % 5 !== 0;
      const hasPet = idx % 4 === 0;
      const rels = ["Eşi", "Babası", "Annesi", "Kardeşi", "Oğlu", "Kızı"];

      item = {
        ad: `${fn} ${ln}`,
        sahip: isKiraci ? "kiraci" : "sahip",
        tel: `053${(idx % 9) + 1} ${(idx * 37 + 100).toString().slice(0, 3)} ${((idx * 43) % 90 + 10)} ${((idx * 59) % 90 + 10)}`,
        plaka: hasCar ? `34 ZK ${(100 + idx)}` : null,
        model: hasCar ? carModels[idx % carModels.length] : null,
        sahipAd: isKiraci ? `${firstNamesPool[(idx * 3) % firstNamesPool.length]} ${lastNamesPool[(idx * 5) % lastNamesPool.length]}` : null,
        sahipTel: isKiraci ? `0532 ${(idx * 23 + 100).toString().slice(0, 3)} ${((idx * 31) % 90 + 10)} ${((idx * 47) % 90 + 10)}` : null,
        acil: `${firstNamesPool[(idx * 9) % firstNamesPool.length]} ${ln}`,
        acilYak: rels[idx % rels.length],
        acilTel: `0542 ${(idx * 19 + 100).toString().slice(0, 3)} ${((idx * 29) % 90 + 10)} ${((idx * 53) % 90 + 10)}`,
        evcil: hasPet ? petList[idx % petList.length] : null,
      };
    }

    const otoparkNo = `${d.blok}-${String(d.no).padStart(2, '0')}`;
    const kod = `ZK-${d.blok}${String(d.no).padStart(2, '0')}`;

    daireDetayList.push({
      daire_id: d.id,
      site_id: siteId,
      oturan_ad: item.ad,
      sahiplik: item.sahip,
      aidat_odeyen: item.sahip === 'kiraci' ? 'kiraci' : 'sahip',
      sahip_ad: item.sahip === 'sahip' ? item.ad : (item.sahipAd || 'Mülk Sahibi'),
      sahip_tel: item.sahip === 'sahip' ? item.tel : (item.sahipTel || null),
      arac_var: Boolean(item.plaka),
      arac_plaka: item.plaka || null,
      arac_model: item.model || null,
      arac_otopark: item.plaka ? otoparkNo : null,
      acil_ad: item.acil,
      acil_yakinlik: item.acilYak,
      acil_tel: item.acilTel,
      evcil_var: Boolean(item.evcil),
      evcil_bilgi: item.evcil || null,
      dolduruldu: true,
      dolduran: managerUserId,
      ekstra: { oturan_tel: item.tel },
      updated_at: new Date().toISOString(),
    });

    davetKodlariList.push({
      id: randomUUID(),
      site_id: siteId,
      kod,
      kod_norm: kod.replace(/[^A-Z0-9]/g, ''),
      rol: 'sakin',
      daire_id: d.id,
      ad: item.ad,
      kullanildi: idx === 0,
      kullanan: idx === 0 ? managerUserId : null,
      kullanildi_at: idx === 0 ? new Date().toISOString() : null,
      iptal: false,
      aktif: true,
      olusturan: managerUserId,
    });
  });

  // Batch insert daire_detay & davet_kodlari
  for (let i = 0; i < daireDetayList.length; i += 25) {
    await sbRest('daire_detay', 'POST', daireDetayList.slice(i, i + 25));
    await sbRest('davet_kodlari', 'POST', davetKodlariList.slice(i, i + 25));
  }
  console.log(`✓ Inserted ${daireDetayList.length} resident cards & invitation codes.`);

  // 6. Create Staff Accounts & Details (Görevliler)
  console.log('6. Adding 3 staff members and details (gorevli_detay)...');
  const staffList = [
    {
      email: "ismail.yildiz@site.local",
      ad: "İsmail Yıldız",
      unvan: "Bina Amiri & Site Görevlisi",
      roller: ["kapici", "teknik", "temizlik"],
      tel: "0535 234 56 78",
      mesai_bas: "07:30",
      mesai_bit: "17:00",
      calisma_gun: [1, 2, 3, 4, 5, 6],
      acil_ad: "Fatma Yıldız",
      acil_yak: "Eşi",
      acil_tel: "0533 111 22 33",
      kod: "ZK-GOR1"
    },
    {
      email: "ramazan.guler@site.local",
      ad: "Ramazan Güler",
      unvan: "Güvenlik & Danışma Personeli",
      roller: ["guvenlik", "ziyaretci"],
      tel: "0537 345 67 89",
      mesai_bas: "08:00",
      mesai_bit: "20:00",
      calisma_gun: [1, 2, 3, 4, 5, 6],
      acil_ad: "Şerife Güler",
      acil_yak: "Eşi",
      acil_tel: "0536 222 33 44",
      kod: "ZK-GOR2"
    },
    {
      email: "kemal.ozdemir@site.local",
      ad: "Kemal Özdemir",
      unvan: "Peyzaj & Bahçıvan",
      roller: ["bahcivan", "ortak_alan"],
      tel: "0539 456 78 90",
      mesai_bas: "08:30",
      mesai_bit: "16:30",
      calisma_gun: [1, 2, 3, 4, 5],
      acil_ad: "Emine Özdemir",
      acil_yak: "Eşi",
      acil_tel: "0538 444 55 66",
      kod: "ZK-GOR3"
    }
  ];

  const staffProfiles = [];
  const staffDetayList = [];
  const staffKodList = [];

  for (const s of staffList) {
    const sId = await getOrCreateAuthUser(s.email, 'ZkStaff2026!', { ad: s.ad, rol: 'gorevli' });
    
    staffProfiles.push({
      id: sId,
      site_id: siteId,
      rol: 'gorevli',
      ad: s.ad,
      telefon: s.tel,
      daire_id: null,
      aktif: true,
      sifre_belirlendi: true,
    });

    staffDetayList.push({
      profil_id: sId,
      site_id: siteId,
      roller: s.roller,
      unvan: s.unvan,
      telefon: s.tel,
      acil_ad: s.acil_ad,
      acil_yakinlik: s.acil_yak,
      acil_tel: s.acil_tel,
      mesai_bas: s.mesai_bas,
      mesai_bit: s.mesai_bit,
      calisma_gun: s.calisma_gun,
      dolduruldu: true,
      updated_at: new Date().toISOString(),
    });

    staffKodList.push({
      id: randomUUID(),
      site_id: siteId,
      kod: s.kod,
      kod_norm: s.kod.replace(/[^A-Z0-9]/g, ''),
      rol: 'gorevli',
      daire_id: null,
      ad: s.ad,
      kullanildi: true,
      kullanan: sId,
      kullanildi_at: new Date().toISOString(),
      iptal: false,
      aktif: true,
      olusturan: managerUserId,
    });
  }

  await sbRest('profiller', 'POST', staffProfiles);
  await sbRest('gorevli_detay', 'POST', staffDetayList);
  await sbRest('davet_kodlari', 'POST', staffKodList);
  console.log('✓ Inserted 3 staff members.');

  // 7. Monthly Dues, Payments & Receipts (2026 Ocak & Şubat)
  console.log('7. Generating dues payments and official receipts (2026 Jan & Feb)...');
  const odemelerList = [];
  const makbuzlarList = [];
  let makbuzIndex = 1;

  insertedDaireler.forEach((d, idx) => {
    const resident = daireDetayList[idx];
    const daireMetin = `${d.blok} Blok No: ${d.no}`;

    // Ocak 2026: 68 Paid, 3 Declared, 1 Unpaid
    let janStatus = 'odendi';
    let janPayDate = `2026-01-${String((idx % 18) + 5).padStart(2, '0')}`;
    if (idx === 71) {
      janStatus = 'odenmedi';
      janPayDate = null;
    } else if (idx === 69 || idx === 70) {
      janStatus = 'beyan';
    }

    const janMakbuzNo = janStatus === 'odendi' ? `ZK-2026-${String(makbuzIndex++).padStart(3, '0')}` : null;
    const janOdemelerId = randomUUID();

    odemelerList.push({
      id: janOdemelerId,
      site_id: siteId,
      daire_id: d.id,
      yil: 2026,
      ay: 1,
      tutar: 2250,
      durum: janStatus,
      makbuz_no: janMakbuzNo,
      odeme_tarihi: janPayDate,
      onaylayan: janStatus === 'odendi' ? managerUserId : null,
      beyan_eden: janStatus === 'beyan' ? managerUserId : null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: janPayDate ? `${janPayDate}T10:30:00.000Z` : '2026-01-01T00:00:00.000Z',
    });

    if (janStatus === 'odendi') {
      makbuzlarList.push({
        id: randomUUID(),
        site_id: siteId,
        daire_id: d.id,
        makbuz_no: janMakbuzNo,
        yil: 2026,
        ay: 1,
        tutar: 2250,
        odeme_tarihi: janPayDate,
        site_ad: 'Zümrüt Konakları Sitesi',
        site_adres: 'Atatürk Mah. Ihlamur Bulvarı No:42 Ataşehir / İstanbul',
        site_iban: 'TR330006200012345678901234',
        site_iban_sahibi: 'Zümrüt Konakları Site Yönetimi',
        daire_metin: daireMetin,
        odeyen_ad: resident.oturan_ad,
        imza_yolu: 'sistem/dijital_imza.png',
        imzalayan_ad: 'Haydar Kenan Kılıç',
        imzalayan_id: managerUserId,
        olusturan: managerUserId,
        created_at: `${janPayDate}T10:30:00.000Z`,
      });
    }

    // Şubat 2026: 61 Paid, 6 Declared, 5 Unpaid
    let febStatus = 'odendi';
    let febPayDate = `2026-02-${String((idx % 12) + 2).padStart(2, '0')}`;
    if (idx >= 67) {
      febStatus = 'odenmedi';
      febPayDate = null;
    } else if (idx >= 61) {
      febStatus = 'beyan';
      febPayDate = '2026-02-14';
    }

    const febMakbuzNo = febStatus === 'odendi' ? `ZK-2026-${String(makbuzIndex++).padStart(3, '0')}` : null;
    const febOdemelerId = randomUUID();

    odemelerList.push({
      id: febOdemelerId,
      site_id: siteId,
      daire_id: d.id,
      yil: 2026,
      ay: 2,
      tutar: 2250,
      durum: febStatus,
      makbuz_no: febMakbuzNo,
      odeme_tarihi: febPayDate,
      onaylayan: febStatus === 'odendi' ? managerUserId : null,
      beyan_eden: febStatus === 'beyan' ? managerUserId : null,
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: febPayDate ? `${febPayDate}T11:00:00.000Z` : '2026-02-01T00:00:00.000Z',
    });

    if (febStatus === 'odendi') {
      makbuzlarList.push({
        id: randomUUID(),
        site_id: siteId,
        daire_id: d.id,
        makbuz_no: febMakbuzNo,
        yil: 2026,
        ay: 2,
        tutar: 2250,
        odeme_tarihi: febPayDate,
        site_ad: 'Zümrüt Konakları Sitesi',
        site_adres: 'Atatürk Mah. Ihlamur Bulvarı No:42 Ataşehir / İstanbul',
        site_iban: 'TR330006200012345678901234',
        site_iban_sahibi: 'Zümrüt Konakları Site Yönetimi',
        daire_metin: daireMetin,
        odeyen_ad: resident.oturan_ad,
        imza_yolu: 'sistem/dijital_imza.png',
        imzalayan_ad: 'Haydar Kenan Kılıç',
        imzalayan_id: managerUserId,
        olusturan: managerUserId,
        created_at: `${febPayDate}T11:00:00.000Z`,
      });
    }
  });

  // Batch insert odemeler & makbuzlar
  for (let i = 0; i < odemelerList.length; i += 30) {
    await sbRest('odemeler', 'POST', odemelerList.slice(i, i + 30));
  }
  for (let i = 0; i < makbuzlarList.length; i += 30) {
    await sbRest('makbuzlar', 'POST', makbuzlarList.slice(i, i + 30));
  }
  console.log(`✓ Inserted ${odemelerList.length} monthly dues records & ${makbuzlarList.length} receipts.`);

  // 8. Cash Book Transactions (Kasa Hareketleri)
  console.log('8. Populating Kasa Hareketleri (income & expense cash flow)...');
  const kasaList = [
    // Incomes (Aidat Totals)
    { tip: 'gelir', kategori: 'aidat', tutar: 153000, aciklama: '2026 Ocak Ayı Aidat Tahsilatları Toplamı (68 Daire)', tarih: '2026-01-25', olusturan: managerUserId },
    { tip: 'gelir', kategori: 'aidat', tutar: 137250, aciklama: '2026 Şubat Ayı Aidat Tahsilatları (61 Daire)', tarih: '2026-02-15', olusturan: managerUserId },
    { tip: 'gelir', kategori: 'diger', tutar: 4500, aciklama: 'Site Ortak Alanı Otomat & Kafeterya Kira Geliri (Ocak-Şubat)', tarih: '2026-02-05', olusturan: managerUserId },
    
    // Expenses (Giderler)
    { tip: 'gider', kategori: 'elektrik', tutar: 14850, aciklama: 'Enerjisa - Ocak Ayı Ortak Alan ve Çevre Aydınlatma Elektrik Faturası', tarih: '2026-01-18', olusturan: managerUserId },
    { tip: 'gider', kategori: 'su', tutar: 4320, aciklama: 'İSKİ - Ocak Ayı Ortak Bahçe Sulama & Tesis Su Faturası', tarih: '2026-01-20', olusturan: managerUserId },
    { tip: 'gider', kategori: 'asansor', tutar: 10500, aciklama: 'KONE Asansör - 3 Blok Ocak Ayı Periyodik Bakım ve Yağlama Hizmeti', tarih: '2026-01-15', olusturan: managerUserId },
    { tip: 'gider', kategori: 'maas', tutar: 68400, aciklama: 'Ocak Ayı Personel Maaşları, Fazla Mesai ve SGK Prim Ödemeleri', tarih: '2026-01-31', olusturan: managerUserId },
    { tip: 'gider', kategori: 'temizlik', tutar: 6250, aciklama: 'Pak Kimya - 3 Blok Merdiven ve Kat Temizlik Malzemeleri Alımı', tarih: '2026-01-12', olusturan: managerUserId },
    { tip: 'gider', kategori: 'jenerator', tutar: 8700, aciklama: 'Petrol Ofisi - Aksa Jeneratör 250 Litre Motorin Yakıt İkmali', tarih: '2026-01-22', olusturan: managerUserId },
    { tip: 'gider', kategori: 'elektrik', tutar: 15200, aciklama: 'Enerjisa - Şubat Ayı Ortak Alan ve Otopark Aydınlatma Faturası', tarih: '2026-02-14', olusturan: managerUserId },
    { tip: 'gider', kategori: 'su', tutar: 4100, aciklama: 'İSKİ - Şubat Ayı Ortak Su Tüketim Faturası', tarih: '2026-02-16', olusturan: managerUserId },
    { tip: 'gider', kategori: 'asansor', tutar: 10500, aciklama: 'KONE Asansör - 3 Blok Şubat Ayı Periyodik Kontrol Bedeli', tarih: '2026-02-15', olusturan: managerUserId },
    { tip: 'gider', kategori: 'peyzaj', tutar: 7500, aciklama: 'Doğa Botanik - Bahçe Çim Gübreleme, Çalı Budama ve İlaçlama', tarih: '2026-02-08', olusturan: managerUserId },
    { tip: 'gider', kategori: 'onarim', tutar: 3800, aciklama: 'BFT Otopark Bariyeri Emniyet Fotoseli Değişimi ve Servis Bedeli', tarih: '2026-02-10', olusturan: managerUserId },
  ];

  for (const k of kasaList) {
    k.id = randomUUID();
    k.site_id = siteId;
  }
  await sbRest('kasa_hareketleri', 'POST', kasaList);
  console.log(`✓ Inserted ${kasaList.length} cash flow records.`);

  // 9. Requests & Issues (Talepler)
  console.log('9. Adding resident requests and maintenance issues (talepler)...');
  const taleplerList = [
    {
      id: randomUUID(),
      site_id: siteId,
      daire_id: daireMap['A-4'],
      acan: managerUserId,
      kategori: 'ariza',
      metin: 'A Blok 3. kat asansör önü LED tavan armatürü yanıp sönüyor, ampulün değişmesi gerekiyor.',
      durum: 'kapandi',
      atanan: staffProfiles[0].id,
      kapatan: staffProfiles[0].id,
      kapatma_notu: 'Armatür sürücüsü ve LED panel yeni Osram LED ile yenilendi. Kontrol edildi, sorunsuz çalışıyor.',
      created_at: '2026-02-10T09:15:00.000Z',
      kapanma_at: '2026-02-10T14:30:00.000Z',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      daire_id: daireMap['B-12'],
      acan: managerUserId,
      kategori: 'ariza',
      metin: 'B Blok kapalı otopark girişindeki yangın çıkış kapısı hidroliği sert kapanıyor, ayarlanması rica olunur.',
      durum: 'atandi',
      atanan: staffProfiles[0].id,
      kapatan: null,
      kapatma_notu: null,
      created_at: '2026-02-16T11:20:00.000Z',
      kapanma_at: null,
    },
    {
      id: randomUUID(),
      site_id: siteId,
      daire_id: daireMap['C-8'],
      acan: managerUserId,
      kategori: 'temizlik',
      metin: 'C Blok zemin kat giriş paspası yıkandıktan sonra yerine serilmemiş, kontrol edilebilir mi?',
      durum: 'kapandi',
      atanan: staffProfiles[0].id,
      kapatan: staffProfiles[0].id,
      kapatma_notu: 'Paspas kurutulup zemin kat girişine yerleştirildi.',
      created_at: '2026-02-14T08:30:00.000Z',
      kapanma_at: '2026-02-14T10:00:00.000Z',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      daire_id: daireMap['A-15'],
      acan: managerUserId,
      kategori: 'otopark',
      metin: 'Otopark A-15 numaramın önüne misafir aracı park etmiş, bariyer kumandası ile bilgilendirme yapılabilir mi?',
      durum: 'kapandi',
      atanan: staffProfiles[1].id,
      kapatan: staffProfiles[1].id,
      kapatma_notu: 'Misafir araç sahibine ulaşıldı ve araç misafir otopark alanına çektirildi.',
      created_at: '2026-02-12T19:40:00.000Z',
      kapanma_at: '2026-02-12T20:05:00.000Z',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      daire_id: daireMap['C-19'],
      acan: managerUserId,
      kategori: 'diger',
      metin: 'Çocuk oyun parkındaki ahşap salıncak zincirinin sabitleme vidası gevşemiş, emniyet için kontrol edilmeli.',
      durum: 'acik',
      atanan: staffProfiles[0].id,
      kapatan: null,
      kapatma_notu: null,
      created_at: '2026-02-17T16:00:00.000Z',
      kapanma_at: null,
    }
  ];
  await sbRest('talepler', 'POST', taleplerList);
  console.log(`✓ Inserted ${taleplerList.length} requests.`);

  // 10. Announcements (Duyurular)
  console.log('10. Adding official announcements (duyurular)...');
  const duyurularList = [
    {
      id: randomUUID(),
      site_id: siteId,
      baslik: '2026 Yılı Olağan Kat Malikleri Genel Kurul Toplantısı Çağrısı',
      metin: `Değerli Zümrüt Konakları Sakinleri ve Kat Malikleri,

634 sayılı Kat Mülkiyeti Kanunu uyarınca, sitemizin 2026 Yılı Olağan Genel Kurul Toplantısı 28 Şubat 2026 Cumartesi günü saat 14:00'te Site Sosyal Tesis Toplantı Salonu'nda gerçekleştirilecektir.

Gündem Maddeleri:
1. Açılış, yoklama ve Divan Heyeti seçimi,
2. 2025 yılı yönetim faaliyet ve kesin hesap raporunun okunması ve ibrası,
3. 2025 yılı denetim raporunun okunması ve ibrası,
4. 2026 yılı tahmini işletme projesi ve bütçesinin görüşülerek karara bağlanması,
5. Yeni Yönetim ve Denetim Kurullarının seçimi,
6. Dilek ve temenniler, kapanış.

Çoğunluk sağlanamadığı takdirde ikinci toplantı 7 Mart 2026 Cumartesi günü aynı yer ve saatte çoğunluk aranmaksızın yapılacaktır. Tüm maliklerimizin katılımını önemle rica ederiz.

Saygılarımızla,
Zümrüt Konakları Site Yönetimi`,
      yayinlayan: managerUserId,
      created_at: '2026-02-05T10:00:00.000Z',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      baslik: 'Asansör Yıllık Periyodik Muayenesi Başarıyla Tamamlandı (Yeşil Etiket)',
      metin: `Sayın Sakinlerimiz,

A, B ve C bloklarımızda bulunan yolcu asansörlerimizin A tipi akredite muayene kuruluşu tarafından yıllık periyodik kontrolleri yapılmış olup; tüm asansörlerimiz kusursuz bulunarak "YEŞİL BİLGİ ETİKETİ" (Kusursuz) almaya hak kazanmıştır.

Asansörlerimizin bakım ve güvenliği KONE yetkili servisi tarafından aylık düzenli olarak takip edilmeye devam edecektir.

Bilgilerinize sunar, iyi günler dileriz.`,
      yayinlayan: managerUserId,
      created_at: '2026-02-11T13:30:00.000Z',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      baslik: 'Kapalı Otopark Zemin Yıkama ve İlaçlama Programı',
      metin: `Değerli Komşularımız,

Kapalı otopark alanlarımızın zemin basınçlı yıkama ve haşere ilaçlama işlemleri 21 Şubat 2026 Cumartesi günü 09:00 - 15:00 saatleri arasında gerçekleştirilecektir.

Belirtilen saatlerde araç sahiplerinin araçlarını geçici olarak açık misafir otopark alanına çekmeleri önemle rica olunur. Göstereceğiniz anlayış ve iş birliği için teşekkür ederiz.`,
      yayinlayan: managerUserId,
      created_at: '2026-02-15T09:00:00.000Z',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      baslik: 'Site Bahçe Peyzaj ve İlkbahar Budama Çalışmaları',
      metin: `Değerli Sakinlerimiz,

Bahçe peyzaj uzmanımız Kemal Bey ve belediye park-bahçeler ekipleri koordinasyonunda, ortak bahçe alanımızdaki süs bitkileri, çam ve meyve ağaçlarımızın mevsimsel form budaması ve çim havalandırma çalışmaları başlatılmıştır.

Çocuklarımızın çalışma yapılan bahçe parsellerinde dikkatli olmalarını rica ederiz.`,
      yayinlayan: managerUserId,
      created_at: '2026-02-16T15:00:00.000Z',
    }
  ];
  await sbRest('duyurular', 'POST', duyurularList);
  console.log(`✓ Inserted ${duyurularList.length} announcements.`);

  // 11. Routines (Rutinler)
  console.log('11. Adding operational routine tasks (rutinler)...');
  const rutinlerList = [
    { id: randomUUID(), site_id: siteId, baslik: 'Günlük Çöp Toplama ve Kat Denetimi', kategori: 'temizlik', siklik: 'gunluk', sorumlu: staffProfiles[0].id, aktif: true, son_yapilma: '2026-02-17' },
    { id: randomUUID(), site_id: siteId, baslik: 'Haftalık Merdiven ve Kat Holü Islak Temizliği', kategori: 'temizlik', siklik: 'haftalik', sorumlu: staffProfiles[0].id, aktif: true, son_yapilma: '2026-02-16' },
    { id: randomUUID(), site_id: siteId, baslik: 'Site Giriş Güvenlik ve Kamera Kontrolü', kategori: 'guvenlik', siklik: 'gunluk', sorumlu: staffProfiles[1].id, aktif: true, son_yapilma: '2026-02-17' },
    { id: randomUUID(), site_id: siteId, baslik: 'Bahçe Otomatik Sulama ve Çim Bakımı', kategori: 'bahce', siklik: 'haftalik', sorumlu: staffProfiles[2].id, aktif: true, son_yapilma: '2026-02-15' },
    { id: randomUUID(), site_id: siteId, baslik: 'Jeneratör ve Hidrofor Haftalık Test Çalıştırması', kategori: 'teknik', siklik: 'haftalik', sorumlu: staffProfiles[0].id, aktif: true, son_yapilma: '2026-02-14' },
  ];
  await sbRest('rutinler', 'POST', rutinlerList);
  console.log(`✓ Inserted ${rutinlerList.length} routine definitions.`);

  // 12. Common Areas (Ortak Alanlar)
  console.log('12. Adding common amenities (ortak_alanlar)...');
  const ortakAlanlarList = [
    { id: randomUUID(), site_id: siteId, ad: 'Fitness & Spor Salonu', aciklama: 'Koşu bantları, ağırlık istasyonları ve pilates alanı.', kapasite: 15, acilis: '06:00', kapanis: '23:00', slot_dk: 60, gunluk_limit: 1, onay_gerekir: false, aktif: true },
    { id: randomUUID(), site_id: siteId, ad: 'Site Toplantı & Çok Amaçlı Salon', aciklama: 'Genel kurul, doğum günü ve sakin etkinlikleri için rezervasyonlu salon.', kapasite: 50, acilis: '09:00', kapanis: '22:00', slot_dk: 120, gunluk_limit: 1, onay_gerekir: true, aktif: true },
    { id: randomUUID(), site_id: siteId, ad: 'Çocuk Oyun Odası', aciklama: 'Top havuzu, tırmanma parkuru ve eğitici aktivite masaları.', kapasite: 20, acilis: '08:00', kapanis: '20:00', slot_dk: 60, gunluk_limit: 2, onay_gerekir: false, aktif: true },
    { id: randomUUID(), site_id: siteId, ad: 'Masa Tenisi & Bilardo Odası', aciklama: 'Turnuva masası ve dinlenme koltukları.', kapasite: 8, acilis: '08:00', kapanis: '22:00', slot_dk: 60, gunluk_limit: 1, onay_gerekir: false, aktif: true },
  ];
  await sbRest('ortak_alanlar', 'POST', ortakAlanlarList);
  console.log(`✓ Inserted ${ortakAlanlarList.length} common areas.`);

  // 13. Assets / Fixtures (Demirbaşlar)
  console.log('13. Adding fixtures & technical assets (demirbaslar)...');
  const demirbaslarList = [
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'A Blok KONE 8 Kişilik Yolcu Asansörü',
      kategori: 'asansor',
      konum: 'A Blok Asansör Boşluğu',
      marka: 'KONE',
      model: 'MonoSpace 500 DX',
      seri_no: 'KNE-2023-A01',
      alim_tarihi: '2023-05-10',
      garanti_bitis: '2028-05-10',
      bakim_periyot_ay: 1,
      son_bakim: '2026-02-15',
      sonraki_bakim: '2026-03-15',
      sorumlu: staffProfiles[0].id,
      durum: 'calisiyor',
      notlar: 'Yeşil etiketli, yıllık muayenesi onaylandı. Servis: KONE Asansör A.Ş. (0216 444 56 63)',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'B Blok KONE 8 Kişilik Yolcu Asansörü',
      kategori: 'asansor',
      konum: 'B Blok Asansör Boşluğu',
      marka: 'KONE',
      model: 'MonoSpace 500 DX',
      seri_no: 'KNE-2023-B02',
      alim_tarihi: '2023-05-10',
      garanti_bitis: '2028-05-10',
      bakim_periyot_ay: 1,
      son_bakim: '2026-02-15',
      sonraki_bakim: '2026-03-15',
      sorumlu: staffProfiles[0].id,
      durum: 'calisiyor',
      notlar: 'Kusursuz yeşil etiket. Servis: KONE Asansör A.Ş.',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'C Blok KONE 8 Kişilik Yolcu Asansörü',
      kategori: 'asansor',
      konum: 'C Blok Asansör Boşluğu',
      marka: 'KONE',
      model: 'MonoSpace 500 DX',
      seri_no: 'KNE-2023-C03',
      alim_tarihi: '2023-05-10',
      garanti_bitis: '2028-05-10',
      bakim_periyot_ay: 1,
      son_bakim: '2026-02-15',
      sonraki_bakim: '2026-03-15',
      sorumlu: staffProfiles[0].id,
      durum: 'calisiyor',
      notlar: 'Kusursuz yeşil etiket. Servis: KONE Asansör A.Ş.',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'Aksa 110 kVA Otomatik Dizel Jeneratör',
      kategori: 'jenerator',
      konum: 'Site Teknik Oda / Otopark Katı',
      marka: 'Aksa',
      model: 'APD 110 A',
      seri_no: 'AKS-2022-99881',
      alim_tarihi: '2022-11-20',
      garanti_bitis: '2027-11-20',
      bakim_periyot_ay: 6,
      son_bakim: '2026-01-22',
      sonraki_bakim: '2026-07-22',
      sorumlu: staffProfiles[0].id,
      durum: 'calisiyor',
      notlar: 'Yakıt deposu %85 dolu, otomatik transfer panosu aktif. Servis: Aksa Jeneratör Yetkili Servis',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'DAB Çift Pompalı Frekans Kontrollü Hidrofor Seti',
      kategori: 'hidrofor',
      konum: 'Site Su Deposu Odası',
      marka: 'DAB Pumps',
      model: '2 KVCX 50/80 M',
      seri_no: 'DAB-2023-4552',
      alim_tarihi: '2023-06-15',
      garanti_bitis: '2026-06-15',
      bakim_periyot_ay: 6,
      son_bakim: '2025-12-10',
      sonraki_bakim: '2026-06-10',
      sorumlu: staffProfiles[0].id,
      durum: 'calisiyor',
      notlar: '40 tonluk paslanmaz su deposuna bağlı. Servis: Alarko & DAB Servis',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'Dahua 32 Kanal 4K NVR Güvenlik Kamera Sistemi',
      kategori: 'kamera',
      konum: 'Güvenlik Kulübesi & Sistem Odası',
      marka: 'Dahua',
      model: 'NVR5432-4KS2',
      seri_no: 'DH-NVR-32K-900',
      alim_tarihi: '2023-08-01',
      garanti_bitis: '2026-08-01',
      bakim_periyot_ay: 12,
      son_bakim: '2025-08-01',
      sonraki_bakim: '2026-08-01',
      sorumlu: staffProfiles[1].id,
      durum: 'calisiyor',
      notlar: '32 adet 4K IP kamera ve 30 günlük kayıt yedekleme diski devrede. Servis: Mega Güvenlik Sistemleri',
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'BFT Otopark Otomatik Kollu Bariyer Sistemi',
      kategori: 'diger',
      konum: 'Site Ana Araç Giriş Kapısı',
      marka: 'BFT',
      model: 'Gioto Ultra BT 30',
      seri_no: 'BFT-BAR-2023-88',
      alim_tarihi: '2023-05-15',
      garanti_bitis: '2026-05-15',
      bakim_periyot_ay: 6,
      son_bakim: '2026-02-10',
      sonraki_bakim: '2026-08-10',
      sorumlu: staffProfiles[1].id,
      durum: 'calisiyor',
      notlar: 'HGS/OGS plaka okuma ve fotosel sistemi sorunsuz. Servis: BFT Yetkili Bayi',
    }
  ];
  await sbRest('demirbaslar', 'POST', demirbaslarList);
  console.log(`✓ Inserted ${demirbaslarList.length} fixtures & assets.`);

  // 14. Meetings (Toplantılar & Katılım)
  console.log('14. Adding general assembly meeting (toplantilar)...');
  const meetingId = randomUUID();
  const toplanti = {
    id: meetingId,
    site_id: siteId,
    baslik: '2026 Yılı Olağan Kat Malikleri Genel Kurulu',
    gundem: `1. Açılış ve Divan Başkanı seçimi
2. 2025 yılı gelir-gider hesaplarının ve faaliyet raporunun ibrası
3. 2026 yılı aidat bütçesinin görüşülmesi ve onaylanması
4. Ortak alan güvenlik kamerası ve çevre aydınlatma yenileme tekliflerinin değerlendirilmesi
5. Yeni Yönetim ve Denetim Kurulu üyelerinin seçilmesi`,
    yer: 'Site Sosyal Tesis Toplantı Salonu',
    zaman: '2026-02-28T14:00:00.000Z',
    olusturan: managerUserId,
  };
  await sbRest('toplantilar', 'POST', [toplanti]);

  const katilimciOylar = [
    { toplanti_id: meetingId, profil_id: managerUserId, site_id: siteId, durum: 'katiliyor' },
    ...staffProfiles.map(s => ({ toplanti_id: meetingId, profil_id: s.id, site_id: siteId, durum: 'katiliyor' }))
  ];
  await sbRest('toplanti_katilim', 'POST', katilimciOylar);
  console.log('✓ Inserted meeting and votes.');

  // 15. Visitors (Ziyaretçiler)
  console.log('15. Adding visitor logbook entries (ziyaretciler)...');
  const ziyaretcilerList = [
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'Murat Kara',
      firma: 'Aras Kargo Kuryesi',
      tel: '0533 999 88 77',
      daire_id: daireMap['A-8'],
      aciklama: 'Koli teslimatı (3 koli)',
      durum: 'cikti',
      beklenen: false,
      beklenen_zaman: null,
      giris_zamani: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      cikis_zamani: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      kaydeden: staffProfiles[1].id,
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'Serdar Çetin',
      firma: 'KONE Asansör Teknikeri',
      tel: '0532 888 77 66',
      daire_id: null,
      aciklama: 'B Blok aylık periyodik muayene ve yağlama kontrolü',
      durum: 'icerde',
      beklenen: false,
      beklenen_zaman: null,
      giris_zamani: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      cikis_zamani: null,
      kaydeden: staffProfiles[1].id,
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'Hülya & Caner Vural',
      firma: 'Misafir',
      tel: '0535 777 66 55',
      daire_id: daireMap['B-5'],
      aciklama: 'Akşam yemeği misafiri',
      durum: 'beklenen',
      beklenen: true,
      beklenen_zaman: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      giris_zamani: null,
      cikis_zamani: null,
      kaydeden: staffProfiles[1].id,
    },
    {
      id: randomUUID(),
      site_id: siteId,
      ad: 'Engin Demir',
      firma: 'Getir Kuryesi',
      tel: '0544 666 55 44',
      daire_id: daireMap['C-14'],
      aciklama: 'Market sipariş teslimi',
      durum: 'cikti',
      beklenen: false,
      beklenen_zaman: null,
      giris_zamani: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      cikis_zamani: new Date(Date.now() - 4.8 * 3600 * 1000).toISOString(),
      kaydeden: staffProfiles[1].id,
    }
  ];
  await sbRest('ziyaretciler', 'POST', ziyaretcilerList);
  console.log(`✓ Inserted ${ziyaretcilerList.length} visitor entries.`);

  // 16. Camera System & Cameras (Kamera Sistemi)
  console.log('16. Setting up camera system and cameras (kameralar)...');
  await sbRest('kamera_sistemi', 'POST', [{
    site_id: siteId,
    var_mi: true,
    nvr_marka: 'Dahua',
    nvr_model: 'NVR5432-4KS2',
    nvr_konum: 'Güvenlik Danışma Kulübesi',
    kanal_sayisi: 32,
    kayit_suresi_gun: 30,
    ses_kaydi: false,
    yuz_tanima: false,
    tabela_asildi: true,
    aydinlatma_hazir: true,
    politika_notu: 'KVKK 6698 sayılı Kanun uyarınca ortak alan güvenliği için 24 saat kayıt alınmaktadır.',
    kurulum_tarihi: '2023-08-01',
    bakim_periyot_ay: 12,
    son_bakim: '2025-08-01',
    sonraki_bakim: '2026-08-01',
  }]);

  const kameralarList = [
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 01 - Ana Araç Giriş Kapısı & Bariyer', konum: 'Nizamiye Girişi', gordugu_alan: 'Araç Giriş / Çıkış Plaka Tanıma', kanal_no: 1, marka: 'Dahua', model: 'IPC-HFW5442E', ic_dis: 'dis', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 02 - Yaya Giriş Turnikesi & Güvenlik', konum: 'Yaya Girişi', gordugu_alan: 'Ziyaretçi ve Sakin Yaya Giriş Yolu', kanal_no: 2, marka: 'Dahua', model: 'IPC-HDBW5442R', ic_dis: 'dis', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 03 - A Blok Giriş Kapısı & Hol', konum: 'A Blok Giriş', gordugu_alan: 'A Blok Bina Girişi ve Posta Kutuları', kanal_no: 3, marka: 'Dahua', model: 'IPC-HDW5442T', ic_dis: 'ic', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 04 - B Blok Giriş Kapısı & Hol', konum: 'B Blok Giriş', gordugu_alan: 'B Blok Bina Girişi ve Asansör Önü', kanal_no: 4, marka: 'Dahua', model: 'IPC-HDW5442T', ic_dis: 'ic', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 05 - C Blok Giriş Kapısı & Hol', konum: 'C Blok Giriş', gordugu_alan: 'C Blok Bina Girişi ve Asansör Önü', kanal_no: 5, marka: 'Dahua', model: 'IPC-HDW5442T', ic_dis: 'ic', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 06 - Kapalı Otopark -1. Kat Ana Koridor', konum: 'Kapalı Otopark', gordugu_alan: 'Otopark A ve B Blok Bağlantı Yolu', kanal_no: 6, marka: 'Dahua', model: 'IPC-HFW5442E', ic_dis: 'ic', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 07 - Çocuk Oyun Parkı ve Kamelyalar', konum: 'Merkezi Bahçe', gordugu_alan: 'Çocuk Parkı ve Dinlenme Kamelyaları', kanal_no: 7, marka: 'Dahua', model: 'IPC-HFW5442E', ic_dis: 'dis', durum: 'calisiyor' },
    { id: randomUUID(), site_id: siteId, ad: 'Kamera 08 - Sosyal Tesis & Fitness Girişi', konum: 'Sosyal Tesis', gordugu_alan: 'Spor Salonu ve Aktivite Odası Girişi', kanal_no: 8, marka: 'Dahua', model: 'IPC-HDW5442T', ic_dis: 'ic', durum: 'calisiyor' },
  ];
  await sbRest('kameralar', 'POST', kameralarList);
  console.log(`✓ Inserted ${kameralarList.length} security cameras.`);

  console.log('\n🎉 ALL PILOT SITE DATA INSERTED SUCCESSFULLY!');
}

runSeed().catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
