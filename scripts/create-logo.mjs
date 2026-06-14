import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const WEB_PUBLIC = '/Users/user/nightticker/public';
const APP_RES = '/Users/user/nightticker-app/android/app/src/main/res';
const APP_ASSETS = '/Users/user/nightticker-app/assets';

// Create SVG of the original OG logo (purple gradient + white N)
function createLogoSVG(size) {
  const borderRadius = Math.round(size * 0.22); // ~20% border radius
  const fontSize = Math.round(size * 0.55);

  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${borderRadius}" ry="${borderRadius}" fill="url(#grad)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="white">N</text>
</svg>`;
}

// Web icon sizes
const WEB_ICONS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'google-search-icon-48x48.png', size: 48 },
  { name: 'google-search-icon-96x96.png', size: 96 },
  { name: 'nightticker-logo-transparent-512.png', size: 512 },
  { name: 'nightticker-web-icon-1024.png', size: 1024 },
];

// App launcher icon sizes
const APP_ICONS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function main() {
  console.log('Creating logo from original OG design (purple gradient + white N)...\n');

  // Generate web icons
  console.log('Generating web icons...');
  for (const icon of WEB_ICONS) {
    const svg = createLogoSVG(icon.size);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(WEB_PUBLIC, icon.name));
    console.log(`  Created ${icon.name}`);
  }

  // favicon.ico
  const svg32 = createLogoSVG(32);
  await sharp(Buffer.from(svg32))
    .png()
    .toFile(path.join(WEB_PUBLIC, 'favicon.ico'));
  console.log('  Created favicon.ico');

  // Save master SVG
  fs.writeFileSync(
    path.join(WEB_PUBLIC, 'nightticker-logo.svg'),
    createLogoSVG(512)
  );
  console.log('  Created nightticker-logo.svg');

  console.log('\nGenerating app icons...');

  // App header logo
  const logoSvg = createLogoSVG(512);
  await sharp(Buffer.from(logoSvg))
    .png()
    .toFile(path.join(APP_ASSETS, 'logo.png'));
  console.log('  Created assets/logo.png');

  // App launcher icons
  for (const icon of APP_ICONS) {
    const svg = createLogoSVG(icon.size);
    const launcherPath = path.join(APP_RES, icon.folder, 'ic_launcher.png');
    const roundPath = path.join(APP_RES, icon.folder, 'ic_launcher_round.png');

    await sharp(Buffer.from(svg)).png().toFile(launcherPath);
    console.log(`  Created ${icon.folder}/ic_launcher.png`);

    await sharp(Buffer.from(svg)).png().toFile(roundPath);
    console.log(`  Created ${icon.folder}/ic_launcher_round.png`);
  }

  // Adaptive icon foreground
  const foregroundSvg = createLogoSVG(432);
  await sharp(Buffer.from(foregroundSvg))
    .png()
    .toFile(path.join(APP_RES, 'drawable', 'ic_launcher_foreground.png'));
  console.log('  Created drawable/ic_launcher_foreground.png');

  console.log('\nAll icons created with original OG logo design!');
}

main().catch(console.error);
