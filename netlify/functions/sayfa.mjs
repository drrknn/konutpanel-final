/* =============================================================================
 *  KONUT PANEL — sunucu tarafı sayfa üretici (Netlify Function)
 *
 *  Şu adresleri karşılar (netlify.toml içinde yönlendirilir):
 *    /y/<slug>      → makale sayfası (tam HTML, meta etiketleri hazır)
 *    /blog          → makale listesi
 *    /sitemap.xml   → tüm sayfalar + yayındaki makaleler
 *    /rss.xml       → RSS akışı
 *
 *  NEDEN SUNUCUDA:
 *   Tarayıcıda çizilen sayfada <title> ve og: etiketleri sonradan eklenir.
 *   Arama motoru ve WhatsApp/Facebook önizlemesi bunları çoğu zaman göremez.
 *   Burada HTML hazır gelir; indeksleme ve paylaşım önizlemesi sorunsuz olur.
 *
 *  GÜVENLİK:
 *   - Supabase'e yalnızca anon key ile ve yalnızca herkese açık RPC'lerle gidilir.
 *   - Markdown dönüştürücüsü ham HTML'i GEÇİRMEZ; önce her şey kaçışlanır,
 *     sonra sadece izin verilen etiketler üretilir. <script> yazmak imkânsızdır.
 *   - Bağlantılarda yalnızca http/https kabul edilir (javascript: engellenir).
 * ========================================================================== */

const SITE = process.env.SITE_URL || "https://konutpanel.com";
const SB_URL =
  process.env.SUPABASE_URL || "https://byuygverwpjskloqrele.supabase.co";
const SB_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_f2gGJkl1dAdncuqLdIsfig_SaJoGG85";

const MARKA = "Konut Panel";

/* ————— Supabase RPC çağrısı ————— */
async function rpc(ad, gövde) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${ad}`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gövde || {}),
  });
  if (!r.ok) throw new Error(`RPC ${ad}: ${r.status}`);
  return r.json();
}

/* ————— HTML kaçışı ————— */
const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escAttr = (s) => esc(s).replace(/`/g, "&#96;");

/* ————— Güvenli bağlantı ————— */
function güvenliUrl(u) {
  if (!u) return "";
  const t = String(u).trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^\//.test(t)) return t;
  return "";
}

/* ————— Markdown → HTML —————
   Ham HTML kabul edilmez. Önce tüm metin kaçışlanır, sonra yalnızca
   şu etiketler üretilir: h2 h3 h4 p ul ol li blockquote strong em code
   pre a img hr table thead tbody tr th td                                   */
