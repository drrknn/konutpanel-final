/* =============================================================================
 *  KONUT PANEL — YAPAY ZEKÂ İLE MAKALE ÜRETİMİ (G5.1)
 *
 *  NEDEN AYRI BİR FONKSİYON
 *  Gemini API anahtarı tarayıcıya konulamaz. `config.js` içine yazılırsa
 *  siteyi açan herkes anahtarı görür; alıp kendi işleri için kullanır ve
 *  fatura projeye gelir. Bu yüzden istek sunucudan yapılır.
 *
 *  ÜRETİLEN YAZI HER ZAMAN TASLAK OLARAK KAYDEDİLİR.
 *  Yapay zekâ yanlış bilgi üretebilir. Site yönetimine mevzuat konusunda
 *  hatalı bilgi veren bir makale itibar kaybı yaratır. Kullanıcı okumadan
 *  yayına çıkmaz.
 *
 *  NETLIFY ORTAM DEĞİŞKENLERİ
 *   GEMINI_API_KEY              Google AI Studio'dan alınır
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 * ========================================================================== */

/* Desteklenen modeller listesi (sırayla denenir — biri kota/bakım/sürüm nedeniyle yanıt vermezse diğeri çalışır)
   Google tarafından kullanımdan kaldırılan gemini-2.0-flash çıkarılmış, yerine güncel modeller eklenmiştir. */
const MODELLER = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-2.5-pro"];

