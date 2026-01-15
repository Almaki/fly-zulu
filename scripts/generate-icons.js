/**
 * Script para generar iconos PWA
 * Este script crea iconos PNG simples para la PWA
 */

const fs = require('fs');
const path = require('path');

// Función para crear un canvas simple con el icono
function generateIconHTML(size) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Generate Icon ${size}x${size}</title>
</head>
<body>
  <canvas id="canvas" width="${size}" height="${size}"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, ${size}, ${size});

    // Border radius effect (simulate rounded corners)
    const cornerRadius = ${size * 0.2};

    // Main circle
    ctx.beginPath();
    ctx.arc(${size / 2}, ${size / 2}, ${size * 0.35}, 0, 2 * Math.PI);
    ctx.strokeStyle = '#0088FF';
    ctx.lineWidth = ${size * 0.02};
    ctx.stroke();

    // Letter Z
    ctx.fillStyle = '#0066CC';
    ctx.font = 'bold ${size * 0.4}px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Z', ${size / 2}, ${size / 2});

    // Convert to blob and download
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icon-${size}.png';
      a.click();
    });
  </script>
</body>
</html>
  `;
}

// Directorio de salida
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar HTML files para crear manualmente
const sizes = [192, 512];
sizes.forEach(size => {
  const htmlPath = path.join(iconsDir, `generate-${size}.html`);
  fs.writeFileSync(htmlPath, generateIconHTML(size));
  console.log(`✓ Created ${htmlPath}`);
  console.log(`  → Open this file in a browser to generate icon-${size}.png`);
});

console.log('\n📝 Instructions:');
console.log('1. Open each HTML file in your browser');
console.log('2. The icon will download automatically');
console.log('3. Move the downloaded icons to public/icons/');
console.log('4. Delete the HTML files');
