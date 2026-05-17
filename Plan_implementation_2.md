Plan Maestro de Implementación: Yezzfolio SaaS

Arquitectura: Monolito Modular Centralizado (Multi-tenant)
Base de Datos: PostgreSQL + Prisma ORM
Modelo de Negocio: SaaS / Invite-Only (Whitelist)

1. Estructura de Directorios (El Monolito Modular)

El objetivo es organizar el código por Dominios de Negocio en lugar de tipos de archivo. Esto preparará la aplicación para escalar a miles de usuarios sin perder mantenibilidad.

yezzfolio-bridge/
├── prisma/
│   └── schema.prisma           # Esquema central de PostgreSQL (Modelos)
├── src/
│   ├── config/                 # Variables de entorno (Zod/Dotenv)
│   ├── core/                   # El "pegamento" de la aplicación
│   │   ├── middlewares/        # requireAuth, requireSuperAdmin, errorHandler
│   │   ├── utils/              # logger, responseFormatter
│   │   └── types/              # Tipos globales TS
│   ├── modules/                # 📦 LOS DOMINIOS DE NEGOCIO
│   │   ├── auth/               
│   │   ├── users/              
│   │   ├── projects/           
│   │   ├── drive/              
│   │   └── generator/          
│   ├── app.ts                  # Instancia de Express y registro de rutas
│   └── server.ts               # Arranque del servidor HTTP
└── package.json


1.1. Anatomía Interna de un Módulo (Separación de Responsabilidades)

Para evitar el código espagueti, cada módulo tendrá una arquitectura interna de 3 capas. Aquí es donde se define exactamente la división lógica (tomando users/ como ejemplo):

users.routes.ts (Rutas): Es el punto de entrada HTTP. Su única responsabilidad es definir las URLs (GET /, POST /), aplicar middlewares de seguridad (ej. requireSuperAdmin) y redirigir la petición al Controlador correspondiente.

users.schemas.ts (Validadores / DTOs): Define las validaciones de los datos de entrada usando Zod (ej. asegurar que el email sea un correo válido antes de llegar al controlador).

users.controller.ts (Controladores): Maneja los objetos req y res de Express. Extrae el body, los parámetros y el req.user.id, llama a las funciones del Servicio y responde al cliente con un JSON (ej. res.status(200).json(...)). Regla estricta: Cero lógica de negocio compleja aquí.

users.service.ts (Servicios / Casos de Uso): Aquí vive el CRUD y las Reglas de Negocio. Son clases o funciones puras en TypeScript que interactúan directamente con Prisma (prisma.user.findMany()). No saben nada sobre req o res. Esto hace que tu lógica sea 100% testeable y reutilizable.

Nota sobre Modelos: No hay una carpeta models/ dentro de los módulos porque Prisma centraliza los modelos en prisma/schema.prisma y genera un cliente global (@prisma/client) tipado.

2. Fase 1: Base de Datos y Migración a PostgreSQL

El primer paso es abandonar SQLite y establecer la base de datos robusta. Utilizaremos Prisma ORM por su tipado estricto y facilidad de migración.

2.1. Instalación

npm install @prisma/client
npm install prisma --save-dev
npx prisma init


2.2. Diseño del Esquema (prisma/schema.prisma)

Este esquema soporta el modelo SaaS, la Whitelist (Invite-Only) y los proyectos de cada artista.

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  ARTIST
}

enum Status {
  ACTIVE
  SUSPENDED
  PENDING_INVITE
}

// Tabla de Usuarios (La Whitelist)
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  googleId       String?   @unique // Se llena al hacer el primer login exitoso
  name           String?
  avatar         String?
  role           Role      @default(ARTIST)
  status         Status    @default(PENDING_INVITE)
  
  // Relaciones
  projects       Project[]
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

