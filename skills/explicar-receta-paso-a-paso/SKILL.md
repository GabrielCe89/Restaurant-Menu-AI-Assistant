---
name: explicar-receta-paso-a-paso
description: "Use when the user asks how to prepare a specific recipe, wants the steps explained, needs cooking technique guidance for a recipe, or wants a walkthrough of a recipe from the catalog"
---

# Explicar una Receta Paso a Paso

## Overview

This skill provides detailed, step-by-step explanations of recipes from the
Recetario Inteligente catalog. It reads the recipe's `steps` field and
presents each step clearly, with context about ingredients, techniques, and
timing.

## When to use

- The user asks "¿cómo se hace la lasaña?"
- The user asks "explícame los pasos del arroz con pollo"
- The user wants a walkthrough before starting to cook
- The user is confused about a specific step in a recipe
- The user wants tips or technique advice for a recipe

## How it works

### Recipe data structure

Each recipe has:
- `title`: recipe name
- `description`: short summary
- `steps`: newline-separated string of preparation steps
- `recipe_ingredients[]`: each with `ingredient.name`, `quantity`, `is_optional`
- `prep_time_minutes`: total preparation time
- `servings`: number of portions
- `difficulty`: `'facil'`, `'intermedio'`, `'dificil'`

### Step formatting

The `steps` field is a plain text string with steps separated by newlines.
The helper function `formatSteps()` in `src/lib/chatbot.ts` numbers them:

```
1. Primer paso...
2. Segundo paso...
3. Tercer paso...
```

## Process

1. **Identify the recipe** — match the user's query against recipe titles
   using `findRecipesByName()` from `src/lib/chatbot.ts`.
2. **If multiple matches** — ask the user to clarify which recipe they mean.
3. **If no match** — suggest similar recipe names from the catalog.
4. **Present the overview** — title, description, time, servings, difficulty,
   and full ingredient list with quantities.
5. **Walk through each step** — present steps numbered, with:
   - What to do (the step text)
   - Why it matters (cooking technique context, if non-obvious)
   - Tips for that step (temperature, timing, visual cues)
6. **Offer to open the recipe** — provide a link to the full recipe detail
   view in the app.

## Explanation guidelines

- **Be conversational**: explain as if talking to someone who is about to cook.
- **Add technique context**: if a step says "sofreír la cebolla", mention that
  this means cooking on medium heat until translucent, not browned.
- **Highlight timing**: if a step involves waiting (e.g., "dejar reposar 10 min"),
  emphasize the time so the user can plan ahead.
- **Ingredient cross-reference**: when a step mentions an ingredient, remind
  the user of the quantity from the ingredient list.
- **Safety notes**: mention food safety when relevant (e.g., "asegúrate de que
  el pollo esté completamente cocido, sin partes rosadas en el centro").

## Constraints

- This skill explains **existing recipes only** from the catalog. If the user
  asks about a recipe that doesn't exist, suggest the closest match or defer
  to the AI chatbot to create a new one.
- Do not invent steps that aren't in the recipe's `steps` field. Add context
  and tips around the existing steps, but don't fabricate new instructions.
- Keep explanations in Spanish, clear and accessible for non-expert cooks.

## Example interaction

> User: "¿Cómo se hace la tortilla de papas?"

The skill should:
1. Find the recipe "Tortilla de Papas" in the catalog
2. Present: "La Tortilla de Papas es una receta clásica..." + overview
3. List ingredients with quantities
4. Walk through each step with technique tips:
   - "Paso 1: Pelar y cortar las papas en láminas finas — esto asegura
     cocción uniforme..."
   - "Paso 2: Sofreír las papas en aceite a fuego medio — el objetivo es
     que se ablanden, no que se doren..."
   - etc.
5. Offer: "¿Quieres que abra la receta completa en la app?"
