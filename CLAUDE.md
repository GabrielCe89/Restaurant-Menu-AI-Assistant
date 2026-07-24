# CLAUDE.md — Recetario Inteligente

> Convenciones, subagentes y plan ejecutado para el proyecto "Recetario Inteligente"
> (Entregable 2 — Prototipo con Arquitectura Documentada).

## Descripción del proyecto

Recetario inteligente: catálogo de recetas + asistente "¿Qué cocino hoy?" que sugiere
recetas según los ingredientes disponibles. El matching se ejecuta en el cliente
(ver ADR-001).

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS (config en `tailwind.config.js`)
- **Iconos**: lucide-react
- **Base de datos**: PostgreSQL en Supabase
- **Cliente DB**: @supabase/supabase-js (anon key, sin auth)

## Estructura del proyecto

```
project/
├── src/
│   ├── App.tsx              # Componente principal: catálogo, matcher, modal de detalle
│   ├── main.tsx             # Entry point
│   ├── index.css            # Tailwind base
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase + tipos TypeScript
│   │   └── matcher.ts       # Algoritmo de matching + helpers de UI
│   └── vite-env.d.ts
├── docs/
│   └── architecture/
│       ├── README.md
│       ├── c4-level1.md     # Diagrama de Contexto (Mermaid)
│       ├── c4-level2.md     # Diagrama de Contenedores (Mermaid)
│       └── adr/
│           └── ADR-001-matching-en-cliente.md
├── supabase/
│   └── functions/           # Edge functions (vacío por ahora)
├── .env                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── CLAUDE.md                # Este archivo
└── package.json
```

## Convenciones de código

### Generales

- **Idioma**: UI y comentarios en español. Nombres de variables y funciones en inglés.
- **Imports**: usar el alias `@/` para todo lo que esté en `src/` (ej. `@/lib/supabase`).
- **Tipos**: tipado explícito en todos los parámetros de funciones. Sin `any` implícito.
- **Comentarios**: solo cuando el "por qué" no es obvio. No comentar lo que el código ya dice.
- **Sin emojis** en respuestas ni en el código.

### Frontend

- **Estado**: React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`). Sin estado global.
- **Estilos**: clases de Tailwind. Paleta principal: `stone` (neutros) + `orange/amber` (acento).
- **Iconos**: importar desde `lucide-react` solo los que se usan.
- **Componentes**: un archivo por vista principal. Sub-componentes pequeños pueden
  vivir en el mismo archivo si son cohesivos (ej. `RecipeCard`, `MatchCard`).
- **Responsive**: mobile-first con breakpoints `sm:`, `lg:`.

### Base de datos (Supabase)

- **Migraciones**: usar `mcp__supabase__apply_migration` (nunca SQL crudo ni CLI).
- **RLS**: siempre habilitado. Esta app es single-tenant (sin auth), así que las
  políticas usan `TO anon, authenticated` con `USING (true)` (datos intencionalmente públicos).
- **Tipos**: definidos en `src/lib/supabase.ts` (no se generan automáticamente).
- **Queries**: usar `maybeSingle()` para resultados 0-1, nunca `single()`.
- **Sin DROP/DELETE de columnas**: la integridad de datos es prioridad.

### Arquitectura

- **Matching en el cliente**: el algoritmo vive en `src/lib/matcher.ts`. No hay
  endpoint de backend para matching (ver ADR-001).
- **Carga inicial**: la app carga todas las recetas e ingredientes en un solo
  `useEffect` al montar. No hay fetch adicional durante la interacción.
- **Sin auth**: no hay pantalla de login. Toda la data es pública.

## Subagentes

Durante el desarrollo de este prototipo se utilizaron los siguientes subagentes
conceptuales (no spawns reales de Agent, sino roles de diseño):

| Subagente          | Responsabilidad | Entregables |
| ------------------ | --------------- | ----------- |
| **Schema Architect** | Diseñar el modelo de datos de recetas e ingredientes | 2 migraciones en Supabase (`create_recetario_schema`, `seed_recetario_data`) |
| **Frontend Builder** | Implementar la SPA con catálogo, matcher y modal | `src/App.tsx`, `src/lib/supabase.ts`, `src/lib/matcher.ts` |
| **Docs Writer** | Redactar diagramas C4 y ADR | `docs/architecture/` |
| **Reviewer** | Verificar build, typecheck y coherencia general | `npm run build` + `npm run typecheck` |

## Plan ejecutado

### 1. Esquema de base de datos
- [x] Migración `create_recetario_schema`: tablas `ingredients`, `recipes`,
      `recipe_ingredients` con FKs, índices y RLS (políticas anon CRUD).
- [x] Migración `seed_recetario_data`: 24 ingredientes, 10 recetas, 64 relaciones.

### 2. Cliente y tipos
- [x] `src/lib/supabase.ts`: cliente singleton + tipos `Ingredient`, `Recipe`,
      `RecipeIngredient`, `RecipeWithIngredients`.

### 3. Lógica de matching
- [x] `src/lib/matcher.ts`: función `matchRecipes()` que rankea recetas por
      porcentaje de ingredientes obligatorios disponibles. Helpers de UI
      (`difficultyLabel`, `difficultyColor`).

### 4. Frontend
- [x] Catálogo de recetas con búsqueda (nombre, descripción, ingrediente).
- [x] Vista "¿Qué cocino hoy?" con selector de ingredientes + ranking de match.
- [x] Modal de detalle con imagen, ingredientes, pasos y meta.
- [x] Diseño responsive con Tailwind, paleta stone/orange, micro-interacciones.

### 5. Documentación
- [x] `docs/architecture/c4-level1.md` — Diagrama de Contexto (Mermaid C4Context).
- [x] `docs/architecture/c4-level2.md` — Diagrama de Contenedores + ER + secuencia.
- [x] `docs/architecture/adr/ADR-001-matching-en-cliente.md` — decisión clave.
- [x] `docs/architecture/README.md` — índice de la documentación.

### 6. Verificación
- [ ] `npm run build` pasa sin errores.
- [ ] `npm run typecheck` pasa sin errores.
- [ ] Demo en vivo funcional en el dev server.

## Cómo correr el proyecto

```bash
npm install      # instalar dependencias
npm run dev      # levantar el dev server (Vite)
npm run build    # build de producción
npm run typecheck # verificación de tipos
```

## Demo en vivo

El dev server corre automáticamente en el entorno de Bolt. Para la exposición del
Entregable 2, abrir la URL del preview en el navegador y:

1. Mostrar el **catálogo** con búsqueda.
2. Ir a **¿Qué cocino hoy?**, seleccionar 3-4 ingredientes y ver el ranking.
3. Abrir el **detalle** de una receta para mostrar ingredientes y pasos.
