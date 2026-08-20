import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Master SVG Design for Konut Panel Logo
// - Modern architectural geometry
// - Luxury deep indigo & violet gradient background with ambient depth glow
// - Sleek layered white & cyan geometric towers with golden smart spark
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

// Maskable SVG for Android adaptive icons (padded for circular/squircle crop)
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

  <!-- Centered Scaled Content (within 66% safe zone radius ~338px) -->
  <g transform="translate(26, 26) scale(0.9)">
    <!-- Left Main Tower -->
    <path d="M150 370V176C150 167.163 157.163 160 166 160H230C238.837 160 246 167.163 246 176V370H150Z" fill="url(#mtowerLeft)"/>
    <path d="M150 176L246 134V160L150 176Z" fill="#FFFFFF" fill-opacity="0.9"/>
    
    <!-- Windows -->
    <rect x="172" y="190" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="190" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="172" y="218" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="218" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="172" y="246" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="246" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="172" y="274" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>
    <rect x="202" y="274" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.75"/>

    <!-- Right Residential Wing -->
    <path d="M264 370V224C264 215.163 271.163 208 280 208H346C354.837 208 362 215.163 362 224V370H264Z" fill="url(#mtowerRight)"/>
    <path d="M264 224L362 188V208L264 224Z" fill="#FFFFFF" fill-opacity="0.8"/>

    <rect x="284" y="238" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="238" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="284" y="266" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>
    <rect x="316" y="266" width="20" height="11" rx="2.5" fill="#4338CA" fill-opacity="0.7"/>

    <!-- Central Link -->
    <rect x="234" y="304" width="44" height="28" rx="6" fill="url(#mcoreGlow)"/>

    <!-- Podium Base -->
    <rect x="136" y="358" width="240" height="22" rx="7" fill="#FFFFFF"/>
    
    <!-- Smart Star Beacon -->
    <circle cx="256" cy="132" r="14" fill="url(#mgoldAccent)"/>
    <path d="M256 110V116M256 148V154M234 132H240M272 132H278" stroke="url(#mgoldAccent)" stroke-width="3.5" stroke-linecap="round"/>
  </g>
</svg>
`;

async function generate() {
  const iconsDir = path.resolve('icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuf = Buffer.from(masterSvg);
  const maskableSvgBuf = Buffer.from(maskableSvg);

  // 1. favicon-32.png
  await sharp(svgBuf).resize(32, 32).png().toFile(path.join(iconsDir, 'favicon-32.png'));
  await sharp(svgBuf).resize(32, 32).png().toFile(path.join(iconsDir, 'favicon-32-v2.png'));
  await sharp(svgBuf).resize(32, 32).png().toFile(path.resolve('favicon.png'));
  await sharp(svgBuf).resize(32, 32).png().toFile(path.resolve('favicon-32.png'));
  console.log('✓ favicon-32.png');

  // 2. apple-touch-icon.png (180x180)
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon-v2.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.resolve('apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // 3. icon-192.png (192x192)
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192-v2.png'));
  await sharp(svgBuf).resize(192, 192).png().toFile(path.resolve('icon-192.png'));
  console.log('✓ icon-192.png');

  // 4. icon-512.png (512x512)
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512-v2.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.resolve('icon-512.png'));
  console.log('✓ icon-512.png');

  // 5. konutpanel-logo-280.png (280x280)
  await sharp(svgBuf).resize(280, 280).png().toFile(path.join(iconsDir, 'konutpanel-logo-280.png'));
  await sharp(svgBuf).resize(280, 280).png().toFile(path.resolve('konutpanel-logo-280.png'));
  console.log('✓ konutpanel-logo-280.png');

  // 6. maskable-512.png (512x512 Android adaptive)
  await sharp(maskableSvgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'maskable-512.png'));
  await sharp(maskableSvgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'maskable-512-v2.png'));
  await sharp(maskableSvgBuf).resize(512, 512).png().toFile(path.resolve('maskable-512.png'));
  console.log('✓ maskable-512.png');

  console.log('🎉 All icons successfully rendered from vector master!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
