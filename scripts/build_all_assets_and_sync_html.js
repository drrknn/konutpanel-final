import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Master SVG Design for Konut Panel Logo
const masterSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="40" y1="20" x2="472" y2="492" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="50%" stop-color="#4338CA"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>

    <!-- Top Highlight -->
    <linearGradient id="topGlow" x1="256" y1="20" x2="256" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#818CF8" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#818CF8" stop-opacity="0"/>
    </linearGradient>

    <!-- Left Tower Gradient -->
    <linearGradient id="towerLeft" x1="130" y1="130" x2="250" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#C7D2FE"/>
    </linearGradient>

    <!-- Right Tower Gradient -->
    <linearGradient id="towerRight" x1="270" y1="190" x2="380" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="100%" stop-color="#A5B4FC"/>
    </linearGradient>

    <!-- Center Bridge / Core Cyan Gradient -->
    <linearGradient id="coreGlow" x1="210" y1="220" x2="300" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <!-- Golden Smart Pulse Accent -->
    <linearGradient id="goldAccent" x1="230" y1="110" x2="280" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>

    <!-- Ambient Shadow -->
    <filter id="dropShadow" x="80" y="80" width="352" height="352" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0A0C16" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Base Rounded Tile -->
  <rect x="16" y="16" width="480" height="480" rx="124" fill="url(#bgGrad)"/>
  
  <!-- Subtle Inner Border -->
  <rect x="20" y="20" width="472" height="472" rx="120" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="4"/>
  
  <!-- Top Specular Sheen -->
  <rect x="20" y="20" width="472" height="220" rx="120" fill="url(#topGlow)"/>

  <!-- Architectural Modern Emblem with Drop Shadow -->
  <g filter="url(#dropShadow)">
    <!-- Left Main Tower (Angled Modern Skyscraper) -->
    <path d="M140 376V164C140 155.163 147.163 148 156 148H224C232.837 148 240 155.163 240 164V376H140Z" fill="url(#towerLeft)"/>
    
    <!-- Left Tower Sloped Glass Crown -->
    <path d="M140 164L240 120V148L140 164Z" fill="#FFFFFF" fill-opacity="0.9"/>
    
    <!-- Left Tower Minimalist Window Slots -->
    <rect x="164" y="180" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="180" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="164" y="210" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="210" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="164" y="240" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="240" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="164" y="270" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="270" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>

    <!-- Right Residential Wing (Step Terrace) -->
    <path d="M260 376V216C260 207.163 267.163 200 276 200H348C356.837 200 364 207.163 364 216V376H260Z" fill="url(#towerRight)"/>
    
    <!-- Right Wing Sloped Crown -->
    <path d="M260 216L364 178V200L260 216Z" fill="#FFFFFF" fill-opacity="0.8"/>

    <!-- Right Wing Window Slots -->
    <rect x="282" y="232" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="232" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="282" y="262" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="262" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>

    <!-- Central Floating Smart Bridge / Connect Link -->
    <path d="M228 304H272C276.418 304 280 307.582 280 312V328C280 332.418 276.418 336 272 336H228C223.582 336 220 332.418 220 328V312C220 307.582 223.582 304 228 304Z" fill="url(#coreGlow)"/>

    <!-- Foundation Podium Base -->
    <rect x="124" y="364" width="264" height="24" rx="8" fill="#FFFFFF"/>
    
    <!-- Dynamic Smart Beacon / Sun Star above Tower -->
    <circle cx="256" cy="120" r="16" fill="url(#goldAccent)"/>
    <path d="M256 94V102M256 138V146M230 120H238M274 120H282" stroke="url(#goldAccent)" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
