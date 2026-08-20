import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Klasörleri oluştur
const ICONS_DIR = path.join(__dirname, '..', 'icons');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const ROOT_DIR = path.join(__dirname, '..');

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

/**
 * Konut Panel Logo SVG Üretici
 * @param {number} size - Toplam boyut (kare)
 * @param {boolean} isMaskable - True ise %80 güvenli alana yerleştirir
 */
function createLogoSvg(size, isMaskable = false) {
  const pad = isMaskable ? size * 0.15 : size * 0.08;
  const innerSize = size - pad * 2;
  
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Arka Plan Gradyanı -->
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0E1017"/>
        <stop offset="100%" stop-color="#07080B"/>
      </linearGradient>
      
      <!-- Mor Vurgu Gradyanları -->
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8E93FF"/>
        <stop offset="100%" stop-color="#7C5CFF"/>
      </linearGradient>
      
      <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7C5CFF"/>
        <stop offset="100%" stop-color="#4F35C2"/>
      </linearGradient>

      <linearGradient id="leftTower" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#C7D2FE"/>
      </linearGradient>

      <linearGradient id="rightTower" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E0E7FF"/>
        <stop offset="100%" stop-color="#A5B4FC"/>
      </linearGradient>

      <!-- İnce Glow & Gölge -->
      <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-color="#7C5CFF" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- 1. Opak Koyu Arka Plan (#0B0B0F) -->
    <rect width="${size}" height="${size}" fill="#0B0B0F"/>

    <!-- 2. Logo Grubu -->
    <g transform="translate(${pad}, ${pad})" filter="url(#purpleGlow)">
      <!-- Logo Dış Çerçevesi (Squircle) -->
      <rect x="0" y="0" width="${innerSize}" height="${innerSize}" rx="${innerSize * 0.22}" fill="url(#panelGrad)"/>
      <rect x="${innerSize * 0.015}" y="${innerSize * 0.015}" width="${innerSize * 0.97}" height="${innerSize * 0.97}" rx="${innerSize * 0.21}" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="${innerSize * 0.02}"/>

      <!-- Sol Bina Kulesi -->
      <path d="M${innerSize * 0.28} ${innerSize * 0.76} V${innerSize * 0.35} C${innerSize * 0.28} ${innerSize * 0.32} ${innerSize * 0.30} ${innerSize * 0.30} ${innerSize * 0.33} ${innerSize * 0.30} H${innerSize * 0.47} C${innerSize * 0.50} ${innerSize * 0.30} ${innerSize * 0.52} ${innerSize * 0.32} ${innerSize * 0.52} ${innerSize * 0.35} V${innerSize * 0.76} H${innerSize * 0.28} Z" fill="url(#leftTower)"/>
      <path d="M${innerSize * 0.28} ${innerSize * 0.35} L${innerSize * 0.52} ${innerSize * 0.25} V${innerSize * 0.30} L${innerSize * 0.28} ${innerSize * 0.35} Z" fill="#FFFFFF"/>

      <!-- Sol Kule Pencereleri (Koyu Mor) -->
      <rect x="${innerSize * 0.33}" y="${innerSize * 0.38}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.42}" y="${innerSize * 0.38}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.33}" y="${innerSize * 0.45}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.42}" y="${innerSize * 0.45}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.33}" y="${innerSize * 0.52}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.42}" y="${innerSize * 0.52}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.33}" y="${innerSize * 0.59}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.42}" y="${innerSize * 0.59}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>

      <!-- Sağ Bina Kulesi -->
      <path d="M${innerSize * 0.55} ${innerSize * 0.76} V${innerSize * 0.45} C${innerSize * 0.55} ${innerSize * 0.43} ${innerSize * 0.57} ${innerSize * 0.41} ${innerSize * 0.60} ${innerSize * 0.41} H${innerSize * 0.73} C${innerSize * 0.76} ${innerSize * 0.41} ${innerSize * 0.78} ${innerSize * 0.43} ${innerSize * 0.78} ${innerSize * 0.45} V${innerSize * 0.76} H${innerSize * 0.55} Z" fill="url(#rightTower)"/>
      <path d="M${innerSize * 0.55} ${innerSize * 0.45} L${innerSize * 0.78} ${innerSize * 0.37} V${innerSize * 0.41} L${innerSize * 0.55} ${innerSize * 0.45} Z" fill="#FFFFFF"/>

      <!-- Sağ Kule Pencereleri -->
      <rect x="${innerSize * 0.60}" y="${innerSize * 0.48}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.68}" y="${innerSize * 0.48}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.60}" y="${innerSize * 0.55}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.68}" y="${innerSize * 0.55}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.60}" y="${innerSize * 0.62}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>
      <rect x="${innerSize * 0.68}" y="${innerSize * 0.62}" width="${innerSize * 0.05}" height="${innerSize * 0.035}" rx="${innerSize * 0.008}" fill="#3730A3"/>

      <!-- Ana Giriş Kapısı -->
      <rect x="${innerSize * 0.46}" y="${innerSize * 0.64}" width="${innerSize * 0.11}" height="${innerSize * 0.12}" rx="${innerSize * 0.02}" fill="#38BDF8"/>

      <!-- Alt Zemin Çizgisi -->
      <rect x="${innerSize * 0.22}" y="${innerSize * 0.74}" width="${innerSize * 0.58}" height="${innerSize * 0.05}" rx="${innerSize * 0.015}" fill="#FFFFFF"/>

      <!-- Güneş / Enerji Simiti -->
      <circle cx="${innerSize * 0.51}" cy="${innerSize * 0.23}" r="${innerSize * 0.04}" fill="#FCD34D"/>
    </g>
  </svg>
  `;
}

/**
 * Masaüstü Ekran Görüntüsü SVG Üretici (1280x720)
 */
function createDesktopScreenshotSvg() {
  return `
  <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <!-- Arka Plan -->
    <rect width="1280" height="720" fill="#0B0B0F"/>

    <!-- Üst Bar (Header) -->
    <rect x="0" y="0" width="1280" height="68" fill="#12121A" stroke="#232334" stroke-width="1"/>
    <circle cx="48" cy="34" r="16" fill="#7C5CFF"/>
    <rect x="74" y="24" width="110" height="12" rx="4" fill="#FFFFFF"/>
    <rect x="74" y="40" width="140" height="8" rx="3" fill="#64748B"/>
    
    <rect x="860" y="20" width="80" height="28" rx="8" fill="none" stroke="#33334D" stroke-width="1"/>
    <rect x="955" y="20" width="120" height="28" rx="8" fill="#7C5CFF"/>
    <circle cx="1110" cy="34" r="16" fill="#1E1E2D"/>

    <!-- Sol Kenar Çubuğu (Sidebar) -->
    <rect x="24" y="92" width="240" height="604" rx="16" fill="#12121A" stroke="#1E1E2A" stroke-width="1"/>
    <!-- Menü Öğeleri -->
    <rect x="44" y="120" width="200" height="38" rx="10" fill="rgba(124, 92, 255, 0.15)" stroke="#7C5CFF" stroke-width="1"/>
    <rect x="80" y="133" width="90" height="12" rx="3" fill="#A58EFF"/>
    
    <rect x="44" y="170" width="200" height="38" rx="10" fill="#181824"/>
    <rect x="80" y="183" width="110" height="12" rx="3" fill="#94A3B8"/>
    
    <rect x="44" y="220" width="200" height="38" rx="10" fill="#181824"/>
    <rect x="80" y="233" width="95" height="12" rx="3" fill="#94A3B8"/>

    <rect x="44" y="270" width="200" height="38" rx="10" fill="#181824"/>
    <rect x="80" y="283" width="120" height="12" rx="3" fill="#94A3B8"/>

    <rect x="44" y="320" width="200" height="38" rx="10" fill="#181824"/>
    <rect x="80" y="333" width="85" height="12" rx="3" fill="#94A3B8"/>

    <!-- Ana Panel İçeriği -->
    <!-- KPI Kartları (4 adet) -->
    <g transform="translate(288, 92)">
      <rect x="0" y="0" width="225" height="110" rx="14" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="20" y="20" width="80" height="12" rx="3" fill="#64748B"/>
      <rect x="20" y="44" width="120" height="24" rx="4" fill="#FFFFFF"/>
      <rect x="20" y="78" width="90" height="10" rx="3" fill="#4ADE80"/>

      <rect x="245" y="0" width="225" height="110" rx="14" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="265" y="20" width="90" height="12" rx="3" fill="#64748B"/>
      <rect x="265" y="44" width="130" height="24" rx="4" fill="#FFFFFF"/>
      <rect x="265" y="78" width="70" height="10" rx="3" fill="#7C5CFF"/>

      <rect x="490" y="0" width="225" height="110" rx="14" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="510" y="20" width="70" height="12" rx="3" fill="#64748B"/>
      <rect x="510" y="44" width="110" height="24" rx="4" fill="#FFFFFF"/>
      <rect x="510" y="78" width="85" height="10" rx="3" fill="#FCD34D"/>

      <rect x="735" y="0" width="225" height="110" rx="14" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="755" y="20" width="95" height="12" rx="3" fill="#64748B"/>
      <rect x="755" y="44" width="140" height="24" rx="4" fill="#FFFFFF"/>
      <rect x="755" y="78" width="60" height="10" rx="3" fill="#38BDF8"/>
    </g>

    <!-- Büyük Grafik ve Tablo Alanı -->
    <g transform="translate(288, 226)">
      <!-- Aidat Tahsilat Grafiği Kartı -->
      <rect x="0" y="0" width="580" height="470" rx="16" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="24" y="24" width="180" height="18" rx="4" fill="#FFFFFF"/>
      <rect x="24" y="50" width="120" height="12" rx="3" fill="#64748B"/>

      <!-- Grafik Çubukları -->
      <g transform="translate(40, 100)">
        <rect x="0" y="240" width="500" height="1" fill="#222232"/>
        <rect x="0" y="160" width="500" height="1" fill="#222232"/>
        <rect x="0" y="80" width="500" height="1" fill="#222232"/>

        <rect x="20" y="60" width="30" height="180" rx="6" fill="#7C5CFF"/>
        <rect x="70" y="90" width="30" height="150" rx="6" fill="#7C5CFF"/>
        <rect x="120" y="40" width="30" height="200" rx="6" fill="#7C5CFF"/>
        <rect x="170" y="75" width="30" height="165" rx="6" fill="#7C5CFF"/>
        <rect x="220" y="30" width="30" height="210" rx="6" fill="#8E93FF"/>
        <rect x="270" y="50" width="30" height="190" rx="6" fill="#7C5CFF"/>
        <rect x="320" y="85" width="30" height="155" rx="6" fill="#7C5CFF"/>
        <rect x="370" y="45" width="30" height="195" rx="6" fill="#7C5CFF"/>
        <rect x="420" y="20" width="30" height="220" rx="6" fill="#4ADE80"/>
      </g>

      <!-- Son İşlemler / Arıza Talepleri Kartı -->
      <rect x="600" y="0" width="360" height="470" rx="16" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="624" y="24" width="140" height="18" rx="4" fill="#FFFFFF"/>
      <rect x="624" y="50" width="100" height="12" rx="3" fill="#64748B"/>

      <!-- Liste Öğeleri -->
      <rect x="624" y="85" width="312" height="68" rx="10" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="648" cy="119" r="12" fill="rgba(74, 222, 128, 0.2)"/>
      <rect x="670" y="105" width="120" height="12" rx="3" fill="#FFFFFF"/>
      <rect x="670" y="123" width="80" height="10" rx="3" fill="#64748B"/>
      <rect x="850" y="112" width="70" height="14" rx="4" fill="#4ADE80"/>

      <rect x="624" y="165" width="312" height="68" rx="10" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="648" cy="199" r="12" fill="rgba(124, 92, 255, 0.2)"/>
      <rect x="670" y="185" width="140" height="12" rx="3" fill="#FFFFFF"/>
      <rect x="670" y="203" width="90" height="10" rx="3" fill="#64748B"/>
      <rect x="850" y="192" width="70" height="14" rx="4" fill="#7C5CFF"/>

      <rect x="624" y="245" width="312" height="68" rx="10" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="648" cy="279" r="12" fill="rgba(252, 211, 77, 0.2)"/>
      <rect x="670" y="265" width="110" height="12" rx="3" fill="#FFFFFF"/>
      <rect x="670" y="283" width="70" height="10" rx="3" fill="#64748B"/>
      <rect x="850" y="272" width="70" height="14" rx="4" fill="#FCD34D"/>

      <rect x="624" y="325" width="312" height="68" rx="10" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="648" cy="359" r="12" fill="rgba(74, 222, 128, 0.2)"/>
      <rect x="670" y="345" width="130" height="12" rx="3" fill="#FFFFFF"/>
      <rect x="670" y="363" width="85" height="10" rx="3" fill="#64748B"/>
      <rect x="850" y="352" width="70" height="14" rx="4" fill="#4ADE80"/>
    </g>
  </svg>
  `;
}

/**
 * Mobil Ekran Görüntüsü SVG Üretici (720x1280)
 */
function createMobileScreenshotSvg() {
  return `
  <svg width="720" height="1280" viewBox="0 0 720 1280" xmlns="http://www.w3.org/2000/svg">
    <!-- Arka Plan -->
    <rect width="720" height="1280" fill="#0B0B0F"/>

    <!-- Üst Mobil Bar -->
    <rect x="0" y="0" width="720" height="96" fill="#12121A" stroke="#232334" stroke-width="1"/>
    <circle cx="56" cy="48" r="22" fill="#7C5CFF"/>
    <rect x="92" y="36" width="140" height="16" rx="4" fill="#FFFFFF"/>
    <rect x="92" y="58" width="180" height="10" rx="3" fill="#64748B"/>
    <circle cx="664" cy="48" r="20" fill="#1E1E2D"/>

    <!-- Karşılama ve Daire Kartı -->
    <g transform="translate(36, 124)">
      <rect x="0" y="0" width="648" height="170" rx="20" fill="linear-gradient(135deg, #181828 0%, #12121A 100%)" stroke="#2B2B3E" stroke-width="1.5"/>
      <rect x="30" y="28" width="140" height="14" rx="4" fill="#8E93FF"/>
      <rect x="30" y="52" width="260" height="28" rx="6" fill="#FFFFFF"/>
      <rect x="30" y="90" width="180" height="12" rx="3" fill="#94A3B8"/>
      
      <!-- Hızlı Ödeme Butonu -->
      <rect x="30" y="116" width="180" height="38" rx="10" fill="#7C5CFF"/>
      <rect x="60" y="129" width="120" height="12" rx="3" fill="#FFFFFF"/>
    </g>

    <!-- Hızlı İşlemler Grid (4 buton) -->
    <g transform="translate(36, 318)">
      <rect x="0" y="0" width="150" height="110" rx="16" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <circle cx="75" cy="42" r="18" fill="rgba(124, 92, 255, 0.15)"/>
      <rect x="35" y="74" width="80" height="12" rx="3" fill="#E2E8F0"/>

      <rect x="166" y="0" width="150" height="110" rx="16" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <circle cx="241" cy="42" r="18" fill="rgba(74, 222, 128, 0.15)"/>
      <rect x="201" y="74" width="80" height="12" rx="3" fill="#E2E8F0"/>

      <rect x="332" y="0" width="150" height="110" rx="16" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <circle cx="407" cy="42" r="18" fill="rgba(252, 211, 77, 0.15)"/>
      <rect x="367" y="74" width="80" height="12" rx="3" fill="#E2E8F0"/>

      <rect x="498" y="0" width="150" height="110" rx="16" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <circle cx="573" cy="42" r="18" fill="rgba(56, 189, 248, 0.15)"/>
      <rect x="533" y="74" width="80" height="12" rx="3" fill="#E2E8F0"/>
    </g>

    <!-- Aidat ve Borç Durumu Kartı -->
    <g transform="translate(36, 452)">
      <rect x="0" y="0" width="648" height="240" rx="20" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="28" y="26" width="160" height="16" rx="4" fill="#FFFFFF"/>
      <rect x="28" y="52" width="220" height="12" rx="3" fill="#64748B"/>
      
      <rect x="28" y="86" width="592" height="60" rx="12" fill="#181826"/>
      <rect x="48" y="104" width="140" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="48" y="124" width="90" height="10" rx="2" fill="#64748B"/>
      <rect x="510" y="108" width="90" height="16" rx="4" fill="#4ADE80"/>

      <rect x="28" y="156" width="592" height="60" rx="12" fill="#181826"/>
      <rect x="48" y="174" width="130" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="48" y="194" width="80" height="10" rx="2" fill="#64748B"/>
      <rect x="510" y="178" width="90" height="16" rx="4" fill="#7C5CFF"/>
    </g>

    <!-- Duyurular & Site Haberleri -->
    <g transform="translate(36, 716)">
      <rect x="0" y="0" width="648" height="420" rx="20" fill="#14141F" stroke="#222232" stroke-width="1"/>
      <rect x="28" y="26" width="180" height="16" rx="4" fill="#FFFFFF"/>
      <rect x="28" y="52" width="140" height="12" rx="3" fill="#64748B"/>

      <!-- Duyuru Kartı 1 -->
      <rect x="28" y="86" width="592" height="96" rx="14" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="64" cy="134" r="16" fill="rgba(124, 92, 255, 0.2)"/>
      <rect x="96" y="110" width="220" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="96" y="132" width="480" height="10" rx="2" fill="#94A3B8"/>
      <rect x="96" y="148" width="320" height="10" rx="2" fill="#64748B"/>

      <!-- Duyuru Kartı 2 -->
      <rect x="28" y="194" width="592" height="96" rx="14" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="64" cy="242" r="16" fill="rgba(56, 189, 248, 0.2)"/>
      <rect x="96" y="218" width="240" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="96" y="240" width="460" height="10" rx="2" fill="#94A3B8"/>
      <rect x="96" y="256" width="280" height="10" rx="2" fill="#64748B"/>

      <!-- Duyuru Kartı 3 -->
      <rect x="28" y="302" width="592" height="96" rx="14" fill="#181826" stroke="#262638" stroke-width="1"/>
      <circle cx="64" cy="350" r="16" fill="rgba(252, 211, 77, 0.2)"/>
      <rect x="96" y="326" width="200" height="14" rx="3" fill="#FFFFFF"/>
      <rect x="96" y="348" width="470" height="10" rx="2" fill="#94A3B8"/>
      <rect x="96" y="364" width="300" height="10" rx="2" fill="#64748B"/>
    </g>

    <!-- Alt Navigasyon Çubuğu (Bottom Navigation) -->
    <rect x="0" y="1160" width="720" height="120" fill="#12121A" stroke="#232334" stroke-width="1"/>
    <g transform="translate(0, 1175)">
      <circle cx="90" cy="25" r="18" fill="rgba(124, 92, 255, 0.18)"/>
      <rect x="65" y="52" width="50" height="8" rx="2" fill="#A58EFF"/>

      <circle cx="235" cy="25" r="16" fill="#181824"/>
      <rect x="210" y="52" width="50" height="8" rx="2" fill="#64748B"/>

      <circle cx="360" cy="20" r="28" fill="#7C5CFF"/>
      <rect x="335" y="56" width="50" height="8" rx="2" fill="#FFFFFF"/>

      <circle cx="485" cy="25" r="16" fill="#181824"/>
      <rect x="460" y="52" width="50" height="8" rx="2" fill="#64748B"/>

      <circle cx="630" cy="25" r="16" fill="#181824"/>
      <rect x="605" y="52" width="50" height="8" rx="2" fill="#64748B"/>
    </g>
  </svg>
  `;
}

async function run() {
  console.log('Generating Standardized PWA Assets with ESM...');

  // 1. Standart İkonlar (192, 512)
  const svg192 = Buffer.from(createLogoSvg(192, false));
  await sharp(svg192).png().toFile(path.join(ICONS_DIR, 'icon-192.png'));
  await sharp(svg192).png().toFile(path.join(ROOT_DIR, 'icon-192.png'));
  console.log('✓ /icons/icon-192.png generated (192x192, opaque)');

  const svg512 = Buffer.from(createLogoSvg(512, false));
  await sharp(svg512).png().toFile(path.join(ICONS_DIR, 'icon-512.png'));
  await sharp(svg512).png().toFile(path.join(ROOT_DIR, 'icon-512.png'));
  console.log('✓ /icons/icon-512.png generated (512x512, opaque)');

  // 2. Maskable İkonlar (192, 512 - %80 safe area)
  const svgMaskable192 = Buffer.from(createLogoSvg(192, true));
  await sharp(svgMaskable192).png().toFile(path.join(ICONS_DIR, 'icon-maskable-192.png'));
  await sharp(svgMaskable192).png().toFile(path.join(ICONS_DIR, 'maskable-192.png'));
  await sharp(svgMaskable192).png().toFile(path.join(ROOT_DIR, 'icon-maskable-192.png'));
  await sharp(svgMaskable192).png().toFile(path.join(ROOT_DIR, 'maskable-192.png'));
  console.log('✓ /icons/icon-maskable-192.png & maskable-192.png generated (192x192, maskable safe-zone)');

  const svgMaskable512 = Buffer.from(createLogoSvg(512, true));
  await sharp(svgMaskable512).png().toFile(path.join(ICONS_DIR, 'icon-maskable-512.png'));
  await sharp(svgMaskable512).png().toFile(path.join(ICONS_DIR, 'maskable-512.png'));
  await sharp(svgMaskable512).png().toFile(path.join(ROOT_DIR, 'icon-maskable-512.png'));
  await sharp(svgMaskable512).png().toFile(path.join(ROOT_DIR, 'maskable-512.png'));
  console.log('✓ /icons/icon-maskable-512.png & maskable-512.png generated (512x512, maskable safe-zone)');

  // 3. Apple Touch Icon (180x180 - opaque)
  const svgApple180 = Buffer.from(createLogoSvg(180, false));
  await sharp(svgApple180).png().toFile(path.join(ICONS_DIR, 'apple-touch-icon-180.png'));
  await sharp(svgApple180).png().toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  await sharp(svgApple180).png().toFile(path.join(ROOT_DIR, 'apple-touch-icon.png'));
  console.log('✓ /icons/apple-touch-icon-180.png generated (180x180, opaque)');

  // 4. Favicon (32x32)
  const svgFav32 = Buffer.from(createLogoSvg(32, false));
  await sharp(svgFav32).png().toFile(path.join(ICONS_DIR, 'favicon-32.png'));
  await sharp(svgFav32).png().toFile(path.join(ROOT_DIR, 'favicon-32.png'));
  console.log('✓ /icons/favicon-32.png generated (32x32)');

  // 5. Masaüstü Ekran Görüntüsü (1280x720)
  const svgDesktop = Buffer.from(createDesktopScreenshotSvg());
  await sharp(svgDesktop).png().toFile(path.join(SCREENSHOTS_DIR, 'desktop-1280x720.png'));
  console.log('✓ /screenshots/desktop-1280x720.png generated (1280x720, wide)');

  // 6. Mobil Ekran Görüntüsü (720x1280)
  const svgMobile = Buffer.from(createMobileScreenshotSvg());
  await sharp(svgMobile).png().toFile(path.join(SCREENSHOTS_DIR, 'mobile-720x1280.png'));
  console.log('✓ /screenshots/mobile-720x1280.png generated (720x1280, narrow)');

  console.log('All PWA binary assets generated successfully!');
}

run().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
