# Workflow: Crear Nueva Funcionalidad (CMS) (`/create-feature`)

## Pasos del Workflow

### 1. Migraciones de Base de Datos y APIs Backend
- Modificar el esquema de SQLite en `src/db/metadata.ts`.
- Añadir las nuevas columnas para soportar ambos idiomas (ES/EN) si aplica a textos literales.
- Exponer el dato creando / modificando el respectivo Endpoint Express. Validarlo con esquemas Zod.

### 2. Actualización de Interface Bilingüe
- Replicar la estructura devuelta del servidor como `Types/Interfaces TypeScript` exactos dentro de React.
- Mapear el front-end a través de componentes consistentes en `admin-ui/src/components/ui/`.
- Actualizar `react-i18next` con los "Labels" o campos dentro de `admin-ui/src/i18n.ts`.

### 3. Verificar la Consistencia Final de Exportación JSON
- Si el feature es renderizable para el producto final (el portafolio estático externo), debes agregarlo dentro de `src/generator/buildJson.ts` en el Bridge. Y que este no rompa la estructura del esquema pre-acordado.

### 4. Review
- Ejecutar el workflow `/code-review`.
