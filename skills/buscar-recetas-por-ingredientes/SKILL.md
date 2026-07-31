---
name: buscar-recetas-por-ingredientes
description: "Use when the user asks to find recipes that use specific ingredients, wants to know what to cook with what they have, or needs to search the recipe catalog by ingredient names"
---

# Buscar Recetas por Ingredientes

## Overview

This skill helps find recipes in the Recetario Inteligente catalog that match
one or more ingredients the user mentions. It uses the local matching
algorithm (`src/lib/matcher.ts`) and the Supabase database to return relevant
recipes ranked by ingredient coverage.

## When to use

- The user says "tengo pollo y arroz, ¿qué puedo hacer?"
- The user asks for recipes that contain a specific ingredient
- The user wants to know what recipes match their available ingredients
- The user is exploring the catalog filtered by ingredients

## How it works

The project has a matching algorithm in `src/lib/matcher.ts` that:

1. Takes a list of ingredient names (or a free-text query)
2. Scores each recipe in the catalog by the percentage of its **mandatory**
   ingredients that the user has available
3. Returns recipes ranked by match percentage (highest first)

### Key functions

- `matchRecipes(availableIngredients, recipes)` — returns ranked recipes
  with match percentage
- Each recipe has `recipe_ingredients` with `is_optional` flag; optional
  ingredients are not counted against the match score

### Database schema

```
ingredients (id, name, slug, category)
recipes (id, title, description, image_url, prep_time_minutes, servings, difficulty, steps)
recipe_ingredients (id, recipe_id, ingredient_id, quantity, is_optional)
```

## Process

1. **Extract ingredient names** from the user's query (normalize, remove
   stopwords like "tengo", "y", "verdur" -> map to actual ingredient names).
2. **Run the matcher** — call `matchRecipes()` with the extracted ingredients
   and the full recipe list loaded from Supabase.
3. **Present results** — show recipe title, match percentage, missing
   ingredients, and a link to open the recipe detail.
4. **If no matches** — suggest the closest partial matches and offer to ask
   the AI assistant to create a new recipe with those ingredients.

## Constraints

- This skill searches the **existing catalog only**. It does not create
  new recipes (use the AI chatbot for that).
- Ingredient matching is case-insensitive and accent-insensitive
  (see `normalize()` in `src/lib/chatbot.ts`).
- The full recipe list is loaded once at app startup; no additional fetch
  is needed during matching.

## Example interaction

> User: "Tengo pollo, cebolla y ajo. ¿Qué recetas puedo hacer?"

The skill should:
1. Extract: pollo, cebolla, ajo
2. Run `matchRecipes(['pollo', 'cebolla', 'ajo'], recipes)`
3. Return: recipes ranked by match %, showing which ingredients are covered
4. Present the top 3-5 results with match percentage and missing ingredients
