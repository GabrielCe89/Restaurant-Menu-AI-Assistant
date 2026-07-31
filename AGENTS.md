# AGENTS.md — Recetario Inteligente

> Guía para asistentes de IA que trabajan en este proyecto.
> Compatible con Superpowers (Claude Code, Codex, OpenCode).

## Setup commands

```bash
npm install        # instalar dependencias
npm run dev        # levantar el dev server (Vite) — ya corre automáticamente en Bolt
npm run build      # build de producción
npm run typecheck  # verificación de tipos TypeScript
```

## Project overview

**Recetario Inteligente** es una aplicación web de catálogo de recetas con un
asistente conversacional ("¿Qué cocino hoy?") que sugiere recetas según los
ingredientes disponibles y responde preguntas sobre recetas existentes o crea
recetas nuevas.

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Iconos**: lucide-react
- **Base de datos**: PostgreSQL en Supabase (sin auth, single-tenant)
- **Cliente DB**: @supabase/supabase-js (anon key)
- **IA**: Edge Function `/chat` en Supabase que proxya a OpenRouter (Gemini 2.5 Flash)

## Architecture summary

```
src/
├── App.tsx                  # Componente principal: catálogo, matcher, modal, chatbot
├── components/Chatbot.tsx   # Asistente conversacional (UI del chat)
├── lib/
│   ├── supabase.ts          # Cliente Supabase + tipos TypeScript
│   ├── matcher.ts           # Algoritmo de matching de ingredientes
│   ├── chatbot.ts           # Lógica del chatbot (IA + fallback local)
│   └── models.ts            # Configuración del modelo de IA
supabase/
├── migrations/              # Esquema y seed de la base de datos
└── functions/chat/          # Edge Function que proxya a OpenRouter
docs/architecture/           # Diagramas C4 + ADR
skills/                      # Skills de Superpowers (ver más abajo)
```

## Code style

- **Idioma**: UI y comentarios en español. Variables y funciones en inglés.
- **Imports**: alias `@/` para todo lo que esté en `src/`.
- **Tipos**: tipado explícito en todos los parámetros. Sin `any` implícito.
- **Estilos**: Tailwind CSS. Paleta: `stone` (neutros) + `orange/amber` (acento).
- **Iconos**: importar desde `lucide-react` solo los que se usan.
- **Responsive**: mobile-first con breakpoints `sm:`, `lg:`.
- **Sin emojis** en respuestas ni en el código.

## Database conventions

- **Migraciones**: usar `mcp__supabase__apply_migration` (nunca SQL crudo ni CLI).
- **RLS**: siempre habilitado. Políticas `TO anon, authenticated` con `USING (true)`
  (datos intencionalmente públicos, app sin auth).
- **Sin DROP/DELETE de columnas**: la integridad de datos es prioridad.
- **Queries**: usar `maybeSingle()` para resultados 0-1, nunca `single()`.

## Domain agent: Recetario Chef Assistant

Este proyecto incluye un agente especializado en `skills/` que entiende el
dominio de recetas de cocina. Ver la sección "Skills" más abajo para detalles.

El agente puede:
- Buscar recetas por ingredientes del catálogo
- Recomendar recetas según preferencias o restricciones alimentarias
- Explicar una receta paso a paso

## Security considerations

- La `OPENROUTER_API_KEY` vive solo en los secretos de la Edge Function (Supabase).
  Nunca debe commitearse ni exponerse en el cliente.
- El cliente usa la anon key de Supabase (pública por diseño, RLS la protege).
- La Edge Function valida que el mensaje no esté vacío antes de procesar.

## What NOT to change without explicit approval

- No modificar el frontend ni el backend existentes sin autorización.
- No cambiar la lógica del chatbot (`src/lib/chatbot.ts`).
- No cambiar las rutas ni la arquitectura actual.
- No alterar las migraciones ya aplicadas (usar nuevas migraciones en su lugar).