`;

// Maskable SVG for Android adaptive icons
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mbgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="50%" stop-color="#4338CA"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
    <linearGradient id="mtowerLeft" x1="150" y1="150" x2="250" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#C7D2FE"/>
    </linearGradient>
    <linearGradient id="mtowerRight" x1="270" y1="210" x2="360" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="100%" stop-color="#A5B4FC"/>
    </linearGradient>
    <linearGradient id="mcoreGlow" x1="220" y1="300" x2="280" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="mgoldAccent" x1="240" y1="120" x2="270" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>

  <!-- Full Bleed Background for Safe Zone Cropping -->
  <rect width="512" height="512" fill="url(#mbgGrad)"/>

  <!-- Centered Scaled Content -->
  <g transform="translate(26, 26) scale(0.9)">
    <path d="M150 370V176C150 167.163 157.163 160 166 160H230C238.837 160 246 167.163 246 176V370H150Z" fill="url(#mtowerLeft)"/>
    <path d="M150 176L246 134V160L150 176Z" fill="#FFFFFF" fill-opacity="0.9"/>
    
    <rect x="172" y="190" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="190" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="172" y="218" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="218" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="172" y="246" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="246" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="172" y="274" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="274" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>

    <path d="M264 370V224C264 215.163 271.163 208 280 208H346C354.837 208 362 215.163 362 224V370H264Z" fill="url(#mtowerRight)"/>
    <path d="M264 224L362 188V208L264 224Z" fill="#FFFFFF" fill-opacity="0.8"/>

    <rect x="284" y="238" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="238" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="284" y="266" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="266" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>

    <rect x="234" y="304" width="44" height="28" rx="6" fill="url(#mcoreGlow)"/>
    <rect x="136" y="358" width="240" height="22" rx="7" fill="#FFFFFF"/>
    
    <circle cx="256" cy="132" r="14" fill="url(#mgoldAccent)"/>
    <path d="M256 110V116M256 148V154M234 132H240M272 132H278" stroke="url(#mgoldAccent)" stroke-width="3.5" stroke-linecap="round"/>
  </g>
</svg>
`;

// Adaptive icon foreground SVG (transparent background with emblem centered)
const adaptiveForegroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="afTowerLeft" x1="130" y1="130" x2="250" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#C7D2FE"/>
    </linearGradient>
    <linearGradient id="afTowerRight" x1="270" y1="190" x2="380" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="100%" stop-color="#A5B4FC"/>
    </linearGradient>
    <linearGradient id="afCoreGlow" x1="210" y1="220" x2="300" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="afGoldAccent" x1="230" y1="110" x2="280" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="afDropShadow" x="80" y="80" width="352" height="352" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0A0C16" flood-opacity="0.35"/>
    </filter>
  </defs>

  <g transform="translate(44, 44) scale(0.67)" filter="url(#afDropShadow)">
    <path d="M140 376V164C140 155.163 147.163 148 156 148H224C232.837 148 240 155.163 240 164V376H140Z" fill="url(#afTowerLeft)"/>
    <path d="M140 164L240 120V148L140 164Z" fill="#FFFFFF" fill-opacity="0.9"/>
    
    <rect x="164" y="180" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="180" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="164" y="210" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="210" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="164" y="240" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="240" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="164" y="270" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="196" y="270" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.75"/>

    <path d="M260 376V216C260 207.163 267.163 200 276 200H348C356.837 200 364 207.163 364 216V376H260Z" fill="url(#afTowerRight)"/>
    <path d="M260 216L364 178V200L260 216Z" fill="#FFFFFF" fill-opacity="0.8"/>

    <rect x="282" y="232" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="232" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="282" y="262" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="262" width="22" height="12" rx="3" fill="#4338CA" fill-opacity="0.7"/>

    <path d="M228 304H272C276.418 304 280 307.582 280 312V328C280 332.418 276.418 336 272 336H228C223.582 336 220 332.418 220 328V312C220 307.582 223.582 304 228 304Z" fill="url(#afCoreGlow)"/>
    <rect x="124" y="364" width="264" height="24" rx="8" fill="#FFFFFF"/>
    
    <circle cx="256" cy="120" r="16" fill="url(#afGoldAccent)"/>
    <path d="M256 94V102M256 138V146M230 120H238M274 120H282" stroke="url(#afGoldAccent)" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
