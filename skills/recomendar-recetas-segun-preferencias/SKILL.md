---
name: recomendar-recetas-segun-preferencias
description: "Use when the user asks for recipe recommendations based on dietary preferences, restrictions (vegetarian, vegan, gluten-free, high protein, low calorie), difficulty level, preparation time, or serving size"
---

# Recomendar Recetas Según Preferencias o Restricciones

## Overview

This skill helps recommend recipes from the Recetario Inteligente catalog
based on user preferences or dietary restrictions. It filters and ranks
recipes using metadata fields (difficulty, prep time, servings) and
ingredient analysis to match dietary needs.

## When to use

- The user asks for "recetas vegetarianas" or "algo sin carne"
- The user wants "recetas rápidas" (under 20-30 min)
- The user asks for "recetas fáciles" or "para principiantes"
- The user wants high-protein, low-calorie, or other nutritional goals
- The user specifies a serving size or occasion
- The user has a dietary restriction (gluten-free, dairy-free, etc.)

## How it works

### Available metadata for filtering

Each recipe in the catalog has:
- `difficulty`: `'facil'`, `'intermedio'`, `'dificil'`
- `prep_time_minutes`: integer (minutes)
- `servings`: integer (number of portions)
- `recipe_ingredients[]`: each with `ingredient.name`, `ingredient.category`

### Ingredient categories in the database

Ingredients are categorized (e.g., `proteina-animal`, `vegetal`, `lacteo`,
`cereal`, `condimento`). This categorization enables dietary filtering:

| Restriction | Filter logic |
|---|---|
| Vegetariano | Exclude recipes with ingredients in `proteina-animal` category (except eggs/dairy) |
| Vegano | Exclude all animal products including eggs and dairy |
| Sin gluten | Exclude recipes with `trigo`, `harina`, `pan`, `pasta` ingredients |
| Sin lactosa | Exclude recipes with `lacteo` category ingredients |
| Alta en proteína | Prioritize recipes with multiple `proteina-animal` or `legumbre` ingredients |

### Helper functions

- `difficultyLabel(difficulty)` — returns a human-readable label in Spanish
- `difficultyColor(difficulty)` — returns Tailwind color class for badges
- Both are in `src/lib/matcher.ts`

## Process

1. **Identify the restriction or preference** from the user's query.
2. **Filter recipes** using the logic table above and the available metadata.
3. **Rank results** — if multiple filters apply, prioritize recipes that
   satisfy the most restrictive condition first.
4. **Present recommendations** — show 3-5 recipes with title, why it matches
   the preference, prep time, and difficulty.
5. **If no matches** — explain why and suggest relaxing one constraint, or
   offer to ask the AI assistant to create a custom recipe.

## Constraints

- This skill works with the **existing catalog**. For truly custom dietary
  needs not covered by existing recipes, defer to the AI chatbot which can
  create new recipes.
- Nutritional analysis is approximate, based on ingredient categories, not
  precise calorie/macro calculations.
- Always present the reasoning: tell the user *why* a recipe matches their
  preference (e.g., "esta receta no contiene ingredientes de origen animal").

## Example interactions

> User: "¿Tienes algo vegetariano y rápido?"

The skill should:
1. Filter: exclude recipes with meat ingredients, keep prep_time <= 25 min
2. Rank: fastest first
3. Present: "Encontré estas opciones vegetarianas y rápidas:" + list

> User: "Necesito recetas altas en proteína para después de entrenar"

The skill should:
1. Filter: recipes with 2+ protein-source ingredients
2. Rank: by number of protein ingredients (descending)
3. Present: "Estas recetas son ricas en proteína:" + list with protein sources highlighted
