import type { RecipeWithIngredients } from '@/lib/supabase';

export type MatchResult = {
  recipe: RecipeWithIngredients;
  matchedCount: number;
  totalCount: number;
  missingIngredients: string[];
  optionalMissing: string[];
  score: number;
};

/**
 * Dado un set de ingredientes disponibles (por slug, en minúsculas),
 * calcula qué tan bien matchea cada receta.
 * Score = matchedCount / totalCount (ingredientes obligatorios).
 */
export function matchRecipes(
  recipes: RecipeWithIngredients[],
  availableSlugs: Set<string>,
): MatchResult[] {
  const results: MatchResult[] = recipes.map((recipe) => {
    const recipeIngs = recipe.recipe_ingredients ?? [];
    const mandatory = recipeIngs.filter((ri) => !ri.is_optional);
    const optional = recipeIngs.filter((ri) => ri.is_optional);

    const matched = mandatory.filter(
      (ri) => ri.ingredient && availableSlugs.has(ri.ingredient.slug),
    );
    const missingIngredients = mandatory
      .filter((ri) => ri.ingredient && !availableSlugs.has(ri.ingredient.slug))
      .map((ri) => ri.ingredient!.name);
    const optionalMissing = optional
      .filter((ri) => ri.ingredient && !availableSlugs.has(ri.ingredient.slug))
      .map((ri) => ri.ingredient!.name);

    const totalCount = mandatory.length;
    const matchedCount = matched.length;
    const score = totalCount > 0 ? matchedCount / totalCount : 0;

    return {
      recipe,
      matchedCount,
      totalCount,
      missingIngredients,
      optionalMissing,
      score,
    };
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.missingIngredients.length !== b.missingIngredients.length)
      return a.missingIngredients.length - b.missingIngredients.length;
    return a.recipe.title.localeCompare(b.recipe.title);
  });

  return results;
}

export function difficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'facil':
      return 'Fácil';
    case 'media':
      return 'Media';
    case 'dificil':
      return 'Difícil';
    default:
      return difficulty;
  }
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'facil':
      return 'bg-emerald-100 text-emerald-700';
    case 'media':
      return 'bg-amber-100 text-amber-700';
    case 'dificil':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
