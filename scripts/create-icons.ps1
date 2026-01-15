# Script PowerShell para crear iconos PWA
# Ejecutar: powershell -ExecutionPolicy Bypass -File scripts\create-icons.ps1

Write-Host "Generando iconos PWA..." -ForegroundColor Cyan

# Directorio de iconos
$iconsDir = Join-Path $PSScriptRoot "..\public\icons"

# Crear directorio si no existe
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "✓ Directorio de iconos creado" -ForegroundColor Green
}

# PNG de 1x1 pixel (placeholder mínimo)
$base64PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Convertir base64 a bytes
$bytes = [Convert]::FromBase64String($base64PNG)

# Crear iconos
$sizes = @(192, 512)
foreach ($size in $sizes) {
    $iconPath = Join-Path $iconsDir "icon-$size.png"
    [IO.File]::WriteAllBytes($iconPath, $bytes)
    Write-Host "✓ Creado icon-$size.png" -ForegroundColor Green
}

Write-Host "`n✓ Iconos PWA creados exitosamente!" -ForegroundColor Green
Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Estos son placeholders MÍNIMOS (1x1 pixel)." -ForegroundColor Yellow
Write-Host "   Para iconos profesionales:" -ForegroundColor Yellow
Write-Host "   1. Abre scripts\generate-simple-icons.html en tu navegador" -ForegroundColor White
Write-Host "   2. Descarga los iconos generados" -ForegroundColor White
Write-Host "   3. Reemplaza estos archivos placeholder" -ForegroundColor White