const json = (kod, govde) =>
  new Response(JSON.stringify(govde), {
    status: kod,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

async function sb(sbUrl, yol, secenek = {}, anahtar, jwt = null) {
  const y = await fetch(`${sbUrl}${yol}`, {
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

/* Basit oran sınırı — aynı kullanıcı 5 dakikada en fazla 3 üretim.
   Kota tüketimini ve kazara döngüyü engeller. */
const sayac = new Map();
function oranAsildi(kullanici) {
  const simdi = Date.now();
  const kayit = (sayac.get(kullanici) || []).filter((t) => simdi - t < 5 * 60 * 1000);
  if (kayit.length >= 3) return true;
  kayit.push(simdi);
  sayac.set(kullanici, kayit);
  return false;
}

const UZUNLUK = { kisa: 600, orta: 1000, uzun: 1400 };
const TON = {
  bilgilendirici: "bilgilendirici ve tarafsız",
  rehber: "adım adım yol gösteren, pratik",
  soru_cevap: "sık sorulan sorular biçiminde",
};

/* Kullanıcı konuyu boş bıraktığında Gemini'ye önce mevcut başlıkları
   gösteriyoruz (yalnızca başlıklar — makale içerikleri değil, gereksiz
   token harcamamak için) ve kendi konusunu SEO'ya göre seçmesini
   istiyoruz. Bu blok yalnızca otomatik moddayken isteme eklenir. */
function otomatikKonuBlogu(mevcutBasliklar) {
  const liste = mevcutBasliklar.length
    ? mevcutBasliklar.map((b) => `- ${b}`).join("\n")
    : "(henüz hiç makale yok)";

  return `
KONU SİZE VERİLMEDİ — KONUYU SİZ SEÇECEKSİNİZ.

Sitede şu ana kadar yayınlanmış/taslak makale başlıkları (tekrar etme,
bunlardan hiçbirine çok benzeme):
${liste}

Konu seçerken önceliğiniz: Türkiye'de "site yönetimi", "apartman yönetimi",
"aidat takibi" ve benzeri terimlerde Google'da üst sıralarda çıkabilecek,
gerçek arama hacmi olan, insanların gerçekten sorduğu somut bir konu
bulun. Rakip yazılımların (site yönetim programları) blogunda yaygın
işlenmemiş, ama site/apartman yöneticilerinin gerçekten aradığı dar ve
spesifik bir alt konu seçin — genel geçer "apartman yönetimi nedir" gibi
kalabalık, rekabetçi konulardan kaçının.

Seçtiğiniz konuyu ve hedeflediğiniz anahtar kelimeyi çıktı JSON'ına da
ekleyin (aşağıdaki biçime "konu" ve "anahtar_kelime" alanlarını ekleyerek).
`;
}

function istemKur({ konu, anahtar, uzunluk, ton, otomatikMod, mevcutBasliklar }) {
  const kelime = UZUNLUK[uzunluk] || 1000;
  const uslup = TON[ton] || TON.bilgilendirici;

  const konuBlogu = otomatikMod
    ? otomatikKonuBlogu(mevcutBasliklar || [])
    : `KONU: ${konu}
ODAK ANAHTAR KELİME: ${anahtar || konu}`;

  return `Sen Türkiye'de site ve apartman yönetimi konusunda uzman bir içerik yazarısın.
Konut Panel adlı site yönetim yazılımının blogu için bir makale yaz.

${konuBlogu}
UZUNLUK: yaklaşık ${kelime} kelime
ÜSLUP: ${uslup}

KURALLAR — hepsine uy:
- Yalnızca Markdown yaz. HTML etiketi kullanma.
- H1 başlık (#) KULLANMA. Başlık ayrı bir alanda duruyor. En üst seviye ## olsun.
- Türkiye mevzuatına göre yaz. 634 sayılı Kat Mülkiyeti Kanunu geçerlidir.
- UYDURMA KANUN MADDESİ, RAKAM VEYA İSTATİSTİK VERME. Emin olmadığın bir
  madde numarası ya da oran varsa hiç yazma. Bu kural en önemlisidir.
- Somut ve uygulanabilir yaz. Genel geçer cümlelerden kaçın.
- 3-5 adet ## alt başlık kullan.
- En az bir madde listesi ekle.
- Uygunsa bir tablo ekle.
- Anahtar kelimeyi doğal biçimde geçir; tekrarlayıp doldurma yapma.
- Yazının sonunda Konut Panel'i zorlama biçimde övme. En fazla bir cümle.
- Türkçe yazım kurallarına uy.

ÇIKTI BİÇİMİ — yalnızca geçerli JSON döndür, başka hiçbir şey yazma:
{${otomatikMod ? `
  "konu": "seçtiğiniz konunun kısa açıklaması",
  "anahtar_kelime": "hedeflediğiniz odak anahtar kelime",` : ""}
  "baslik": "60 karakteri geçmeyen, anahtar kelimeyi içeren başlık",
  "ozet": "150-160 karakter arası meta açıklama",
  "icerik": "Markdown gövde",
  "etiketler": ["etiket1", "etiket2", "etiket3"]
}`;
}

export default async (request) => {
  if (request.method !== "POST") return json(405, { hata: "Yöntem desteklenmiyor" });

  const GEMINI = process.env.GEMINI_API_KEY;
  const SB_URL = process.env.SUPABASE_URL || "https://byuygverwpjskloqrele.supabase.co";
  const ANON   = process.env.SUPABASE_ANON_KEY || "sb_publishable_f2gGJkl1dAdncuqLdIsfig_SaJoGG85";
  const SERVIS = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!GEMINI) {
    return json(500, {
      hata: "Yapay zekâ anahtarı tanımlı değil",
      ipucu: "Netlify > Site configuration > Environment variables bölümüne GEMINI_API_KEY ekleyin ve Deploy'u tetikleyin.",
    });
  }
  if (!SB_URL || !ANON) {
    return json(500, { hata: "Sunucu yapılandırması eksik" });
  }

  const yetki = request.headers.get("authorization") || "";
  const jwt = yetki.startsWith("Bearer ") ? yetki.slice(7) : null;
  if (!jwt) return json(401, { hata: "Oturum gerekli" });

  let govde;
  try { govde = await request.json(); }
  catch { return json(400, { hata: "Geçersiz istek" }); }

  const konu = String(govde?.konu || "").trim();
  const otomatikMod = konu.length === 0;   // konu boşsa AI kendi seçer
  if (!otomatikMod && konu.length < 5) return json(400, { hata: "Konu en az 5 karakter olmalı" });
  if (konu.length > 200) return json(400, { hata: "Konu çok uzun" });

  /* ——— Çağıran süper-admin mi? ——— */
  const kullanici = await sb(SB_URL, "/auth/v1/user", { method: "GET" }, ANON, jwt);
  if (!kullanici.ok || !kullanici.veri?.id) return json(401, { hata: "Oturum geçersiz" });
  const cagiranId = kullanici.veri.id;

  const profil = await sb(
    SB_URL,
    `/rest/v1/profiller?id=eq.${cagiranId}&select=id,rol`, { method: "GET" }, SERVIS || ANON, jwt
  );
  const p = Array.isArray(profil.veri) ? profil.veri[0] : null;
  if (!p || p.rol !== "superadmin") {
    return json(403, { hata: "Bu işlemi yalnızca süper-admin yapabilir" });
  }

  if (oranAsildi(cagiranId)) {
    return json(429, { hata: "Çok fazla istek. 5 dakika içinde en fazla 3 makale üretilebilir." });
  }

  /* ——— Otomatik moddaysa: mevcut başlıkları çek ———
     Yalnızca başlık/özet/etiket alanları — makale içerikleri değil.
     Gemini'ye gereksiz token gönderilmez, aynı konunun tekrar
     seçilmesi engellenir. */
  let mevcutBasliklar = [];
  if (otomatikMod) {
    const liste = await sb(
      SB_URL,
      `/rest/v1/rpc/admin_makale_listesi`,
      { method: "POST", body: JSON.stringify({ p_arama: null, p_limit: 200 }) },
      ANON, jwt
    );
    if (liste.ok && Array.isArray(liste.veri)) {
      mevcutBasliklar = liste.veri.map((m) => m.baslik).filter(Boolean);
    }
  }

  /* ——— Gemini Çoklu Model Desteği ——— */
  let ham = "";
  let sonHata = "";
  const denenenHatalar = [];
  const promptMetni = istemKur({ ...govde, otomatikMod, mevcutBasliklar });

  for (const modelAdi of MODELLER) {
    try {
      const y = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelAdi}:generateContent?key=${GEMINI}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptMetni }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          }),
        }
      );
      const j = await y.json();
      if (y.ok && j?.candidates?.[0]?.content?.parts?.[0]?.text) {
        ham = j.candidates[0].content.parts[0].text;
        break; // Başarılı, döngüden çık
      } else {
        const msg = j?.error?.message || `HTTP ${y.status}`;
        sonHata = msg;
        denenenHatalar.push(`${modelAdi}: ${msg}`);
      }
    } catch (e) {
      const msg = e.message || "Bağlantı hatası";
      sonHata = msg;
      denenenHatalar.push(`${modelAdi}: ${msg}`);
    }
  }

  if (!ham) {
    return json(502, {
      hata: "Yapay zekâ servisi yanıt vermedi",
      ipucu: sonHata || "GEMINI_API_KEY ortam değişkenini ve API kotalarını kontrol edin.",
      ayrinti: denenenHatalar.join(" | ") || sonHata,
    });
  }

  /* ——— Yanıtı ayrıştır ——— */
  let sonuc;
  try {
    const temiz = String(ham).replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    sonuc = JSON.parse(temiz);
  } catch {
    return json(502, { hata: "Yapay zekâ beklenen biçimde yanıt vermedi. Tekrar deneyin." });
  }

  const baslik = String(sonuc.baslik || konu).trim().slice(0, 200);
  const ozet   = String(sonuc.ozet || "").trim().slice(0, 300);
  const icerik = String(sonuc.icerik || "").trim();
  const etiket = Array.isArray(sonuc.etiketler)
    ? sonuc.etiketler.slice(0, 6).map((x) => String(x).trim().slice(0, 40)).filter(Boolean)
    : [];
  // Otomatik moddaysa Gemini'nin kendi seçtiği konu — yalnızca bilgi
  // amaçlı, kullanıcıya "hangi konuyu seçti" göstermek için.
  const secilenKonu    = otomatikMod ? String(sonuc.konu || "").trim().slice(0, 300) : null;
  const secilenAnahtar = otomatikMod ? String(sonuc.anahtar_kelime || "").trim().slice(0, 100) : null;

  if (icerik.length < 200) {
    return json(502, { hata: "Üretilen içerik çok kısa. Tekrar deneyin." });
  }

  /* HTML etiketi sızmışsa temizle — içerik Markdown olarak saklanmalı.
     Mevcut dönüştürücü ham HTML geçirmiyor ama burada da eliyoruz. */
  const guvenli = icerik.replace(/<\s*\/?\s*(script|iframe|object|embed|style)[^>]*>/gi, "");

  /* ——— Taslak olarak kaydet ——— */
  const kayit = await sb(
    SB_URL,
    `/rest/v1/rpc/admin_makale_kaydet`,
    {
      method: "POST",
      body: JSON.stringify({
        p_id: null,
        p_baslik: baslik,
        p_slug: null,
        p_ozet: ozet,
        p_icerik: guvenli,
        p_kapak_url: null,
        p_etiketler: etiket,
        p_meta_baslik: baslik,
        p_meta_aciklama: ozet,
        p_yayinda: false,
      }),
    },
    ANON,
    jwt
  );

  if (!kayit.ok) {
    return json(500, { hata: "Makale kaydedilemedi", ayrinti: kayit.veri });
  }

  return json(200, {
    tamam: true,
    id: kayit.veri,
    baslik,
    ozet,
    kelime: guvenli.split(/\s+/).length,
    otomatik_konu: secilenKonu,
    otomatik_anahtar: secilenAnahtar,
    mesaj: otomatikMod
      ? `Konu otomatik seçildi: "${secilenKonu || baslik}". Taslak kaydedildi, okuyup yayınlayabilirsiniz.`
      : "Makale taslak olarak kaydedildi. Okuyup düzenledikten sonra yayınlayabilirsiniz.",
  });
};

export const config = { path: "/api/makale-uret" };
