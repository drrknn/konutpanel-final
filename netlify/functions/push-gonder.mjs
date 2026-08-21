/* =============================================================================
 *  KONUT PANEL — PUSH BİLDİRİMİ GÖNDERME
 *
 *  NE YAPAR
 *  Belirtilen kullanıcılara (veya bir sitenin tüm sakinlerine) web push
 *  bildirimi gönderir. Bildirim, uygulama kapalıyken bile cihaza düşer.
 *
 *  KİM ÇAĞIRABİLİR
 *  Yalnızca ilgili sitenin yöneticisi. Jeton doğrulanır, yöneticilik
 *  kontrol edilir. Aksi halde herkes herkese bildirim gönderebilirdi.
 *
 *  ÇAĞRI ÖRNEĞİ
 *   POST /.netlify/functions/push-gonder
 *   { "site_id": "...", "baslik": "Aidat hatırlatması",
 *     "govde": "Ağustos aidatı için son 3 gün.",
 *     "url": "/uygulama#aidat", "tur": "aidat" }
 *
 *  Belirli kişilere göndermek için "kullanici_idler": ["...","..."] ekle.
 *
 *  NETLIFY ORTAM DEĞİŞKENLERİ
 *   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
 * ========================================================================== */

import webpush from "web-push";

const SB_URL = process.env.SUPABASE_URL;
const ANON   = process.env.SUPABASE_ANON_KEY;
const SERVIS = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VAPID_PUB  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIV = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUB  = process.env.VAPID_SUBJECT || "mailto:info@konutpanel.com";

