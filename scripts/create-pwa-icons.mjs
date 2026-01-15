/**
 * Script para crear iconos PWA placeholder
 * Crea archivos PNG simples para la PWA usando canvas en Node.js
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Main circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, 2 * Math.PI);
  ctx.strokeStyle = '#0088FF';
  ctx.lineWidth = size * 0.02;
  ctx.stroke();

  // Letter Z
  ctx.fillStyle = '#0066CC';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Z', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// Directorio de salida
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar iconos
const sizes = [192, 512];
sizes.forEach(size => {
  try {
    const buffer = createIcon(size);
    const iconPath = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(iconPath, buffer);
    console.log(`✓ Created icon-${size}.png`);
  } catch (error) {
    console.error(`✗ Error creating icon-${size}.png:`, error.message);
  }
});

console.log('\n✓ PWA icons generated successfully!');
