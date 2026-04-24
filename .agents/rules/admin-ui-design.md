---
name: admin-ui-design
description: Validates and enforces consistent UI styles across the admin panel, rejecting divergent thematic experiments like JRPG/Holographic UI unless explicitly requested by the user.
---

# Admin UI Design Guidelines

Enforces a cohesive, minimal "Glassmorphism" aesthetic throughout the Admin CMS (`bridge/admin-ui/`).

## Core Rules
1. **Consistency**: All editor layouts (`ProfileEditor`, `ProjectEditor`) MUST match the aesthetic established in `Dashboard.tsx` and `Dashboard.css`.
2. **Standard Classes**: Rely on standard, globally available Material UI (MUI) components or clean CSS logic:
   - Use `rgba(255, 255, 255, 0.02)` or `var(--border-glass)` for panel backgrounds and borders.
   - Use `var(--radius-md)` or `var(--radius-sm)` for border radius.
   - Avoid hardcoded clip-paths (e.g. `clip-path: polygon(...)`) unless used globally in the `index.css`.
3. **No Thematic Deviations**: Do not inject specific aesthetic themes (like Cyberpunk, Hologram, JRPG) into the Admin Interface. The admin interface is a functional configuration tool, while the main Astro App is where the stylized themes belong.
4. **Interactive Elements**: Use standardized MUI Buttons (`variant="contained" color="secondary"`) or the standard `btn-primary`, `btn-secondary`, `icon-btn` classes. Do not create novelty buttons like glitches, neon hover states, or scanlines.
5. **Layouts**: Stick to standard Flexbox/Grid structures with predictable spacing (e.g., `gap: 1.5rem`). No absolute positioning magic just for decoration.

## Usage
Trigger this rule whenever modifying the `admin-ui/` codebase, especially when generating new layout structures or refactoring CSS. Ensure the changes adhere strictly to the "Admin Minimal Glass" aesthetic. 
