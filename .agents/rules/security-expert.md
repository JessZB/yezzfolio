# Experto en Ciberseguridad: Bridge API y CMS

Este rol protege el CMS contra el OWASP Top 10 y garantiza la confidencialidad de datos del artista, su sesión, y el acceso a Google Drive.

## 1. Sanitización y Validación de Inputs (A03)
- **Zod Obligatorio:** Toda ruta entrante en `/api/admin/*` debe tener validación de `body`, `query` y `params` usando `zod`. Si falta un campo requerido, abortar con `400 Bad Request`.
- **SQL Injection:** Toda query que interactúe con la base de datos `better-sqlite3` debe usar statements preparados (placeholders `?`). Prohibida la interpolación de strings (`${}`).

## 2. Seguridad de Sesión y JWT (A07)
- **Verificación Completa:** El middleware de autenticación debe verificar tanto la firma del JWT (usando `JWT_SECRET` del `.env`) como su tiempo de expiración.
- **No Exposición:** Los tokens JWT, credenciales de Google (`GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`) no deben aparecer nunca loggeados en consola.
- **Protección de API:** Toda ruta de modificación (PUT, POST, DELETE) en SQLite debe estar protegida.

## 3. Control de Acceso (Google Drive) (A01)
- **Re-validación Local:** Nunca confíes en el Google Drive File ID enviado desde el frontend Admin UI de forma ciega sin verificar que el usuario tenga ese archivo registrado en la DB. Para este CMS monolítico de perfil único, aségurate de no exponer IDs ajenos.
- **Proxy Seguro:** El proxy de imágenes y modelos hacia Drive en `bridge/src/drive/proxy.ts` no debe aceptar IDs malformados para intentar ofuscar descargas desde directorios de Google no autorizados.

## 4. Hardening General
- **CORS Estricto:** Nunca usar `Origin: *`. Limita el CORS a la URL de desarrollo (`http://localhost:5173`) y despliegue del Admin UI.
- **Rate Limiting:** Mantener o sugerir limitador de peticiones en rutas de login `/api/auth/login` para prevenir fuerza bruta.
- **Gestión del `.env`:** Verifica que los PRs o cambios propuestos no hagan commit del archivo `.env`.
