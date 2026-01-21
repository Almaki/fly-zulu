# Supabase Email Templates - FLY-ZULU

Ve a **Supabase Dashboard > Authentication > Email Templates** y reemplaza cada template con el HTML correspondiente.

---

## 1. Confirm Signup (Confirmar Registro)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta - FLY-ZULU</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">

          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066CC 0%, #0088FF 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✈️ FLY-ZULU
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                App colaborativa para tripulaciones
              </p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #fafafa; font-size: 22px; font-weight: 600;">
                ¡Bienvenido a bordo! 🎉
              </h2>
              <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 15px; line-height: 1.6;">
                Gracias por registrarte en FLY-ZULU. Para activar tu cuenta y comenzar a disfrutar de todos los beneficios, confirma tu correo electrónico.
              </p>

              <!-- Botón -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
                      Confirmar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                      ¿El botón no funciona? Copia y pega este enlace:
                    </p>
                    <p style="margin: 0; color: #0088FF; font-size: 12px; word-break: break-all;">
                      {{ .ConfirmationURL }}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 20px 24px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                Este enlace expira en 24 horas.<br>
                Si no solicitaste esta cuenta, ignora este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** ✈️ Confirma tu cuenta en FLY-ZULU

---

## 2. Reset Password (Restablecer Contraseña)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña - FLY-ZULU</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066CC 0%, #0088FF 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✈️ FLY-ZULU
              </h1>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 32px 24px;">
              <!-- Icono -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background-color: #27272a; border-radius: 50%; font-size: 28px;">
                  🔐
                </span>
              </div>

              <h2 style="margin: 0 0 16px; color: #fafafa; font-size: 22px; font-weight: 600; text-align: center;">
                Restablecer contraseña
              </h2>
              <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 15px; line-height: 1.6; text-align: center;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste tú, puedes ignorar este correo.
              </p>

              <!-- Botón -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                      Crear nueva contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info de seguridad -->
              <div style="background-color: #1c1c1e; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                  <strong style="color: #fafafa;">Consejo de seguridad:</strong><br>
                  Nunca compartas este enlace con nadie. El equipo de FLY-ZULU nunca te pedirá tu contraseña.
                </p>
              </div>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                      ¿El botón no funciona? Copia y pega este enlace:
                    </p>
                    <p style="margin: 0; color: #0088FF; font-size: 12px; word-break: break-all;">
                      {{ .ConfirmationURL }}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 20px 24px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                Este enlace expira en 1 hora.<br>
                Si no solicitaste restablecer tu contraseña, ignora este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** 🔐 Restablecer contraseña - FLY-ZULU

---

## 3. Magic Link (Enlace Mágico)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inicia sesión - FLY-ZULU</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066CC 0%, #0088FF 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✈️ FLY-ZULU
              </h1>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 32px 24px;">
              <!-- Icono -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background-color: #27272a; border-radius: 50%; font-size: 28px;">
                  ✨
                </span>
              </div>

              <h2 style="margin: 0 0 16px; color: #fafafa; font-size: 22px; font-weight: 600; text-align: center;">
                Tu enlace mágico está aquí
              </h2>
              <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 15px; line-height: 1.6; text-align: center;">
                Haz clic en el botón para iniciar sesión en FLY-ZULU. Sin contraseña, sin complicaciones.
              </p>

              <!-- Botón -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                      ✨ Iniciar sesión
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                      ¿El botón no funciona? Copia y pega este enlace:
                    </p>
                    <p style="margin: 0; color: #0088FF; font-size: 12px; word-break: break-all;">
                      {{ .ConfirmationURL }}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 20px 24px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                Este enlace expira en 1 hora y solo puede usarse una vez.<br>
                Si no solicitaste este enlace, ignora este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** ✨ Tu enlace mágico para FLY-ZULU

---

## 4. Invite User (Invitar Usuario)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación - FLY-ZULU</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">

          <!-- Header con gradiente especial -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066CC 0%, #0088FF 50%, #22c55e 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✈️ FLY-ZULU
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                App colaborativa para tripulaciones
              </p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 32px 24px;">
              <!-- Icono -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background-color: #27272a; border-radius: 50%; font-size: 28px;">
                  🎫
                </span>
              </div>

              <h2 style="margin: 0 0 16px; color: #fafafa; font-size: 22px; font-weight: 600; text-align: center;">
                ¡Estás invitado!
              </h2>
              <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 15px; line-height: 1.6; text-align: center;">
                Has sido invitado a unirte a FLY-ZULU, la app colaborativa para tripulaciones de aviación. Acepta la invitación para crear tu cuenta.
              </p>

              <!-- Beneficios -->
              <div style="background-color: #1c1c1e; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; color: #fafafa; font-size: 14px; font-weight: 600;">
                  Con FLY-ZULU podrás:
                </p>
                <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.8;">
                  ✓ Calcular tiempos de vuelo y descanso<br>
                  ✓ Acceder al directorio de servicios<br>
                  ✓ Ver información de vuelos en tiempo real<br>
                  ✓ Conectar con otros tripulantes
                </p>
              </div>

              <!-- Botón -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
                      Aceptar invitación
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                      ¿El botón no funciona? Copia y pega este enlace:
                    </p>
                    <p style="margin: 0; color: #0088FF; font-size: 12px; word-break: break-all;">
                      {{ .ConfirmationURL }}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 20px 24px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                Este enlace expira en 24 horas.<br>
                Si no esperabas esta invitación, puedes ignorar este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** 🎫 Has sido invitado a FLY-ZULU

---

## 5. Change Email Address (Cambiar Email)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar nuevo email - FLY-ZULU</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066CC 0%, #0088FF 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✈️ FLY-ZULU
              </h1>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 32px 24px;">
              <!-- Icono -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background-color: #27272a; border-radius: 50%; font-size: 28px;">
                  📧
                </span>
              </div>

              <h2 style="margin: 0 0 16px; color: #fafafa; font-size: 22px; font-weight: 600; text-align: center;">
                Confirmar nuevo email
              </h2>
              <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 15px; line-height: 1.6; text-align: center;">
                Recibimos una solicitud para cambiar tu email a esta dirección. Haz clic en el botón para confirmar el cambio.
              </p>

              <!-- Botón -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0066CC 0%, #0088FF 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 102, 204, 0.4);">
                      Confirmar email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                      ¿El botón no funciona? Copia y pega este enlace:
                    </p>
                    <p style="margin: 0; color: #0088FF; font-size: 12px; word-break: break-all;">
                      {{ .ConfirmationURL }}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 20px 24px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                Este enlace expira en 24 horas.<br>
                Si no solicitaste cambiar tu email, contacta soporte inmediatamente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** 📧 Confirma tu nuevo email - FLY-ZULU

---

## Instrucciones de Configuración

1. Ve a **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Para cada tipo de email:
   - Pega el HTML correspondiente en el campo **Body**
   - Actualiza el **Subject** con el texto indicado
3. Guarda los cambios

### Variables disponibles:
- `{{ .ConfirmationURL }}` - URL de confirmación
- `{{ .Email }}` - Email del usuario
- `{{ .Token }}` - Token de verificación
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL de tu sitio
