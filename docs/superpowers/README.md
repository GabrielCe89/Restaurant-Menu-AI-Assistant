# Skills de Superpowers — Guía para desarrolladores

Este proyecto incluye skills de [Superpowers](https://github.com/obra/superpowers)
que dan a los asistentes de IA conocimiento estructurado sobre el dominio del
Recetario Inteligente. Las skills son archivos de documentación (formato
`SKILL.md` con frontmatter YAML) que no modifican la aplicación: son una capa
de soporte para el desarrollo asistido por IA.

## Skills incluidas

| Skill | Ubicación | Cuándo se activa |
|---|---|---|
| Buscar recetas por ingredientes | `skills/buscar-recetas-por-ingredientes/SKILL.md` | El usuario pregunta qué recetas puede hacer con ciertos ingredientes |
| Recomendar recetas según preferencias | `skills/recomendar-recetas-segun-preferencias/SKILL.md` | El usuario pide recetas por restricción alimentaria, tiempo, dificultad o preferencia nutricional |
| Explicar una receta paso a paso | `skills/explicar-receta-paso-a-paso/SKILL.md` | El usuario pregunta cómo se prepara una receta específica del catálogo |

## Cómo usar las skills

### Con Claude Code

Si tienes el plugin de Superpowers instalado (`/plugin install superpowers`),
las skills en `skills/` se detectan automáticamente. Solo abre una conversación
en el directorio del proyecto y haz tu consulta.

### Con Codex u OpenCode

Copia o enlaza la carpeta `skills/` al directorio de skills de tu runtime:

```bash
# Codex
ln -s $(pwd)/skills ~/.agents/skills/recetario-inteligente

# OpenCode
ln -s $(pwd)/skills ~/.config/opencode/skills/recetario-inteligente
```

### Sin Superpowers instalado

Las skills son archivos Markdown legibles. Cualquier asistente de IA que lea
el repositorio puede usarlas como referencia de contexto, incluso sin el
plugin de Superpowers.

## Formato de una skill

Cada skill es un directorio con un archivo `SKILL.md` que contiene:

```yaml
---
name: nombre-de-la-skill
description: "Use when..."  # describe cuándo activar la skill
---

# Título

## Overview
## When to use
## How it works
## Process
## Constraints
## Example interaction
```

El campo `description` es lo que el asistente de IA lee primero para decidir
si la skill es relevante. Debe empezar con "Use when..." y describir los
disparadores, no el proceso interno.

## Crear una nueva skill

1. Crea un directorio en `skills/<nombre-de-la-skill>/`
2. Agrega un archivo `SKILL.md` con el frontmatter YAML (`name` y `description`)
3. Documenta el overview, cuándo usarla, cómo funciona, el proceso,
   restricciones y un ejemplo de interacción
4. El `name` solo puede contener letras, números y guiones
5. La combinación de `name` + `description` no debe superar 1024 caracteres

## Relación con el código existente

Las skills hacen referencia a funciones y tipos reales del proyecto:

- `src/lib/matcher.ts` — `matchRecipes()`, `difficultyLabel()`, `difficultyColor()`
- `src/lib/chatbot.ts` — `findRecipesByName()`, `findRecipesByIngredient()`, `formatSteps()`, `normalize()`
- `src/lib/supabase.ts` — tipos `Recipe`, `RecipeWithIngredients`, `Ingredient`

Estas referencias permiten que el asistente de IA sepa exactamente qué
funciones existen y cómo usarlas, sin tener que explorar todo el código.

## Restricciones

- Las skills **no ejecutan código** ni modifican la aplicación.
- No agregan dependencias npm ni cambian el build.
- No afectan el chatbot, el catálogo ni la arquitectura.
- Son una capa de documentación adicional para asistentes de IA.
