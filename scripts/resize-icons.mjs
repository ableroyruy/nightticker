import sharp from 'sharp';
import path from 'path';

const SOURCE = '/Users/user/Downloads/9b0968ed-c379-4f52-89f7-21e56be0e10f.png';
const WEB_PUBLIC = '/Users/user/nightticker/public';
const APP_RES = '/Users/user/nightticker-app/android/app/src/main/res';
const APP_ASSETS = '/Users/user/nightticker-app/assets';

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

// App launcher icon sizes (Android mipmap)
const APP_ICONS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function main() {
  const sourceImage = sharp(SOURCE);

  console.log('Generating web icons...');
  for (const icon of WEB_ICONS) {
    await sourceImage
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(WEB_PUBLIC, icon.name));
    console.log(`  Created ${icon.name}`);
  }

  // favicon.ico (32x32)
  await sourceImage
    .clone()
    .resize(32, 32)
    .toFile(path.join(WEB_PUBLIC, 'favicon.ico'));
  console.log('  Created favicon.ico');

  console.log('\nGenerating app icons...');

  // App header logo (largest size)
  await sourceImage
    .clone()
    .resize(512, 512)
    .png()
    .toFile(path.join(APP_ASSETS, 'logo.png'));
  console.log('  Created assets/logo.png');

  // App launcher icons
  for (const icon of APP_ICONS) {
    const launcherPath = path.join(APP_RES, icon.folder, 'ic_launcher.png');
    const roundPath = path.join(APP_RES, icon.folder, 'ic_launcher_round.png');

    await sourceImage
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(launcherPath);
    console.log(`  Created ${icon.folder}/ic_launcher.png`);

    await sourceImage
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(roundPath);
    console.log(`  Created ${icon.folder}/ic_launcher_round.png`);
  }

  // Adaptive icon foreground (432x432 with the logo centered)
  const foregroundPath = path.join(APP_RES, 'drawable', 'ic_launcher_foreground.png');
  await sourceImage
    .clone()
    .resize(432, 432)
    .png()
    .toFile(foregroundPath);
  console.log('  Created drawable/ic_launcher_foreground.png');

  console.log('\nAll icons generated!');
}

main().catch(console.error);
