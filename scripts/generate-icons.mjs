import sharp from 'sharp';
import fs from 'fs';
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

// App icon sizes (Android mipmap)
const APP_ICONS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Adaptive icon foreground size (needs padding for safe zone)
const ADAPTIVE_SIZE = 432; // 108dp * 4 for xxxhdpi

async function removeBackground(inputPath) {
  // Load image and make the dark background transparent
  // The background is approximately #0D0E14 (dark)
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  // Extract the N logo by removing dark background
  // We'll use a threshold approach - dark pixels become transparent
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const newPixels = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    const a = pixels[i * 4 + 3];

    // Check if pixel is dark background (threshold)
    // Background is around #0D0E14 (13, 14, 20)
    const isDark = r < 35 && g < 35 && b < 35;

    newPixels[i * 4] = r;
    newPixels[i * 4 + 1] = g;
    newPixels[i * 4 + 2] = b;
    newPixels[i * 4 + 3] = isDark ? 0 : a; // Make dark pixels transparent
  }

  return sharp(newPixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  }).png();
}

async function main() {
  console.log('Loading source image...');

  // Create transparent version
  console.log('Creating transparent background version...');
  const transparentLogo = await removeBackground(SOURCE);
  const transparentBuffer = await transparentLogo.toBuffer();

  // Save master transparent logo
  await sharp(transparentBuffer).toFile(path.join(WEB_PUBLIC, 'logo-master-transparent.png'));
  console.log('Created master transparent logo');

  // Generate web icons
  console.log('\nGenerating web icons...');
  for (const icon of WEB_ICONS) {
    await sharp(transparentBuffer)
      .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(WEB_PUBLIC, icon.name));
    console.log(`  Created ${icon.name}`);
  }

  // Generate favicon.ico (using 32x32 PNG as base)
  await sharp(transparentBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(WEB_PUBLIC, 'favicon.ico'));
  console.log('  Created favicon.ico');

  // Generate app header logo
  console.log('\nGenerating app header logo...');
  await sharp(transparentBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(APP_ASSETS, 'logo.png'));
  console.log('  Created logo.png for app');

  // Generate app launcher icons (with background for better visibility)
  console.log('\nGenerating app launcher icons...');

  // For launcher icons, we keep the original with dark background (looks better on home screen)
  const sourceImage = sharp(SOURCE);

  for (const icon of APP_ICONS) {
    const outputPath = path.join(APP_RES, icon.folder, 'ic_launcher.png');
    await sourceImage
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`  Created ${icon.folder}/ic_launcher.png`);

    // Also create round version
    const roundPath = path.join(APP_RES, icon.folder, 'ic_launcher_round.png');
    await sourceImage
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(roundPath);
    console.log(`  Created ${icon.folder}/ic_launcher_round.png`);
  }

  // Generate adaptive icon foreground (just the N, centered with padding)
  console.log('\nGenerating adaptive icon assets...');
  const foregroundPath = path.join(APP_RES, 'drawable', 'ic_launcher_foreground.png');

  // For adaptive icons, the foreground needs extra padding (icon should be ~66% of the size)
  const iconSize = Math.floor(ADAPTIVE_SIZE * 0.66);
  const padding = Math.floor((ADAPTIVE_SIZE - iconSize) / 2);

  await sharp(transparentBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(foregroundPath);
  console.log('  Created drawable/ic_launcher_foreground.png');

  // Create monochrome version (white silhouette)
  const monoPath = path.join(APP_RES, 'drawable', 'ic_launcher_monochrome.png');

  // For monochrome, we need to convert the purple N to white
  const { data: monoData, info: monoInfo } = await sharp(transparentBuffer)
    .resize(iconSize, iconSize)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const monoPixels = new Uint8Array(monoData);
  const newMonoPixels = Buffer.alloc(monoInfo.width * monoInfo.height * 4);

  for (let i = 0; i < monoInfo.width * monoInfo.height; i++) {
    const a = monoPixels[i * 4 + 3];
    // If pixel is visible (not transparent), make it white
    newMonoPixels[i * 4] = 255; // R
    newMonoPixels[i * 4 + 1] = 255; // G
    newMonoPixels[i * 4 + 2] = 255; // B
    newMonoPixels[i * 4 + 3] = a; // Keep original alpha
  }

  await sharp(newMonoPixels, {
    raw: { width: monoInfo.width, height: monoInfo.height, channels: 4 }
  })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(monoPath);
  console.log('  Created drawable/ic_launcher_monochrome.png');

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
