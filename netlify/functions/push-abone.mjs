/* =============================================================================
 *  KONUT PANEL — PUSH ABONELİĞİ KAYDI
 *
 *  NE YAPAR
 *  Tarayıcı `pushManager.subscribe()` ile bir abonelik üretir. Bu abonelik
 *  cihaza özeldir ve sunucunun bildirim gönderebilmesi için saklanmalıdır.
 *  Bu fonksiyon aboneliği doğrulanmış kullanıcıya bağlayarak kaydeder.
 *
 *  NEDEN SUNUCUDA
 *  Abonelik kaydı service_role gerektirmiyor ama kullanıcının kimliğinin
 *  doğrulanması gerekiyor; aksi halde herkes başkasının adına abonelik
 *  yazabilir. Jeton burada doğrulanır.
 *
 *  NETLIFY ORTAM DEĞİŞKENLERİ
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 * ========================================================================== */

const SB_URL = process.env.SUPABASE_URL;
const ANON   = process.env.SUPABASE_ANON_KEY;
const SERVIS = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    return json(500, {
      hata: "Sunucu yapılandırması eksik",
      ipucu: "SUPABASE_URL, SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı",
    });
  }

  let govde;
  try { govde = await request.json(); }
  catch { return json(400, { hata: "Geçersiz istek gövdesi" }); }

  const { abonelik, cihaz_adi } = govde || {};
  if (!abonelik?.endpoint || !abonelik?.keys?.p256dh || !abonelik?.keys?.auth) {
    return json(400, { hata: "Abonelik bilgisi eksik" });
  }

  /* 1. Çağıranın kimliğini doğrula */
  const jwt = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json(401, { hata: "Oturum bulunamadı" });

  const kullanici = await sb("/auth/v1/user", { method: "GET" }, ANON, jwt);
  if (!kullanici.ok || !kullanici.veri?.id) {
    return json(401, { hata: "Oturum doğrulanamadı" });
  }
  const kullaniciId = kullanici.veri.id;

  /* 2. Aynı endpoint varsa güncelle, yoksa ekle (endpoint benzersiz) */
  const kayit = {
    kullanici_id: kullaniciId,
    endpoint: abonelik.endpoint,
    p256dh: abonelik.keys.p256dh,
    auth: abonelik.keys.auth,
    cihaz_adi: (cihaz_adi || "").slice(0, 120) || null,
    guncellendi: new Date().toISOString(),
  };

  const sonuc = await sb(
    "/rest/v1/push_abonelikleri?on_conflict=endpoint",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(kayit),
    },
    SERVIS
  );

  if (!sonuc.ok) {
    return json(500, { hata: "Abonelik kaydedilemedi", detay: sonuc.veri });
  }

  return json(200, { tamam: true });
};
