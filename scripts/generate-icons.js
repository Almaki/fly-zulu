const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon-512x512.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...');

  const svgBuffer = fs.readFileSync(inputSvg);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  const maskableSizes = [192, 512];

  for (const size of maskableSizes) {
    const outputPath = path.join(outputDir, `icon-maskable-${size}x${size}.png`);

    const innerSize = Math.floor(size * 0.8);
    const padding = Math.floor((size - innerSize) / 2);

    await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-maskable-${size}x${size}.png`);
  }

  console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
