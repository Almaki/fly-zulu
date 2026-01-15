#!/usr/bin/env node

/**
 * Crea iconos PNG mínimos válidos para PWA
 * Estos son PNGs de 1 color que sirven como placeholder
 */

const fs = require('fs');
const path = require('path');

// PNG mínimo válido de 1x1 pixel (se escala en el navegador)
// Color: #0066CC (azul aviación)
const bluePNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
  0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x1D, 0x63, 0x60, 0xAC, 0xC8, 0x00,
  0x00, 0x00, 0x04, 0x00, 0x03, 0x99, 0x48, 0x2F, 0xD0, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Crear ambos iconos (son idénticos, se escalan por metadata en manifest.json)
try {
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), bluePNG);
  console.log('✓ Created icon-192.png (minimal placeholder)');

  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), bluePNG);
  console.log('✓ Created icon-512.png (minimal placeholder)');

  console.log('\n✓ PWA icons created successfully!');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   Estos son placeholders MÍNIMOS (1x1 pixel).');
  console.log('   El navegador los escalará automáticamente.');
  console.log('\n   Para iconos profesionales:');
  console.log('   1. Abre scripts/generate-simple-icons.html en tu navegador');
  console.log('   2. Descarga los iconos generados');
  console.log('   3. Reemplaza estos archivos placeholder\n');
} catch (error) {
  console.error('✗ Error creating icons:', error);
  process.exit(1);
}