function markdown(md) {
  if (!md) return "";
  const satırlar = String(md).replace(/\r\n?/g, "\n").split("\n");
  const çıktı = [];
  let liste = null; // 'ul' | 'ol'
  let kodda = false;
  let kodTampon = [];
  let tabloTampon = [];

  const satıriçi = (t) => {
    let x = esc(t);
    // `kod`
    x = x.replace(/`([^`]+)`/g, (m, a) => `<code>${a}</code>`);
    // **kalın**
    x = x.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // *eğik*
    x = x.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    // ![alt](src)
    x = x.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
      const u = güvenliUrl(src.replace(/&amp;/g, "&"));
      return u
        ? `<img src="${escAttr(u)}" alt="${escAttr(alt)}" loading="lazy">`
        : "";
    });
    // [metin](adres)
    x = x.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, ad, href) => {
      const u = güvenliUrl(href.replace(/&amp;/g, "&"));
      if (!u) return ad;
      const dış = /^https?:\/\//i.test(u) && !u.startsWith(SITE);
      return `<a href="${escAttr(u)}"${
        dış ? ' target="_blank" rel="noopener nofollow"' : ""
      }>${ad}</a>`;
    });
    return x;
  };

  const listeyiKapat = () => {
    if (liste) {
      çıktı.push(`</${liste}>`);
      liste = null;
    }
  };
  const tabloyuBoşalt = () => {
    if (!tabloTampon.length) return;
    const satır = (s) =>
      s
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim());
    const başlık = satır(tabloTampon[0]);
    const gövde = tabloTampon.slice(2).map(satır);
    çıktı.push(
      `<div class="tablo-kap"><table><thead><tr>${başlık
        .map((c) => `<th>${satıriçi(c)}</th>`)
        .join("")}</tr></thead><tbody>${gövde
        .map(
          (r) => `<tr>${r.map((c) => `<td>${satıriçi(c)}</td>`).join("")}</tr>`
        )
        .join("")}</tbody></table></div>`
    );
    tabloTampon = [];
  };

  for (let i = 0; i < satırlar.length; i++) {
    const ham = satırlar[i];
    const s = ham.trim();

    // kod bloğu
    if (/^```/.test(s)) {
      if (kodda) {
        çıktı.push(`<pre><code>${esc(kodTampon.join("\n"))}</code></pre>`);
        kodTampon = [];
        kodda = false;
      } else {
        listeyiKapat();
        tabloyuBoşalt();
        kodda = true;
      }
      continue;
    }
    if (kodda) {
      kodTampon.push(ham);
      continue;
    }

    // tablo
    if (/^\|.*\|$/.test(s)) {
      listeyiKapat();
      tabloTampon.push(s);
      continue;
    }
    if (tabloTampon.length) tabloyuBoşalt();

    if (!s) {
      listeyiKapat();
      continue;
    }

    // başlıklar — h1 makalenin kendi başlığıdır, içerikte h2'den başlanır
    let m;
    if ((m = s.match(/^#{1,6}\s+(.*)$/))) {
      listeyiKapat();
      const seviye = Math.min(Math.max(s.match(/^#+/)[0].length, 2), 4);
      çıktı.push(`<h${seviye}>${satıriçi(m[1])}</h${seviye}>`);
      continue;
    }
    // yatay çizgi
    if (/^([-*_])\1{2,}$/.test(s)) {
      listeyiKapat();
      çıktı.push("<hr>");
      continue;
    }
    // alıntı
    if ((m = s.match(/^>\s?(.*)$/))) {
      listeyiKapat();
      çıktı.push(`<blockquote>${satıriçi(m[1])}</blockquote>`);
      continue;
    }
    // sıralı liste
    if ((m = s.match(/^\d+[.)]\s+(.*)$/))) {
      if (liste !== "ol") {
        listeyiKapat();
        çıktı.push("<ol>");
        liste = "ol";
      }
      çıktı.push(`<li>${satıriçi(m[1])}</li>`);
      continue;
    }
    // madde listesi
    if ((m = s.match(/^[-*+]\s+(.*)$/))) {
      if (liste !== "ul") {
        listeyiKapat();
        çıktı.push("<ul>");
        liste = "ul";
      }
      çıktı.push(`<li>${satıriçi(m[1])}</li>`);
      continue;
    }
    // paragraf
    listeyiKapat();
    çıktı.push(`<p>${satıriçi(s)}</p>`);
  }
  listeyiKapat();
  tabloyuBoşalt();
  if (kodda && kodTampon.length)
    çıktı.push(`<pre><code>${esc(kodTampon.join("\n"))}</code></pre>`);

  return çıktı.join("\n");
}

/* ————— Yardımcılar ————— */
const trTarih = (t) => {
  if (!t) return "";
  try {
    return new Date(t).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};
const okumaSüresi = (md) => {
  const kelime = String(md || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(kelime / 200));
};

/* ————— Ortak sayfa iskeleti ————— */
function sayfa({ başlık, açıklama, kanonik, ogGörsel, jsonLd, gövde, tip }) {
  const görsel = ogGörsel || `${SITE}/icons/icon-512.png`;
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(başlık)}</title>
<meta name="description" content="${escAttr(açıklama)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escAttr(kanonik)}">
<meta name="theme-color" content="#0A0C11">
<meta property="og:type" content="${tip === "makale" ? "article" : "website"}">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${MARKA}">
<meta property="og:title" content="${escAttr(başlık)}">
<meta property="og:description" content="${escAttr(açıklama)}">
<meta property="og:url" content="${escAttr(kanonik)}">
<meta property="og:image" content="${escAttr(görsel)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escAttr(başlık)}">
<meta name="twitter:description" content="${escAttr(açıklama)}">
<meta name="twitter:image" content="${escAttr(görsel)}">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${MARKA} Blog" href="${SITE}/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
<style>
:root{--gece:#0A0C11;--gece-2:#12151C;--gece-3:#1B212C;--cizgi:#232A36;
--ink:#E9ECF2;--ink2:#A4ACBA;--mut:#727C8C;--marka-a:#8E93FF;--acc:#6366F1}
*{box-sizing:border-box}
body{margin:0;background:var(--gece);color:var(--ink);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:17px;line-height:1.75;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Bricolage Grotesque','Inter',sans-serif;font-weight:700;line-height:1.15;letter-spacing:-.025em;margin:0}
a{color:var(--marka-a)}
img{max-width:100%;height:auto;display:block;border-radius:12px}
:focus-visible{outline:3px solid var(--marka-a);outline-offset:3px;border-radius:8px}
.sinir{max-width:760px;margin:0 auto;padding:0 22px}
.genis{max-width:940px}
.ust{border-bottom:1px solid var(--cizgi);background:rgba(10,12,17,.92);backdrop-filter:blur(12px);position:sticky;top:0;z-index:20}
.ust-ic{display:flex;align-items:center;gap:16px;height:62px;max-width:940px;margin:0 auto;padding:0 22px}
.logo{display:flex;align-items:center;gap:10px;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:17px;color:var(--ink);text-decoration:none}
.logo svg{width:28px;height:28px;border-radius:8px;flex:none}
.ust nav{margin-left:auto;display:flex;gap:20px;font-size:14.5px}
.ust nav a{color:var(--ink2);text-decoration:none}
.ust nav a:hover{color:#fff}
.kirinti{font-size:13px;color:var(--mut);padding:26px 0 0}
.kirinti a{color:var(--mut);text-decoration:none}
.kirinti a:hover{color:var(--ink)}
article{padding:14px 0 60px}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--marka-a);display:block;margin:18px 0 14px}
h1{font-size:clamp(30px,4.6vw,46px);font-weight:800;margin-bottom:16px}
.ozet{color:var(--ink2);font-size:19px;margin:0 0 22px}
.kunye{display:flex;gap:16px;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--mut);padding-bottom:26px;border-bottom:1px solid var(--cizgi);margin-bottom:34px}
.govde h2{font-size:26px;margin:42px 0 14px}
.govde h3{font-size:21px;margin:32px 0 10px}
.govde h4{font-size:18px;margin:24px 0 8px}
.govde p{margin:0 0 20px;color:#D5DAE3}
.govde ul,.govde ol{margin:0 0 22px;padding-left:24px;color:#D5DAE3}
.govde li{margin-bottom:9px}
.govde blockquote{margin:26px 0;padding:16px 22px;border-left:3px solid var(--acc);background:var(--gece-2);border-radius:0 12px 12px 0;color:var(--ink2)}
.govde blockquote p{margin:0}
.govde code{font-family:'JetBrains Mono',monospace;font-size:.88em;background:var(--gece-3);padding:2px 6px;border-radius:5px}
.govde pre{background:var(--gece-2);border:1px solid var(--cizgi);border-radius:12px;padding:16px;overflow-x:auto;margin:0 0 22px}
.govde pre code{background:none;padding:0}
.govde hr{border:0;border-top:1px solid var(--cizgi);margin:36px 0}
.govde img{margin:26px 0}
.tablo-kap{overflow-x:auto;margin:0 0 24px}
.govde table{border-collapse:collapse;width:100%;font-size:15px}
.govde th,.govde td{border:1px solid var(--cizgi);padding:10px 13px;text-align:left}
.govde th{background:var(--gece-2);font-weight:600}
.etiketler{display:flex;gap:8px;flex-wrap:wrap;margin:40px 0 0}
.etiketler span{background:var(--gece-2);border:1px solid var(--cizgi);color:var(--ink2);padding:6px 13px;border-radius:999px;font-size:13px}
.cta{background:linear-gradient(150deg,var(--gece-2),var(--gece-3));border:1px solid var(--cizgi);border-radius:18px;padding:30px;margin:46px 0 0;text-align:center}
.cta h2{font-size:24px;margin:0 0 10px}
.cta p{color:var(--ink2);margin:0 auto 20px;max-width:440px;font-size:15px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 26px;border-radius:12px;font-weight:600;font-size:15px;background:linear-gradient(120deg,#8E93FF,#6366F1 50%,#8B37E8);color:#fff;text-decoration:none}
.liste{display:grid;gap:13px;padding:26px 0 0}
.yazi{display:block;background:var(--gece-2);border:1px solid var(--cizgi);border-radius:16px;padding:20px;text-decoration:none;color:inherit;transition:border-color .2s,transform .2s}
.yazi:hover{border-color:rgba(142,147,255,.5);transform:translateY(-2px)}
.yazi h2{font-size:20px;margin-bottom:7px}
.yazi p{margin:0;color:var(--mut);font-size:14.5px}
.yazi .alt{margin-top:11px;font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--mut)}
footer{border-top:1px solid var(--cizgi);padding:26px 0;font-size:13px;color:var(--mut)}
footer .ic{display:flex;gap:10px 22px;flex-wrap:wrap;justify-content:space-between;max-width:940px;margin:0 auto;padding:0 22px}
footer a{color:var(--mut);text-decoration:none}
footer a:hover{color:#fff}
</style>
</head>
<body>
<header class="ust"><div class="ust-ic">
  <a href="/" class="logo">
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="kpLG" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#4F46E5"/>
          <stop offset="50%" stop-color="#4338CA"/>
          <stop offset="100%" stop-color="#1E1B4B"/>
        </linearGradient>
        <linearGradient id="kpTLeft" x1="12" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#C7D2FE"/>
        </linearGradient>
        <linearGradient id="kpTRight" x1="26" y1="18" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#E0E7FF"/>
          <stop offset="100%" stop-color="#A5B4FC"/>
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="url(#kpLG)"/>
      <rect x="2" y="2" width="44" height="44" rx="11.5" stroke="#FFFFFF" stroke-opacity=".2" stroke-width="1"/>
      <path d="M13 35V16C13 15.2 13.6 14.5 14.4 14.5H21.6C22.4 14.5 23 15.2 23 16V35H13Z" fill="url(#kpTLeft)"/>
      <path d="M13 16L23 12V14.5L13 16Z" fill="#FFFFFF"/>
      <rect x="15.5" y="17.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="18.5" y="17.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="15.5" y="20.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="18.5" y="20.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="15.5" y="23.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="18.5" y="23.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="15.5" y="26.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="18.5" y="26.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <path d="M25 35V21C25 20.2 25.6 19.5 26.4 19.5H33.6C34.4 19.5 35 20.2 35 21V35H25Z" fill="url(#kpTRight)"/>
      <path d="M25 21L35 17.5V19.5L25 21Z" fill="#FFFFFF"/>
      <rect x="27.2" y="22.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="30.5" y="22.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="27.2" y="25.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="30.5" y="25.5" width="2.2" height="1.4" rx=".4" fill="#4338CA"/>
      <rect x="21.5" y="29" width="5" height="3" rx=".8" fill="#38BDF8"/>
      <rect x="11.5" y="34" width="25" height="2.5" rx=".8" fill="#FFFFFF"/>
      <circle cx="24" cy="11.5" r="1.8" fill="#FCD34D"/>
      <path d="M24 9V9.8M24 13.2V14M21.5 11.5H22.3M25.7 11.5H26.5" stroke="#FCD34D" stroke-width=".6" stroke-linecap="round"/>
    </svg>${MARKA}</a>
  <nav><a href="/">Ana sayfa</a><a href="/blog">Blog</a><a href="/uygulama">Giriş</a></nav>
</div></header>
${gövde}
<footer><div class="ic">
  <span>© ${new Date().getFullYear()} ${MARKA}. Tüm hakları saklıdır.</span>
  <span><a href="/kullanim-kosullari.html">Kullanım koşulları</a> · <a href="/gizlilik.html">Gizlilik</a> · <a href="/kvkk.html">KVKK</a></span>
</div></footer>
<script src="/i18n.js"></script>
</body>
</html>`;
}

/* ————— MAKALE SAYFASI ————— */
async function makaleSayfası(slug) {
  const veri = await rpc("makale_getir", { p_slug: slug });
  const m = Array.isArray(veri) ? veri[0] : veri;
  if (!m) return null;

  const kanonik = `${SITE}/y/${encodeURIComponent(m.slug)}`;
  const başlık = m.meta_baslik || `${m.baslik} | ${MARKA}`;
  const açıklama =
    m.meta_aciklama ||
    (m.ozet || String(m.icerik || "").replace(/[#*`>\-]/g, "")).slice(0, 158);
  const görsel = güvenliUrl(m.kapak_url) || `${SITE}/icons/icon-512.png`;
  const dk = okumaSüresi(m.icerik);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: m.baslik,
      description: açıklama,
      image: [görsel],
      inLanguage: "tr-TR",
      datePublished: m.yayin_tarihi,
      dateModified: m.guncelleme || m.yayin_tarihi,
      keywords: (m.etiketler || []).join(", "),
      wordCount: String(m.icerik || "").split(/\s+/).filter(Boolean).length,
      mainEntityOfPage: { "@type": "WebPage", "@id": kanonik },
      author: { "@type": "Organization", name: MARKA, url: SITE },
      publisher: {
        "@type": "Organization",
        name: MARKA,
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icons/icon-512.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: SITE + "/blog" },
        { "@type": "ListItem", position: 3, name: m.baslik, item: kanonik },
      ],
    },
  ];

  const gövde = `<div class="sinir">
  <nav class="kirinti"><a href="/">Ana sayfa</a> › <a href="/blog">Blog</a> › ${esc(m.baslik)}</nav>
  <article>
    <span class="eyebrow">${esc((m.etiketler && m.etiketler[0]) || "Rehber")}</span>
    <h1>${esc(m.baslik)}</h1>
    ${m.ozet ? `<p class="ozet">${esc(m.ozet)}</p>` : ""}
    <div class="kunye">
      <time datetime="${escAttr(m.yayin_tarihi || "")}">${esc(trTarih(m.yayin_tarihi))}</time>
      <span>${dk} dakikalık okuma</span>
      <span>${MARKA}</span>
    </div>
    ${görsel && m.kapak_url ? `<img src="${escAttr(görsel)}" alt="${escAttr(m.baslik)}" width="760" height="420">` : ""}
    <div class="govde">${markdown(m.icerik)}</div>
    ${
      (m.etiketler || []).length
        ? `<div class="etiketler">${m.etiketler
            .map((e) => `<span>${esc(e)}</span>`)
            .join("")}</div>`
        : ""
    }
    <section class="cta">
      <h2>Bunu elle takip etmeyin</h2>
      <p>Konut Panel aidat takibini, gelir-gideri ve sakin iletişimini tek ekranda toplar. Demo hesabınızı bugün açalım.</p>
      <a href="/#iletisim" class="btn">Ücretsiz demo isteyin</a>
    </section>
  </article>
</div>`;

  return sayfa({
    başlık,
    açıklama,
    kanonik,
    ogGörsel: görsel,
    jsonLd,
    gövde,
    tip: "makale",
  });
}