// Proyectos del Artista
model Project {
  id          String    @id @default(uuid())
  userId      String    // Llave foránea vital para el Multi-tenant
  slug        String
  order       Int       @default(0)
  isPublished Boolean   @default(false)
  
  // JSONB para traducciones { "es": "Título", "en": "Title" }
  title       Json      
  description Json?

  sections    Section[]
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Secciones dentro de un Proyecto
model Section {
  id          String    @id @default(uuid())
  projectId   String
  layoutType  String    // ej: '3d_showcase', 'grid_gallery'
  order       Int       @default(0)
  
  assets      Asset[]
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

// Archivos multimedia (Google Drive)
model Asset {
  id          String    @id @default(uuid())
  sectionId   String
  driveId     String    // El ID de Google Drive
  type        String    // 'image', 'gltf', 'gif'
  order       Int       @default(0)
  
  // Metadatos para Three.js (Cámara, rotación, etc.)
  config3d    Json?     

  section     Section   @relation(fields: [sectionId], references: [id], onDelete: Cascade)
}


3. Fase 2: Implementación del Core (Seguridad)

Antes de programar las rutas, necesitamos los guardianes de nuestra arquitectura Multi-tenant.

3.1. Middleware de Autenticación (src/core/middlewares/auth.middleware.ts)

Crearás dos middlewares principales:

requireAuth: Verifica que el JWT sea válido. Extrae el userId y lo inyecta en la petición (req.user = { id: ..., role: ... }).

requireSuperAdmin: Se ejecuta después de requireAuth. Verifica que req.user.role === 'SUPER_ADMIN'.

Regla de Oro Multi-tenant: Todo controlador que gestione datos de artistas (ej. crear proyecto) debe extraer el userId del token (req.user.id), NUNCA confiar en un ID enviado en el body por el cliente.

4. Fase 3: El Flujo de Autenticación y Whitelist (Módulo Auth & Users)

4.1. Módulo Auth (src/modules/auth/)

auth.service.ts: Se encarga de validar el token de Google y generar el JWT de Yezzfolio.

Flujo: 1. El controlador recibe el token de Google del frontend y se lo pasa al servicio.
2. El servicio extrae el email y busca en la BD: prisma.user.findUnique({ where: { email } }).
3. Si no existe: Lanza una excepción "No estás en la lista de invitados" (el controlador la atrapa y devuelve 403).
4. Si existe: Actualiza el estado a ACTIVE, genera el JWT interno y lo retorna.

4.2. Módulo Users (Panel Super Admin) (src/modules/users/)

users.routes.ts: router.post('/invite', requireAuth, requireSuperAdmin, usersController.inviteUser)

users.service.ts: Inserta un nuevo correo en la base de datos con estado PENDING_INVITE y retorna las estadísticas globales del sistema.

5. Fase 4: Dominio de Proyectos y Google Drive

5.1. Módulo Projects (src/modules/projects/)

projects.service.ts: Contiene toda la lógica CRUD compleja (Ej. createProject, updateProjectOrder, addSectionToProject).

Seguridad Crítica (En el Servicio): Al buscar, editar o eliminar un proyecto, el servicio siempre debe recibir el userId como parámetro para añadirlo a la cláusula where:

// En projects.service.ts
async function updateProject(projectId: string, userId: string, data: any) {
  return await prisma.project.updateMany({
    where: { 
      id: projectId,
      userId: userId // <-- Esto previene que un artista edite el proyecto de otro
    },
    data
  });
}


5.2. Módulo Drive (src/modules/drive/)

drive.controller.ts: * uploadFile: Pasa el stream del archivo al servicio.

proxyFile: Maneja la ruta GET /proxy/:driveId.

drive.service.ts: Se comunica de manera aislada con la API de Google (Google Drive v3). Maneja el stream de subida, la asignación de permisos públicos, y descarga el archivo para el proxy, añadiendo las cabeceras CORS para Three.js.

6. Fase 5: El Generador SSG (Módulo Generator)

6.1. La exportación de JSONs (src/modules/generator/)

generator.routes.ts: POST /build (Protegido por requireAuth).

generator.service.ts:

Consulta en PostgreSQL todos los proyectos del req.user.id, incluyendo Sections y Assets (include en Prisma).

Transforma (Mapea) estos datos de la base de datos al formato estricto que espera tu frontend en Astro (works.es.json, works.en.json).

Reemplaza los driveId por la URL de tu endpoint de proxy (ej. https://api.yezzfolio.com/api/drive/proxy/{driveId}).

Ejecuta un webhook (HTTP POST) a Vercel/Netlify o Astro para disparar el build.

7. Próximos Pasos de Acción Inmediata

Levantar Base de Datos: Instalar PostgreSQL localmente (o vía Docker) y ejecutar npx prisma migrate dev con el esquema de arriba.

Refactorizar la estructura de carpetas: Crear las carpetas de los dominios en src/modules/ e implementar la estructura de routes, controller y service vacía para preparar el terreno.

Adaptar Admin UI: Actualizar el panel de React para que soporte el inicio de sesión con Google y muestre una vista condicional (Vista SuperAdmin vs Vista Artista) basándose en el JWT.