# Experto Backend: Bridge API y Generador (Express + SQLite)

Este rol garantiza la escalabilidad, eficiencia computacional y la integridad del flujo de exportación de datos en el CMS Yezzfolio.

## 1. Patrones de Diseño (Express.js)
- **Controladores y Rutas:** Mantener la lógica separada. Los archivos de rutas (`index.ts`, `admin.ts`) definen endpoints y aplican middlewares. La lógica de negocio pesada va en funciones auxiliares.
- **Manejo de Errores:** Nunca usar `res.status(500).send(err.message)` exponiendo stack traces completos. Utilizar siempre el bloque genérico de captura en Express o capturar y devolver objetos estructurados estándar: `{ error: true, message: string }`.

## 2. Base de Datos (SQLite)
- **Librería Mínima:** Usar `better-sqlite3`. Ejecutar sentencias usando `.prepare()`.
- **Transacciones:** Para operaciones complejas que requieren insertar/borrar información de múltiples tablas (ej. un Proyecto y todos sus Work Items atados), envolver siempre con una transacción mediante `db.transaction(() => { ... })()`.
- **Manejo Estricto de Nulos:** Asegúrate de mapear `DBNull` correctamente a variables null o strings por defecto cuando devuelvas datos complejos al cliente o al generador.

## 3. Pipeline de Generación JSON (`buildJson.ts`)
- **Contrato Estricto:** La exportación generada por `buildJson` debe coincidir al 100% con la estructura requerida en el [DATA_SCHEMA.md](https://github.com/JessZB/littlepigman-portafolio/blob/develop/DATA_SCHEMA.md) del portafolio.
- **Rutas Relativas vs Absolutas:** El Bridge genera URLs absolutas (ej. `http://yezzfolio.com/api/file/ID`) a menos que el field de imagen no tenga Google Drive ID, devolviendo explícitamente `null` para que Astro inserte validaciones.

## 4. Validación Técnica
- **Asegurar Tipado:** Las respuestas de base de datos (`db.prepare().all()`) devuelven tipo `unknown`. Debes castear los resultados explícitamente mediante una interfaz `interface DBProject { ... }`.
- **Scripts:** Toda la sintaxis debe validar corriendo los chequeos TypeScripts nativos (`tsc --noEmit`).

## 5. Control de Versiones de API
- **Rutas de Endpoints:** Todas las rutas expuestas y consumidas por clientes externos deben incluir la versión mayor en la URL para aislar actualizaciones (ej. `/api/v1/projects`).
- **Tolerancia a Breaking Changes:** Si se introducen cambios incompatibles en la base de datos o en el pipeline de generación JSON (`buildJson.ts`), se debe instanciar una nueva versión de la ruta (ej. `v2`) y mantener la versión anterior operando hasta que el frontend cliente sea refactorizado.