`;

// Monochrome notification icon SVG
const notificationIconSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 72V32C24 30 25.5 28.5 27.5 28.5H41.5C43.5 28.5 45 30 45 32V72H24Z" fill="#FFFFFF"/>
  <path d="M24 32L45 23V28.5L24 32Z" fill="#FFFFFF"/>
  <path d="M51 72V42C51 40 52.5 38.5 54.5 38.5H68.5C70.5 38.5 72 40 72 42V72H51Z" fill="#FFFFFF"/>
  <path d="M51 42L72 34V38.5L51 42Z" fill="#FFFFFF"/>
  <circle cx="48" cy="22" r="3.5" fill="#FFFFFF"/>
  <rect x="21" y="70" width="54" height="5" rx="1.5" fill="#FFFFFF"/>
</svg>
`;

// Splash screen SVG
function createSplashSvg(width, height) {
  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#0B0B0F"/>
  <g transform="translate(${width / 2 - 96}, ${height / 2 - 120})">
    <rect width="192" height="192" rx="48" fill="#4F46E5"/>
    <path d="M52 142V62C52 58.5 54.5 56 58 56H84C87.5 56 90 58.5 90 62V142H52Z" fill="#FFFFFF"/>
    <path d="M52 62L90 45V56L52 62Z" fill="#FFFFFF"/>
    <path d="M98 142V82C98 78.5 100.5 76 104 76H132C135.5 76 138 78.5 138 82V142H98Z" fill="#C7D2FE"/>
    <path d="M98 82L138 67V76L98 82Z" fill="#FFFFFF"/>
    <circle cx="96" cy="46" r="6" fill="#FCD34D"/>
    <rect x="46" y="137" width="100" height="9" rx="3" fill="#FFFFFF"/>
  </g>
</svg>
`;
}

async function run() {
  console.log('🚀 Starting Full Icon & Asset Generation...');

  const rootDir = process.cwd();
  const iconsDir = path.join(rootDir, 'icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const svgBuf = Buffer.from(masterSvg);
  const maskableSvgBuf = Buffer.from(maskableSvg);
  const adaptiveFgBuf = Buffer.from(adaptiveForegroundSvg);
  const notifBuf = Buffer.from(notificationIconSvg);

  // 1. Generate all Web/PWA icons in icons/ and root
  const sizes = [32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 280, 384, 512];
  for (const s of sizes) {
    const fn = `icon-${s}.png`;
    await sharp(svgBuf).resize(s, s).png().toFile(path.join(iconsDir, fn));
    await sharp(maskableSvgBuf).resize(s, s).png().toFile(path.join(iconsDir, `icon-maskable-${s}.png`));
  }

  await sharp(svgBuf).resize(32, 32).png().toFile(path.join(iconsDir, 'favicon-32.png'));
  await sharp(svgBuf).resize(32, 32).png().toFile(path.join(rootDir, 'favicon-32.png'));
  await sharp(svgBuf).resize(32, 32).png().toFile(path.join(rootDir, 'favicon.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon-180.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(rootDir, 'apple-touch-icon.png'));
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(rootDir, 'icon-192.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(rootDir, 'icon-512.png'));
  await sharp(svgBuf).resize(280, 280).png().toFile(path.join(iconsDir, 'konutpanel-logo-280.png'));
  await sharp(svgBuf).resize(280, 280).png().toFile(path.join(rootDir, 'konutpanel-logo-280.png'));
  await sharp(maskableSvgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'maskable-512.png'));
  await sharp(maskableSvgBuf).resize(512, 512).png().toFile(path.join(rootDir, 'maskable-512.png'));
  await sharp(maskableSvgBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'maskable-192.png'));
  await sharp(maskableSvgBuf).resize(192, 192).png().toFile(path.join(rootDir, 'maskable-192.png'));

  // Notification Badges (Monochrome alpha silhouette for Android status bar)
  await sharp(notifBuf).resize(72, 72).png().toFile(path.join(iconsDir, 'badge-72.png'));
  await sharp(notifBuf).resize(96, 96).png().toFile(path.join(iconsDir, 'badge-96.png'));
  await sharp(notifBuf).resize(128, 128).png().toFile(path.join(iconsDir, 'badge-128.png'));
  await sharp(notifBuf).resize(96, 96).png().toFile(path.join(rootDir, 'badge-96.png'));

  console.log('✓ All PWA / Web icons successfully generated');

  // 2. Generate Android TWA resources
  const resDir = path.join(rootDir, 'twa', 'app', 'src', 'main', 'res');
  if (fs.existsSync(resDir)) {
    const mipmaps = [
      { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
      { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
      { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
      { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
      { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 }
    ];

    for (const m of mipmaps) {
      const targetDir = path.join(resDir, m.dir);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      await sharp(svgBuf).resize(m.size, m.size).png().toFile(path.join(targetDir, 'ic_launcher.png'));
      await sharp(maskableSvgBuf).resize(m.size, m.size).png().toFile(path.join(targetDir, 'ic_launcher_round.png'));
      await sharp(adaptiveFgBuf).resize(m.fgSize, m.fgSize).png().toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
    }

    const drawables = [
      { dir: 'drawable-mdpi', notifSize: 24, splashW: 320, splashH: 480 },
      { dir: 'drawable-hdpi', notifSize: 36, splashW: 480, splashH: 800 },
      { dir: 'drawable-xhdpi', notifSize: 48, splashW: 720, splashH: 1280 },
      { dir: 'drawable-xxhdpi', notifSize: 72, splashW: 960, splashH: 1600 },
      { dir: 'drawable-xxxhdpi', notifSize: 96, splashW: 1280, splashH: 1920 }
    ];

    for (const d of drawables) {
      const targetDir = path.join(resDir, d.dir);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      await sharp(notifBuf).resize(d.notifSize, d.notifSize).png().toFile(path.join(targetDir, 'ic_notification.png'));
      const splashSvgBuf = Buffer.from(createSplashSvg(d.splashW, d.splashH));
      await sharp(splashSvgBuf).png().toFile(path.join(targetDir, 'splash.png'));
    }

    await sharp(svgBuf).resize(512, 512).png().toFile(path.join(resDir, 'store-icon-512.png'));
    console.log('✓ Android TWA mipmap and drawable assets fully generated');
  }

  // 3. Base64 encode icons for embedded use
  const fav32Buf = await sharp(svgBuf).resize(32, 32).png().toBuffer();
  const apple180Buf = await sharp(svgBuf).resize(180, 180).png().toBuffer();
  const logo192Buf = await sharp(svgBuf).resize(192, 192).png().toBuffer();

  const fav32B64 = `data:image/png;base64,${fav32Buf.toString('base64')}`;
  const apple180B64 = `data:image/png;base64,${apple180Buf.toString('base64')}`;
  const logo192B64 = `data:image/png;base64,${logo192Buf.toString('base64')}`;

  // 4. Update index.html and other HTML files
  const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(path.join(rootDir, htmlFile), 'utf8');

    // Replace old favicon link base64
    content = content.replace(/<link rel="icon" type="image\/x-icon" href="data:image\/png;base64,[^"]+"/g, `<link rel="icon" type="image/x-icon" href="/icons/favicon-32.png"`);
    content = content.replace(/<link rel="icon" id="favicon" type="image\/png" sizes="32x32" href="data:image\/png;base64,[^"]+"/g, `<link rel="icon" id="favicon" type="image/png" sizes="32x32" href="/icons/favicon-32.png"`);
    content = content.replace(/<link rel="apple-touch-icon" id="appleicon" sizes="180x180" href="data:image\/png;base64,[^"]+"/g, `<link rel="apple-touch-icon" id="appleicon" sizes="180x180" href="/icons/apple-touch-icon.png"`);
    content = content.replace(/<link rel="apple-touch-icon" sizes="180x180" href="data:image\/png;base64,[^"]+"/g, `<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"`);

    // Replace old splash logo base64
    content = content.replace(/<img src="data:image\/png;base64,[^"]+" width="56" height="56" alt="Konut Panel"[^>]*>/g, `<img src="${logo192B64}" width="56" height="56" alt="Konut Panel" style="border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.55);display:block">`);

    // Replace LOGO=(s) function base64
    content = content.replace(/const LOGO=\(s\)=>`<img class="kplogo" src="data:image\/png;base64,[^"]+"/g, `const LOGO=(s)=>\`<img class="kplogo" src="${logo192B64}"`);

    fs.writeFileSync(path.join(rootDir, htmlFile), content, 'utf8');
    console.log(`✓ Updated icons and logo in ${htmlFile}`);
  }

  console.log('🎉 Full asset synchronization completed successfully!');
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