const json = (kod, govde) =>
  new Response(JSON.stringify(govde), {
    status: kod,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

async function sb(yol, secenek = {}, anahtar = ANON, jwt = null) {
  const y = await fetch(`${SB_URL}${yol}`, {
    ...secenek,
    headers: {
      apikey: anahtar,
      Authorization: `Bearer ${jwt || anahtar}`,
      "Content-Type": "application/json",
      ...(secenek.headers || {}),
    },
  });
  const metin = await y.text();
  let veri = null;
  try { veri = metin ? JSON.parse(metin) : null; } catch { veri = metin; }
  return { ok: y.ok, kod: y.status, veri };
}

export default async (request) => {
  if (request.method !== "POST") return json(405, { hata: "Yöntem desteklenmiyor" });

  if (!SB_URL || !ANON || !SERVIS) {
    return json(500, { hata: "Supabase yapılandırması eksik" });
  }
  if (!VAPID_PUB || !VAPID_PRIV) {
    return json(500, {
      hata: "VAPID anahtarları tanımlı değil",
      ipucu: "Netlify ortam değişkenlerine VAPID_PUBLIC_KEY ve VAPID_PRIVATE_KEY ekleyin",
    });
  }

  webpush.setVapidDetails(VAPID_SUB, VAPID_PUB, VAPID_PRIV);

  let govde;
  try { govde = await request.json(); }
  catch { return json(400, { hata: "Geçersiz istek gövdesi" }); }

  const {
    site_id, kullanici_idler, alici_rol, baslik, govde: metin,
    url, tur, etiket, onemli, kayitId,
  } = govde || {};

  if (!baslik) return json(400, { hata: "Başlık zorunlu" });
  if (!site_id && !Array.isArray(kullanici_idler) && !alici_rol) {
    return json(400, { hata: "site_id, kullanici_idler veya alici_rol gerekli" });
  }

  /* 1. Çağıranı doğrula */
  const jwt = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json(401, { hata: "Oturum bulunamadı" });

  const kullanici = await sb("/auth/v1/user", { method: "GET" }, ANON, jwt);
  if (!kullanici.ok || !kullanici.veri?.id) return json(401, { hata: "Oturum doğrulanamadı" });
  const cagiranId = kullanici.veri.id;

  /* 2. Çağıran hedef sitenin üyesi mi?
     Yalnızca yöneticiyle sınırlamıyoruz: sakin de ödeme bildirdiğinde
     yöneticiye bildirim gitmesi gerekiyor. Kısıt şu: kişi yalnızca
     KENDİ sitesinin üyelerine bildirim gönderebilir. */
  const profil = await sb(
    `/rest/v1/profiller?id=eq.${cagiranId}&select=id,rol,site_id`,
    { method: "GET" },
    SERVIS
  );
  const p = Array.isArray(profil.veri) ? profil.veri[0] : null;
  if (!p?.site_id) return json(403, { hata: "Profil bulunamadı" });

  const hedefSite = site_id || p.site_id;
  if (String(p.site_id) !== String(hedefSite)) {
    return json(403, { hata: "Başka bir siteye bildirim gönderemezsiniz" });
  }

  /* 3. Alıcı listesini çıkar — HER DURUMDA aynı siteyle sınırla.
     Rol bazlı hedefleme burada, service_role ile yapılır: istemci
     tarafında RLS yüzünden sakin, yönetici profillerini göremiyor. */
  const uyeler = await sb(
    `/rest/v1/profiller?site_id=eq.${hedefSite}&select=id,rol`,
    { method: "GET" },
    SERVIS
  );
  const siteProfilleri = uyeler.veri || [];
  const siteUyeleri = new Set(siteProfilleri.map((u) => String(u.id)));

  const ROL_KUMESI = {
    yoneticiler: ["yonetici", "yonetici_yrd", "blok_yonetici"],
    sakinler:    ["sakin"],
    gorevliler:  ["gorevli"],
  };

  let alicilar;
  if (Array.isArray(kullanici_idler) && kullanici_idler.length) {
    // İstenen alıcılardan yalnızca bu sitede olanlar geçer
    alicilar = kullanici_idler.filter((id) => siteUyeleri.has(String(id)));
  } else if (alici_rol && ROL_KUMESI[alici_rol]) {
    const roller = ROL_KUMESI[alici_rol];
    alicilar = siteProfilleri.filter((u) => roller.includes(u.rol)).map((u) => u.id);
  } else {
    alicilar = [...siteUyeleri];
  }

  // Gönderen kendine bildirim almasın
  alicilar = alicilar.filter((id) => String(id) !== String(cagiranId));

  if (alicilar.length === 0) return json(200, { tamam: true, gonderilen: 0, not: "Alıcı yok" });

  /* 4. Aboneliklerini getir */
  const liste = alicilar.map(encodeURIComponent).join(",");
  const abonelikler = await sb(
    `/rest/v1/push_abonelikleri?kullanici_id=in.(${liste})&select=id,endpoint,p256dh,auth`,
    { method: "GET" },
    SERVIS
  );
  const kayitlar = abonelikler.veri || [];
  if (kayitlar.length === 0) {
    return json(200, { tamam: true, gonderilen: 0, not: "Kayıtlı cihaz yok" });
  }

  /* 5. Gönder — ölü abonelikleri temizle */
  const yuk = JSON.stringify({
    baslik,
    govde: metin || "",
    url: url || "/uygulama",
    tur: tur || "genel",
    etiket: etiket || `konutpanel-${tur || "genel"}`,
    onemli: onemli === true,
    kayitId: kayitId || null,
  });

  let basarili = 0;
  const olenler = [];

  await Promise.all(kayitlar.map(async (k) => {
    try {
      await webpush.sendNotification(
        { endpoint: k.endpoint, keys: { p256dh: k.p256dh, auth: k.auth } },
        yuk,
        { TTL: 60 * 60 * 24 }
      );
      basarili++;
    } catch (e) {
      // 404/410 = abonelik artık geçersiz (uygulama silinmiş veya izin kaldırılmış)
      if (e?.statusCode === 404 || e?.statusCode === 410) olenler.push(k.id);
    }
  }));

  if (olenler.length) {
    const idListe = olenler.map(encodeURIComponent).join(",");
    await sb(`/rest/v1/push_abonelikleri?id=in.(${idListe})`, { method: "DELETE" }, SERVIS);
  }

  return json(200, {
    tamam: true,
    gonderilen: basarili,
    temizlenen: olenler.length,
    toplamCihaz: kayitlar.length,
  });
};
