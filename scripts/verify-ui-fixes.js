#!/usr/bin/env node

/**
 * Verifica que todos los arreglos de UI estén implementados correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando arreglos de UI...\n');

let allGood = true;

// 1. Verificar globals.css
const globalsPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
const globalsContent = fs.readFileSync(globalsPath, 'utf-8');

if (globalsContent.includes('--primary: #0066CC')) {
  console.log('✓ Color primario actualizado a azul aviación (#0066CC)');
} else {
  console.log('✗ Color primario NO actualizado');
  allGood = false;
}

// 2. Verificar button.tsx
const buttonPath = path.join(__dirname, '..', 'src', 'shared', 'components', 'ui', 'button.tsx');
const buttonContent = fs.readFileSync(buttonPath, 'utf-8');

if (buttonContent.includes('focus-visible:ring-2') && buttonContent.includes('active:scale-95')) {
  console.log('✓ Botones mejorados con mejor contraste y animaciones');
} else {
  console.log('✗ Botones NO mejorados completamente');
  allGood = false;
}

// 3. Verificar input.tsx
const inputPath = path.join(__dirname, '..', 'src', 'shared', 'components', 'ui', 'input.tsx');
const inputContent = fs.readFileSync(inputPath, 'utf-8');

if (inputContent.includes('bg-zinc-900/50') && inputContent.includes('border-2')) {
  console.log('✓ Inputs mejorados con fondo visible y mejor borde');
} else {
  console.log('✗ Inputs NO mejorados completamente');
  allGood = false;
}

// 4. Verificar select.tsx
const selectPath = path.join(__dirname, '..', 'src', 'shared', 'components', 'ui', 'select.tsx');
const selectContent = fs.readFileSync(selectPath, 'utf-8');

if (selectContent.includes('bg-zinc-900/50') && selectContent.includes('focus:ring-primary')) {
  console.log('✓ Select components mejorados con estilos consistentes');
} else {
  console.log('✗ Select components NO mejorados completamente');
  allGood = false;
}

// 5. Verificar login page
const loginPath = path.join(__dirname, '..', 'src', 'app', '(auth)', 'login', 'page.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf-8');

if (loginContent.includes('text-primary')) {
  console.log('✓ Página de login actualizada con nuevos colores');
} else {
  console.log('✗ Página de login NO actualizada');
  allGood = false;
}

// 6. Verificar register page
const registerPath = path.join(__dirname, '..', 'src', 'app', '(auth)', 'register', 'page.tsx');
const registerContent = fs.readFileSync(registerPath, 'utf-8');

if (registerContent.includes('text-primary')) {
  console.log('✓ Página de registro actualizada con nuevos colores');
} else {
  console.log('✗ Página de registro NO actualizada');
  allGood = false;
}

// 7. Verificar manifest.json
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✓ manifest.json existe');
} else {
  console.log('✗ manifest.json NO encontrado');
  allGood = false;
}

// 8. Verificar directorio de iconos
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (fs.existsSync(iconsDir)) {
  console.log('✓ Directorio de iconos existe');

  const icon192 = path.join(iconsDir, 'icon-192.png');
  const icon512 = path.join(iconsDir, 'icon-512.png');

  if (fs.existsSync(icon192)) {
    console.log('✓ icon-192.png existe');
  } else {
    console.log('⚠️  icon-192.png NO existe - ejecutar: npm run generate:icons');
  }

  if (fs.existsSync(icon512)) {
    console.log('✓ icon-512.png existe');
  } else {
    console.log('⚠️  icon-512.png NO existe - ejecutar: npm run generate:icons');
  }
} else {
  console.log('✗ Directorio de iconos NO existe');
  allGood = false;
}

// 9. Verificar scripts de generación de iconos
const scriptsToCheck = [
  'create-icons.ps1',
  'generate-simple-icons.html',
  'generate_pwa_icons.py',
  'create-minimal-pngs.js'
];

scriptsToCheck.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`✓ Script ${script} disponible`);
  } else {
    console.log(`✗ Script ${script} NO encontrado`);
    allGood = false;
  }
});

// Resumen final
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ TODAS las verificaciones pasaron!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Generar iconos PWA: npm run generate:icons');
  console.log('      O abrir: scripts/generate-simple-icons.html');
  console.log('   2. Iniciar servidor: npm run dev');
  console.log('   3. Verificar en navegador que botones sean visibles');
} else {
  console.log('❌ Algunas verificaciones fallaron');
  console.log('\n📝 Por favor revisar los archivos marcados con ✗');
}
console.log('='.repeat(50) + '\n');