/* ————— BLOG LİSTESİ ————— */
async function blogSayfası() {
  const liste = (await rpc("makale_liste", { p_limit: 50, p_offset: 0 })) || [];
  const kanonik = `${SITE}/blog`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${MARKA} Blog`,
      url: kanonik,
      inLanguage: "tr-TR",
      publisher: { "@type": "Organization", name: MARKA, url: SITE },
      blogPost: liste.slice(0, 20).map((m) => ({
        "@type": "BlogPosting",
        headline: m.baslik,
        url: `${SITE}/y/${m.slug}`,
        datePublished: m.yayin_tarihi,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: kanonik },
      ],
    },
  ];

  const kartlar = liste.length
    ? liste
        .map(
          (m) => `<a class="yazi" href="/y/${encodeURIComponent(m.slug)}">
      <h2>${esc(m.baslik)}</h2>
      <p>${esc((m.ozet || "").slice(0, 170))}</p>
      <div class="alt">${esc(trTarih(m.yayin_tarihi))}${
            (m.etiketler || []).length
              ? " · " + esc(m.etiketler.slice(0, 3).join(" · "))
              : ""
          }</div></a>`
        )
        .join("\n")
    : `<p style="color:var(--mut)">Henüz yayınlanmış yazı yok.</p>`;

  const gövde = `<div class="sinir genis">
  <nav class="kirinti"><a href="/">Ana sayfa</a> › Blog</nav>
  <span class="eyebrow">Blog</span>
  <h1>Site ve apartman yönetimi rehberi</h1>
  <p class="ozet">Aidat hesabı, kat mülkiyeti, yönetim planı, denetim ve ortak gider paylaşımı. Yöneticinin gerçekten karşılaştığı sorular ve uygulanabilir cevaplar.</p>
  <div class="liste">${kartlar}</div>
  <section class="cta">
    <h2>Okumakla kalmayın, uygulayın</h2>
    <p>Konut Panel aidat takibini, gelir-gideri ve sakin iletişimini tek ekranda toplar.</p>
    <a href="/#iletisim" class="btn">Ücretsiz demo isteyin</a>
  </section>
  <div style="height:50px"></div>
</div>`;

  return sayfa({
    başlık: `Site ve Apartman Yönetimi Rehberi | ${MARKA} Blog`,
    açıklama:
      "Aidat takibi, kat mülkiyeti, yönetim planı ve site işletmesi üzerine yöneticiler için pratik rehberler.",
    kanonik,
    jsonLd,
    gövde,
    tip: "site",
  });
}

/* ————— SITEMAP ————— */
async function sitemap() {
  const sabit = [
    ["/", "1.0", "weekly"],
    ["/blog", "0.9", "daily"],
    ["/site-yonetim-programi", "0.9", "monthly"],
    ["/apartman-yonetim-programi", "0.8", "monthly"],
    ["/aidat-takip-programi", "0.8", "monthly"],
    ["/site-yonetim-programi", "0.95", "monthly"],
    ["/apartman-yonetim-programi", "0.95", "monthly"],
    ["/aidat-takip-programi", "0.95", "monthly"],
    ["/kullanim-kosullari.html", "0.2", "yearly"],
    ["/gizlilik.html", "0.2", "yearly"],
    ["/kvkk.html", "0.2", "yearly"],
    ["/veri-isleyen-sozlesmesi.html", "0.2", "yearly"],
  ];
  let makaleler = [];
  try {
    makaleler = (await rpc("makale_haritasi")) || [];
  } catch {}
  const bugün = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sabit
  .map(
    ([u, p, f]) =>
      `  <url><loc>${SITE}${u}</loc><lastmod>${bugün}</lastmod><changefreq>${f}</changefreq><priority>${p}</priority></url>`
  )
  .join("\n")}
${makaleler
  .map(
    (m) =>
      `  <url><loc>${SITE}/y/${encodeURIComponent(m.slug)}</loc><lastmod>${String(
        m.guncelleme || ""
      ).slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  )
  .join("\n")}
