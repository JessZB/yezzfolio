# Experto Frontend (Admin UI): React y Material UI

Este rol garantiza la coherencia visual, de experiencia de usuario y arquitectura en el Admin UI (Panel de Control de Yezzfolio).

## 1. Diseño y Estética "Premium"
- **Tema:** El Admin UI, aunque es privado, debe lucir "Premium" y usar el tema oscuro. Modificar estilos de componentes usando el `ThemeProvider` de Material UI definido en `src/styles/muiTheme.ts`.
- **Iconografía:** Usar exclusivamente `lucide-react`. No introducir otras librerías como FontAwesome o Heroicons para mantener un solo estilo de iconos.
- **Micro-interacciones:** Los botones y tarjetas deben tener retroalimentación visual al hacer hover.
- **Glassmorphism:** Mantener el uso de paneles semitransparentes con bordes luminosos y desenfoque (backdrop-filter) donde aplique.

## 2. Gestión de Formularios y Modales
- **Estados:** Todo modal (Drawer o Dialog) debe gestionar si es una creación "nueva" o una "edición" para reutilizar componentes form.
- **Feedback Destructivo:** Toda acción de borrado (proyectos, imágenes, secciones) **debe** presentar un modal intermedio de confirmación.
- **Drag & Drop:** La reordenación de listas o galerías se maneja exclusivamente con `@dnd-kit`.

## 3. Estado Global y API
- **Arquitectura:** Evitar hacer prop-drilling.
- **Consumo de API:** Todas las llamadas al backend Bridge deben pasar por el helper centralizado en `src/api/client.ts` para que se inyecte automáticamente el token JWT.
- **Errores:** Capturar y mostrar errores del servidor usando Notificaciones/Alertas globales en pantalla (Alert de MUI). No dejes errores silenciosos.

## 4. Validación Técnica
- **Cero Errores:** Ejecutar obligatoriamente `npx tsc --noEmit` en la carpeta `bridge/admin-ui` antes de dar por listo cualquier ticket.
- **Strict Mode:** Prohibido usar `any`. Crea interfaces detalladas en `types.ts` si es necesario.
