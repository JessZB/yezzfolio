# Workflow: Code Review (Yezzfolio CMS)

Auditoría exhaustiva obligatoria para cualquier PR o cambio grande en el CMS Yezzfolio.

---

## 1. Validación Técnica (Tipado) (¡MANDATORIO!)

Ningún código entra a la rama principal si tiene errores.
```bash
# Para Backend Bridge (Express)
cd bridge && npx tsc --noEmit

# Para Frontend Admin UI (React)
cd bridge/admin-ui && npx tsc --noEmit
```

## 2. Revisión del Backend (Backend Expert + Security Expert)
- [ ] ¿El nuevo código en el servidor vulnera endpoints expuestos de SQLite? (Check placeholders SQL `?`).
- [ ] ¿Novedades en JSON `buildJson.ts` cumplen las reglas con respecto a `null`s según el schema exportado?
- [ ] Zod de validación está presente en nuevos bodies de req.

## 3. Revisión del UI/UX (Admin UI) (Frontend Expert)
- [ ] ¿Los nuevos campos dentro del React están propiamente estilizandose con MUI Theme Provider y el look and feel Premium Glass oscuro?
- [ ] ¿Maneja estados de error provenientes del fetch API localmente? (Ej alertando al usuario en pantalla si algo falla).

---

## 🔒 AUDITORÍA FINAL DEL AGENTE

El agente emitirá esta declaración cuando el workflow pase:
```
💻 CODE REVIEW YEZZFOLIO COMPLETADO
Tipado Backend/React: ✅
Auditoría SSR/CORS: ✅
Decisión: APROBADO ✅ / BLOQUEADO 🚫
```
