# Yezzfolio CMS

> Multi-artist portfolio CMS by **JessZB**. Backend de gestión de contenido para portfolios artísticos con soporte bilingüe (ES/EN), integración con Google Drive y exportación de datos para frameworks SSG como Astro.

## Stack

| Capa | Tecnología |
|------|-----------|
| API Backend | Express + TypeScript |
| Base de datos | SQLite (`better-sqlite3`) |
| Autenticación | JWT + Google OAuth2 |
| Admin UI | React + Vite + Material UI |
| Almacenamiento | Google Drive (proxy streaming) |
| Exportación | JSON estático compatible con `littlepigman-portafolio` |

## Estructura

```
yezzfolio/
├── bridge/
│   ├── src/
│   │   ├── routes/        # Admin, auth, file proxy
│   │   ├── db/            # SQLite setup + metadata
│   │   ├── generator/     # buildJson.ts → works/profile JSON
│   │   ├── auth/          # JWT session middleware
│   │   └── index.ts       # Express entry point
│   └── admin-ui/
│       └── src/
│           ├── pages/     # Dashboard, ProfileEditor, Login
│           └── components/
└── package.json
```

## Setup

```bash
# Instalar dependencias
npm run install:all

# Configurar .env en bridge/
cp bridge/.env.example bridge/.env

# Iniciar en desarrollo
npm run dev
```

## Variables de entorno (`bridge/.env`)

```env
JWT_SECRET=your_secret_here
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
BRIDGE_URL=http://localhost:3001
PORT=3001
```

## Exportación JSON

El CMS genera archivos JSON en `src/data/` del frontend Astro:

- `works.[es|en].json` — Proyectos con secciones de trabajo
- `profile.[es|en].json` — Perfil del artista, stats, software, redes

Ver el contrato de datos en el proyecto frontend: [littlepigman-portafolio/DATA_SCHEMA.md](https://github.com/JessZB/littlepigman-portafolio).
