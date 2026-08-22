/* =============================================================================
 *  KONUT PANEL — ŞİFRE SIFIRLAMA (G2.3)
 *
 *  NEDEN AYRI BİR FONKSİYON
 *  Başka bir kullanıcının şifresini değiştirmek Supabase'de `service_role`
 *  anahtarı gerektirir. Bu anahtar RLS'i tamamen atlar; tarayıcıya konulursa
 *  sızdığı anda bütün veritabanı okunabilir ve silinebilir hâle gelir.
 *  Bu yüzden işlem sunucuda yapılır ve anahtar Netlify ortam değişkeninde durur.
 *
 *  AKIŞ
 *   1. Çağıranın oturum jetonu doğrulanır
 *   2. Çağıranın gerçekten hedef sitenin yöneticisi olduğu kontrol edilir
 *   3. Hedef kodun aynı siteye ait olduğu kontrol edilir
 *   4. Şifre kodun kendisine döndürülür
 *   5. sifre_belirlendi = false yapılır (kullanıcı yeniden belirleyecek)
 *   6. İşlem kayda geçer
 *
 *  NETLIFY ORTAM DEĞİŞKENLERİ
 *   SUPABASE_URL                projenin adresi
 *   SUPABASE_ANON_KEY           herkese açık anahtar
 *   SUPABASE_SERVICE_ROLE_KEY   gizli anahtar — yalnızca burada kullanılır
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

/** Supabase REST çağrısı */
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
      ipucu: "Netlify ortam değişkenlerinde SUPABASE_URL, SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı",
    });
  }

  /* ——— 1. Oturum jetonu ——— */
  const yetki = request.headers.get("authorization") || "";
  const jwt = yetki.startsWith("Bearer ") ? yetki.slice(7) : null;
  if (!jwt) return json(401, { hata: "Oturum gerekli" });

  let govde;
  try { govde = await request.json(); }
  catch { return json(400, { hata: "Geçersiz istek" }); }

  const kodId = String(govde?.kod_id || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(kodId)) return json(400, { hata: "Geçersiz kod kimliği" });

  /* ——— 2. Çağıran kim? ——— */
  const kullanici = await sb("/auth/v1/user", { method: "GET" }, ANON, jwt);
  if (!kullanici.ok || !kullanici.veri?.id) return json(401, { hata: "Oturum geçersiz" });
  const cagiranId = kullanici.veri.id;

  /* ——— 3. Çağıran yönetici mi? ——— */
  const profil = await sb(
    `/rest/v1/profiller?id=eq.${cagiranId}&select=id,rol,site_id`,
    { method: "GET" }, SERVIS
  );
  const p = Array.isArray(profil.veri) ? profil.veri[0] : null;
  if (!p) return json(403, { hata: "Profil bulunamadı" });

  const yoneticiRolleri = ["yonetici", "yonetici_yrd", "blok_yonetici", "superadmin"];
  if (!yoneticiRolleri.includes(p.rol)) {
    return json(403, { hata: "Bu işlemi yalnızca yönetici yapabilir" });
  }

  /* ——— 4. Hedef kod aynı siteye mi ait? ——— */
  const kodK = await sb(
    `/rest/v1/davet_kodlari?id=eq.${kodId}&select=id,kod,site_id,rol,ad,daire_id`,
    { method: "GET" }, SERVIS
  );
  const k = Array.isArray(kodK.veri) ? kodK.veri[0] : null;
  if (!k) return json(404, { hata: "Kod bulunamadı" });

  if (p.rol !== "superadmin" && k.site_id !== p.site_id) {
    /* Başka sitenin kodu — burada durdurmak kritik. */
    return json(403, { hata: "Bu kod sizin sitenize ait değil" });
  }

  /* ——— 5. Kodun sanal e-postasıyla kullanıcıyı bul ——— */
  const norm = String(k.kod || "")
    .toLocaleUpperCase("tr")
    .replace(/[ÇĞİIÖŞÜÂÎÛ]/g, (c) =>
      ({ "Ç": "C", "Ğ": "G", "İ": "I", I: "I", "Ö": "O", "Ş": "S", "Ü": "U",
         "Â": "A", "Î": "I", "Û": "U" }[c] || c))
    .replace(/[^A-Z0-9]/g, "");
  const eposta = `${norm}@site.local`;

  const liste = await sb(
    `/auth/v1/admin/users?page=1&per_page=200`,
    { method: "GET" }, SERVIS
  );
  const hedef = (liste.veri?.users || []).find(
    (u) => (u.email || "").toLowerCase() === eposta.toLowerCase()
  );

  if (!hedef) {
    return json(404, {
      hata: "Bu kodla henüz giriş yapılmamış",
      ipucu: "Kullanıcı ilk girişini yaptığında şifresi kodun kendisi olur",
    });
  }

  /* ——— 6. Şifreyi kodun kendisine döndür ——— */
  const guncelle = await sb(
    `/auth/v1/admin/users/${hedef.id}`,
    { method: "PUT", body: JSON.stringify({ password: norm }) },
    SERVIS
  );
  if (!guncelle.ok) {
    return json(500, { hata: "Şifre sıfırlanamadı", ayrinti: guncelle.veri });
  }

  /* ——— 7. Kullanıcı yeniden şifre belirlesin ——— */
  await sb(
    `/rest/v1/profiller?id=eq.${hedef.id}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ sifre_belirlendi: false }),
    },
    SERVIS
  );

  /* ——— 8. İşlemi kayda geçir ——— */
  await sb(
    `/rest/v1/davet_kodlari?id=eq.${kodId}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ sifre_sifirlandi_at: new Date().toISOString() }),
    },
    SERVIS
  ).catch(() => {});

  return json(200, {
    tamam: true,
    kod: k.kod,
    mesaj: "Şifre sıfırlandı. Kullanıcı bir sonraki girişte kodunu şifre olarak kullanacak ve yeni şifre belirleyecek.",
  });
};

export const config = { path: "/api/sifre-sifirla" };
