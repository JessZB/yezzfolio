# Workflow: Publishing Data (`/publish-check`)

Reglas de check para exportar y "publicar" json al SSG de lado Bridge (Express).

## 1. Verificación de Rutas
- [ ] Confirma que la base de datos contenga un perfil primario y secciones configuradas si deseas que se mande vía `/api/admin/publish`.
- [ ] Comprueba que, en entornos "Production", en caso de apuntar al script que inyecta/reemplaza jsons en `../littlepigman-portafolio/src/data`, la ruta exista y no genere un error EACCESS.

## 2. Contrato de Esquemas
- ¿Los campos devueltos garantizan no contener "Undefined" previniendo crashes Astro SSG?.
- Verifica en Admin UI los fallbacks, y cómo las URLs se generan antes del Request post `publish`.

```
🚀 CMS EXPORT PIPELINE - READY
Decisión: Todo limpio ✅
```
