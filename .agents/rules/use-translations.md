# Guía de Internacionalización (i18n) - Admin UI (Yezzfolio)

Esta guía describe cómo implementar traducciones en el panel de control del CMS usando React e `i18next`.

## 1. Textos Globales de Interfaz UI (Admin)
Todos los textos estáticos del panel (barras, menús, etiquetas modales, botones) se manejan a través de `react-i18next`.

- **Ubicación de Diccionarios:** `src/i18n.ts` dentro de `bridge/admin-ui/`.
- **Uso en Componentes React:**
  ```tsx
  import { useTranslation } from 'react-i18next';

  export function Menu() {
    const { t } = useTranslation();
    return <button>{t('admin.save_changes')}</button>;
  }
  ```
- No dejes ningún string literal (`<p>Guardar Cambios</p>`) "hardcodeado" en los layouts de React.

## 2. Formularios de Contenido Bilingüe
Toda la data generada por este CMS (proyectos, descripciones) sirve un portfolio multiidiomas, por lo cual los campos dinámicos deben llenarse obligatoriamente en Español y en Inglés durante la edición.

- **Diseño del Formulario:** Presenta ambos campos de forma simultánea (ej. "Título (ES)", "Título (EN)") para evitar que el artista guarde y olvide rellenar un idioma. Así se elimina el riesgo estructural de los SSG.
- **Payload a BD:** Ambos idiomas deben mandarse en el payload unificado al backend Bridge y guardarse correctamente en SQLite en columnas separadas (ej. `title_es`, `title_en`).
