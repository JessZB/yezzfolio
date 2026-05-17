import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      "nav": {
        "dashboard": "Panel de Control",
        "logout": "Cerrar Sesión",
        "back": "Volver",
        "profile": "Perfil"
      },
      "common": {
        "save": "Guardar Cambios",
        "publish": "Publicar",
        "delete": "Eliminar",
        "confirm_delete": "¿Seguro que quieres eliminar \"{{name}}\"? Esto no se puede deshacer.",
        "cancel": "Cancelar",
        "edit": "Editar",
        "actions": "Acciones",
        "loading": "Cargando..."
      },
      "project": {
        "new": "Nuevo Proyecto",
        "edit_title": "Editar Proyecto",
        "title": "Título",
        "category": "Categoría",
        "thumbnail": "Miniatura (Drive)",
        "role": "Rol / Cargo",
        "desc": "Descripción",
        "empty": "No hay proyectos aún. ¡Crea uno!",
        "empty_cta": "Haz clic en + para comenzar.",
        "base_info": "Información Base",
        "media": "Multimedia",
        "thumbnail_hint": "Google Drive Photo (Enlace o ID)",
        "save_btn": "Guardar Proyecto",
        "cats": {
          "web": "Diseño Web",
          "3d": "Modelado 3D",
          "arch": "Arquitectura",
          "game": "Gaming"
        }
      },
      "editor": {
        "sections": "Secciones",
        "add_gallery": "Añadir Galería",
        "add_3d": "Añadir Modelo 3D",
        "empty_state": "Comienza a armar tu proyecto",
        "empty_desc": "Agrega galerías de imágenes o modelos 3D desde la barra lateral.",
        "section_settings": "Ajustes de Sección",
        "item_details": "Detalles del Item",
        "lang_toggle": "Idioma del contenido",
        "drive_link": "Enlace o ID de Drive",
        "drive_error": "Archivo no accesible o inexistente",
        "drive_checking": "Validando acceso...",
        "drive_placeholder": "ID o enlace al archivo .gltf",
        "new_section_title": "Nueva Sección",
        "edit_desc": "Modifica los metadatos de tu trabajo.",
        "new_desc": "Configura los metadatos y localización del trabajo.",
        "langs": {
          "es": "Español",
          "en": "Inglés"
        }
      },
      "notifications": {
        "fetch_error": "Error al cargar los datos",
        "save_success": "¡Cambios guardados!",
        "save_error": "Error al guardar los cambios",
        "delete_success": "Eliminado con éxito",
        "delete_error": "Error al eliminar",
        "publish_success": "¡Portafolio publicado con éxito!",
        "publish_error": "Fallo al publicar.",
        "reorder_error": "Error al guardar el orden",
        "lang_updated": "Idioma del sistema actualizado",
        "item_added": "Item añadido correctamente",
        "section_created": "Sección creada con éxito"
      },
      "login": {
        "subtitle": "Gestión de Portafolio CMS",
        "sign_in": "Entrar con Google",
        "errors": {
          "access_denied": "Acceso denegado. Debes aceptar los permisos para continuar.",
          "missing_refresh_token": "Error de permisos. Intenta desvincular la app en tu cuenta de Google y vuelve a entrar.",
          "auth_failed": "Error de autenticación. Intenta de nuevo.",
          "default": "Ha ocurrido un problema al iniciar sesión."
        }
      },
      "profile": {
        "title": "Perfil del Artista",
        "subtitle": "Configura tu identidad digital y apariencia",
        "tabs": {
          "identity": "Identidad",
          "appearance": "Apariencia",
          "skills": "Habilidades",
          "software": "Software",
          "social": "Social",
          "contact": "Contacto & SEO"
        },
        "identity": {
          "avatar": "Avatar",
          "level": "Nivel",
          "class": "Clase",
          "status": "Estatus",
          "bio": "Biografía",
          "avatar_hint": "Pega el enlace de Google Drive para tu imagen de perfil"
        },
        "appearance": {
          "title": "Colores del Tema",
          "preview": "Previsualización del Tema",
          "hint": "Personaliza la paleta de colores para ajustar la atmósfera JRPG"
        },
        "skills": {
          "title": "Habilidades y Parámetros",
          "add": "Añadir Habilidad",
          "name": "Nombre",
          "value": "Valor (0-100)",
          "style": "Estilo Visual",
          "styles": {
            "default": "Por defecto (Morado)",
            "special": "Especial (Dorado)",
            "ui": "UI/UX (Lila)"
          }
        },
        "software": {
          "title": "Herramientas de Trabajo",
          "add": "Añadir Software",
          "icon": "Icono (ID Drive)",
          "color": "Color de Fondo"
        },
        "social": {
          "title": "Redes de Comunicación",
          "add": "Añadir Red",
          "link": "Enlace",
          "active": "Activa"
        },
        "contact": {
          "email": "Email de contacto",
          "comms_title": "Título de Sección",
          "comms_desc": "Descripción de Sección",
          "seo_title": "Título del Sitio (Browser)",
          "favicon": "Favicon (ID Drive)"
        },
        "editor_lang": {
          "label": "Modo de Edición",
          "es": "Spanish (ES)",
          "en": "English (EN)",
          "dual": "Dual View"
        },
        "empty_state": "Aún no hay elementos. Haz clic en 'Añadir' para comenzar."
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "logout": "Logout",
        "back": "Back",
        "profile": "Profile"
      },
      "common": {
        "save": "Save Changes",
        "publish": "Publish",
        "delete": "Delete",
        "confirm_delete": "Are you sure you want to delete \"{{name}}\"? This action cannot be undone.",
        "cancel": "Cancel",
        "edit": "Edit",
        "actions": "Actions",
        "loading": "Loading...",
        "confirm": "Confirm",
        "saved": "Saved successfully!"
      },
      "project": {
        "new": "New Project",
        "edit_title": "Edit Project",
        "title": "Title",
        "category": "Category",
        "thumbnail": "Thumbnail (Drive)",
        "role": "Role / Position",
        "desc": "Description",
        "empty": "No projects yet. Create one!",
        "empty_cta": "Click + to begin.",
        "base_info": "Base Information",
        "media": "Media",
        "thumbnail_hint": "Google Drive Photo (Link or ID)",
        "save_btn": "Save Project",
        "cats": {
          "web": "Web Design",
          "3d": "3D Modeling",
          "arch": "Architecture",
          "game": "Gaming"
        }
      },
      "editor": {
        "publish": "Publish Site",
        "sections": "Sections",
        "add_gallery": "Add Gallery",
        "add_3d": "Add 3D Model",
        "empty_state": "Start building your project",
        "empty_desc": "Add image galleries or 3D models from the sidebar.",
        "section_settings": "Section Settings",
        "item_details": "Item Details",
        "lang_toggle": "Content Language",
        "drive_link": "Drive Link or ID",
        "drive_error": "File not accessible or missing",
        "drive_checking": "Checking access...",
        "drive_placeholder": "ID or link to .gltf file",
        "new_section_title": "New Section",
        "edit_desc": "Modify your work's metadata.",
        "new_desc": "Set metadata and work localization.",
        "langs": {
          "es": "Spanish",
          "en": "English"
        }
      },
      "notifications": {
        "fetch_error": "Failed to fetch data",
        "save_success": "Changes saved!",
        "save_error": "Error saving changes",
        "delete_success": "Deleted successfully",
        "delete_error": "Error deleting",
        "publish_success": "Portfolio published successfully!",
        "publish_error": "Publish failed.",
        "reorder_error": "Error saving order",
        "lang_updated": "System language updated",
        "item_added": "Item added successfully",
        "section_created": "Section created successfully"
      },
      "login": {
        "subtitle": "Portfolio Administration CMS",
        "sign_in": "Sign in with Google",
        "errors": {
          "access_denied": "Access denied. You must accept permissions to continue.",
          "missing_refresh_token": "Permission error. Try revoking the app in your Google account and sign in again.",
          "auth_failed": "Authentication failed. Please try again.",
          "default": "A problem occurred while signing in."
        }
      },
      "profile": {
        "title": "Artist Profile",
        "subtitle": "Set your digital identity and appearance",
        "tabs": {
          "identity": "Identity",
          "appearance": "Appearance",
          "skills": "Skills",
          "software": "Software",
          "social": "Social",
          "contact": "Contact & SEO"
        },
        "identity": {
          "avatar": "Avatar",
          "level": "Level",
          "class": "Class",
          "status": "Status",
          "bio": "Biography",
          "avatar_hint": "Paste the Google Drive link for your profile picture"
        },
        "appearance": {
          "title": "Theme Colors",
          "preview": "Theme Preview",
          "hint": "Customize the color palette to set the JRPG atmosphere"
        },
        "skills": {
          "title": "Skills & Parameters",
          "add": "Add Skill",
          "name": "Name",
          "value": "Value (0-100)",
          "style": "Visual Style",
          "styles": {
            "default": "Default (Purple)",
            "special": "Special (Gold)",
            "ui": "UI/UX (Lilac)"
          }
        },
        "software": {
          "title": "Working Tools",
          "add": "Add Software",
          "icon": "Icon (Drive ID)",
          "color": "Background Color"
        },
        "social": {
          "title": "Communication Socials",
          "add": "Add Social",
          "link": "Link",
          "active": "Active"
        },
        "contact": {
          "email": "Contact Email",
          "comms_title": "Section Title",
          "comms_desc": "Section Description",
          "seo_title": "Site Title (Browser)",
          "favicon": "Favicon (Drive ID)"
        },
        "editor_lang": {
          "label": "Editor Mode",
          "es": "Spanish (ES)",
          "en": "English (EN)",
          "dual": "Dual View"
        },
        "empty_state": "No items yet. Click 'Add' to begin."
      }
    }
  }
}


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
