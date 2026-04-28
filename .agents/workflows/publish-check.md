# Workflow: Publishing Data (`/publish-check`)

Reglas de check para exportar y "publicar" json al SSG de lado Bridge (Express).

## 1. Verificación de Rutas
- [ ] Confirma que la base de datos contenga un perfil primario y secciones configuradas si deseas que se mande vía `/api/admin/publish`.
- [ ] Comprueba que, en entornos "Production", en caso de apuntar al script que inyecta/reemplaza jsons en `../littlepigman-portafolio/src/data`, la ruta exista y no genere un error EACCESS.

## 2. Contrato de Esquemas
- ¿Los campos devueltos garantizan no contener "Undefined" previniendo crashes Astro SSG?.
- Verifica en Admin UI los fallbacks, y cómo las URLs se generan antes del Request post `publish`.

## 3. Versionado del Payload
- [ ] Comprobar que el JSON exportado a través de `buildJson.ts` inyecta un metadato en la cabecera del archivo o en su objeto principal (ej. `"_version": "1.2.0"`). Esto garantiza que el consumidor estático pueda aplicar validaciones según la versión de esquema recibida.

### 4. Versionado y Release
- [ ] Ejecutar el workflow `/release` para determinar el salto de versión (SemVer), actualizar el package.json y generar los tags de Git antes del despliegue.

```
🚀 CMS EXPORT PIPELINE - READY
Decisión: Todo limpio ✅
```