</urlset>`;
}

/* ————— RSS ————— */
async function rss() {
  const liste = (await rpc("makale_liste", { p_limit: 30, p_offset: 0 })) || [];
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${MARKA} Blog</title>
  <link>${SITE}/blog</link>
  <description>Site ve apartman yönetimi rehberleri</description>
  <language>tr</language>
  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${liste
  .map(
    (m) => `  <item>
    <title>${esc(m.baslik)}</title>
    <link>${SITE}/y/${encodeURIComponent(m.slug)}</link>
    <guid isPermaLink="true">${SITE}/y/${encodeURIComponent(m.slug)}</guid>
    <description>${esc(m.ozet || "")}</description>
    <pubDate>${m.yayin_tarihi ? new Date(m.yayin_tarihi).toUTCString() : ""}</pubDate>
  </item>`
  )
  .join("\n")}
</channel>
</rss>`;
}

/* ————— GİRİŞ NOKTASI ————— */
export default async (request) => {
  const url = new URL(request.url);
  const yol = url.pathname.replace(/\/+$/, "") || "/";

  const başlıklar = (tip, saniye) => ({
    "Content-Type": tip,
    "Cache-Control": `public, max-age=0, s-maxage=${saniye}, stale-while-revalidate=86400`,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });

  try {
    if (yol === "/sitemap.xml")
      return new Response(await sitemap(), {
        headers: başlıklar("application/xml; charset=utf-8", 3600),
      });

    if (yol === "/rss.xml")
      return new Response(await rss(), {
        headers: başlıklar("application/rss+xml; charset=utf-8", 3600),
      });

    if (yol === "/blog")
      return new Response(await blogSayfası(), {
        headers: başlıklar("text/html; charset=utf-8", 600),
      });

    const m = yol.match(/^\/y\/([A-Za-z0-9-]{3,120})$/);
    if (m) {
      const html = await makaleSayfası(decodeURIComponent(m[1]));
      if (!html)
        return new Response(
          sayfa({
            başlık: `Yazı bulunamadı | ${MARKA}`,
            açıklama: "Aradığınız yazı yayından kaldırılmış olabilir.",
            kanonik: `${SITE}/blog`,
            jsonLd: [],
            tip: "site",
            gövde: `<div class="sinir"><article><h1>Yazı bulunamadı</h1>
              <p class="ozet">Bu yazı yayından kaldırılmış ya da adresi değişmiş olabilir.</p>
              <a href="/blog" class="btn">Bütün yazılara dön</a></article></div>`,
          }),
          { status: 404, headers: başlıklar("text/html; charset=utf-8", 60) }
        );
      return new Response(html, {
        headers: başlıklar("text/html; charset=utf-8", 600),
      });
    }

    return new Response("Bulunamadı", { status: 404 });
  } catch (e) {
    return new Response("Sayfa şu anda yüklenemiyor.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
};

export const config = {
  path: ["/blog", "/y/*", "/sitemap.xml", "/rss.xml"],
};
