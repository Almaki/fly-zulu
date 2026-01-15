#!/usr/bin/env python3
"""
Genera iconos PNG mínimos para PWA sin dependencias externas
Crea archivos PNG válidos de 1x1 pixel en azul aviación
"""

import os
import base64

# PNG de 1x1 pixel en azul aviación (#0066CC)
# Este es un archivo PNG válido completo
PNG_BLUE_BASE64 = """
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
""".strip()

def create_icons():
    # Directorio de iconos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    icons_dir = os.path.join(project_dir, 'public', 'icons')

    # Crear directorio si no existe
    os.makedirs(icons_dir, exist_ok=True)

    # Decodificar base64 a bytes
    png_data = base64.b64decode(PNG_BLUE_BASE64)

    # Crear ambos iconos
    sizes = [192, 512]
    for size in sizes:
        icon_path = os.path.join(icons_dir, f'icon-{size}.png')
        with open(icon_path, 'wb') as f:
            f.write(png_data)
        print(f'✓ Created icon-{size}.png')

    print('\n✓ PWA icons created successfully!')
    print('\n⚠️  IMPORTANTE:')
    print('   Estos son placeholders MÍNIMOS (1x1 pixel).')
    print('   Para iconos profesionales:')
    print('   1. Abre scripts/generate-simple-icons.html en tu navegador')
    print('   2. Descarga los iconos generados')
    print('   3. Reemplaza estos archivos placeholder')

if __name__ == '__main__':
    try:
        create_icons()
    except Exception as e:
        print(f'✗ Error: {e}')
        exit(1)
