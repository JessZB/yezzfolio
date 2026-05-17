# Próximos Pasos: Evolución de Yezzfolio SaaS

Tras completar la migración a la arquitectura de 3 capas, el sistema es técnicamente robusto. Estos son los pasos recomendados para consolidar la aplicación y prepararla para producción.

---

## 1. Migración de Datos Existentes (Legacy) 📦
Si tienes datos en el archivo `portfolio.db` (SQLite) del bridge anterior, deben ser trasladados a PostgreSQL.
- **Acción:** Crear un script de migración (`scripts/migrate-sqlite-to-pg.ts`) que lea las tablas de SQLite y use Prisma para insertarlos en PostgreSQL.
- **Importante:** Recuerda encriptar los `refresh_token` durante la migración usando la nueva utilidad `src/core/utils/encrypt.ts`.

## 2. Integración del Admin UI 🎨
El panel de administración actual (`admin-ui`) debe ser actualizado para comunicarse con el nuevo puerto y estructura.
- **Endpoint Base:** Cambiar de `:3000` (viejo bridge) a `:3001` (nuevo SaaS).
- **Rutas:** Actualizar las llamadas a la API para que coincidan con la nueva estructura modular (ej. `/api/admin/profile` → `/api/profile/full`).
- **Autenticación:** Asegurarse de enviar el JWT en el header `Authorization: Bearer <token>`.

## 3. Configuración de Google Drive en Producción 🔑
El modelo de `refresh_token` requiere que tu App de Google esté bien configurada.
- **OAuth Consent Screen:** En Google Cloud Console, asegúrate de que la app no esté en "Testing" (o los tokens expirarán cada 7 días).
- **Scopes:** Verificar que el scope `drive.readonly` esté aprobado.
- **Redirección:** Asegúrate de que `GOOGLE_REDIRECT_URI` en el `.env` apunte a la URL real de producción (ej. `https://api.yezzfolio.com/api/auth/drive/callback`).

## 4. Despliegue y Webhooks (Opción B) 🚀
Para que el botón "Publicar" funcione en producción:
- **Deploy Hooks:** Generar un Deploy Hook en Vercel o Netlify para el proyecto Astro.
- **Variable de Entorno:** Configurar `ASTRO_WEBHOOK_URL` en el backend con esa URL.
- **Payload:** El frontend Astro debe estar preparado para recibir y procesar el JSON bilingüe enviado por el backend.

## 5. Mejoras de Seguridad 🛡️
- **Rotación de Secretos:** La `JWT_SECRET` se usa también para encriptar los tokens de Drive. Si cambias esta clave, los tokens guardados dejarán de funcionar y los usuarios deberán re-conectar su Drive.
- **Sanitización:** Aunque ya está integrada, podrías permitir ciertos tags (como `<b>` o `<i>`) en las biografías ajustando la configuración en `src/core/utils/sanitize.ts`.

## 6. Visión SaaS (Escalabilidad) 📈
- **Aislamiento de Archivos:** Actualmente el proxy es público. Podrías implementar una lógica donde solo el dueño pueda ver ciertos borradores antes de publicar.
- **Gestión de Planes:** Implementar lógica para limitar el número de proyectos o assets por artista según su suscripción.
- **Panel de SuperAdmin:** Utilizar las rutas en `src/modules/users/` para que tú, como administrador, puedas invitar a nuevos artistas o suspender cuentas.

---

> [!TIP]
> Puedes empezar por la **Integración del Admin UI** para verificar visualmente que todos los nuevos endpoints responden correctamente a tus datos actuales.
