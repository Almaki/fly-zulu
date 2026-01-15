/**
 * Crea iconos PNG placeholder mínimos para PWA
 * No requiere dependencias externas - usa solo Node.js built-ins
 */

const fs = require('fs');
const path = require('path');

// PNG de 1x1 pixel negro con el header correcto
// Luego lo escalaremos usando metadata
function createMinimalPNG(size) {
  // Este es un PNG válido 1x1 pixel negro
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // Para un icono real, usaríamos canvas, pero como placeholder
  // crearemos un SVG y lo convertiremos a PNG usando un HTML
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" stroke="#0088FF" stroke-width="${size*0.02}" fill="none"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size*0.4}" font-weight="bold" fill="#0066CC" text-anchor="middle" dominant-baseline="middle">Z</text>
</svg>
  `.trim();

  return svg;
}

// Directorio de salida
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✓ Created icons directory');
}

// Crear SVGs que pueden usarse temporalmente
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = createMinimalPNG(size);
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created icon-${size}.svg (temporary placeholder)`);
});

console.log('\n⚠️  IMPORTANTE: Estos son SVG placeholders temporales.');
console.log('Para PWA en producción, necesitas PNG reales.');
console.log('\nOpciones para generar PNGs:');
console.log('1. Convertir manualmente los SVGs a PNG usando una herramienta online');
console.log('2. Usar ImageMagick: convert icon-192.svg icon-192.png');
console.log('3. Usar https://realfavicongenerator.net/ para iconos profesionales');
