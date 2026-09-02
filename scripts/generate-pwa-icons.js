const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Standard Icon SVG (512x512)
const standardSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.6" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded rectangle -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" />
  
  <!-- Subtle inner shadow overlay -->
  <rect x="24" y="24" width="464" height="464" rx="100" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="6" />

  <!-- Center Card Emblem -->
  <rect x="80" y="80" width="352" height="352" rx="72" fill="url(#badgeGrad)" filter="url(#shadow)" />
  <rect x="80" y="80" width="352" height="352" rx="72" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="3" />

  <!-- Stylized Lightning / Ninja Slash -->
  <path d="M260 120 L210 240 L280 240 L240 380 L320 230 L260 230 Z" fill="#60a5fa" opacity="0.35" />

  <!-- Text "MNW" -->
  <text x="256" y="280" 
        text-anchor="middle" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        font-size="96" 
        font-weight="900" 
        letter-spacing="4" 
        fill="#ffffff">
    MNW
  </text>

  <!-- Subtitle -->
  <text x="256" y="340" 
        text-anchor="middle" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        font-size="22" 
        font-weight="700" 
        letter-spacing="6" 
        fill="rgba(255, 255, 255, 0.85)">
    MY NINJAA WAY
  </text>
</svg>
`;

// 2. Maskable Icon SVG (full bleed gradient, safe-zone content inside 80% circle)
const maskableSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
  </defs>

  <!-- Full bleed background -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Content completely within safe zone (r=204, center=256,256) -->
  <circle cx="256" cy="256" r="160" fill="rgba(15, 23, 42, 0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="4" />

  <!-- Stylized Lightning / Slash -->
  <path d="M260 145 L220 240 L275 240 L245 350 L310 230 L260 230 Z" fill="#93c5fd" opacity="0.3" />

  <!-- Text "MNW" -->
  <text x="256" y="275" 
        text-anchor="middle" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        font-size="86" 
        font-weight="900" 
        letter-spacing="3" 
        fill="#ffffff">
    MNW
  </text>

  <text x="256" y="325" 
        text-anchor="middle" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        font-size="18" 
        font-weight="700" 
        letter-spacing="4" 
        fill="rgba(255, 255, 255, 0.85)">
    MY NINJAA WAY
  </text>
</svg>
`;

async function generate() {
  console.log('Generating PWA icons with sharp...');

  // 192x192
  await sharp(Buffer.from(standardSvg(512)))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));
  console.log('✓ icon-192x192.png generated');

  // 512x512
  await sharp(Buffer.from(standardSvg(512)))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('✓ icon-512x512.png generated');

  // Maskable 192x192
  await sharp(Buffer.from(maskableSvg(512)))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-192x192.png'));
  console.log('✓ icon-maskable-192x192.png generated');

  // Maskable 512x512
  await sharp(Buffer.from(maskableSvg(512)))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  console.log('✓ icon-maskable-512x512.png generated');

  // Apple touch icon 180x180
  await sharp(Buffer.from(standardSvg(512)))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180) generated');

  // Also write SVG for reference/scalable use
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), standardSvg(512));
  console.log('✓ icon.svg generated');
  console.log('All icons generated successfully!');
}

generate().catch(console.error);
