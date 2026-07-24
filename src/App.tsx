import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search,
  Clock,
  Users,
  ChefHat,
  Sparkles,
  X,
  Plus,
  Check,
  AlertCircle,
  UtensilsCrossed,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  Ingredient,
  Recipe,
  RecipeIngredient,
  RecipeWithIngredients,
} from '@/lib/supabase';
import {
  matchRecipes,
  difficultyLabel,
  difficultyColor,
  type MatchResult,
} from '@/lib/matcher';
import { Chatbot } from '@/components/Chatbot';

type View = 'catalog' | 'matcher';

export default function App() {
  const [view, setView] = useState<View>('catalog');
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
  const [availableSlugs, setAvailableSlugs] = useState<Set<string>>(new Set());
  const [ingredientInput, setIngredientInput] = useState('');

  // Cargar recetas e ingredientes al montar
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ data: recipeData, error: recipeError }, { data: ingData, error: ingError }] =
          await Promise.all([
            supabase
              .from('recipes')
              .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
              .order('title'),
            supabase.from('ingredients').select('*').order('name'),
          ]);

        if (cancelled) return;
        if (recipeError) throw recipeError;
        if (ingError) throw ingError;
        setRecipes((recipeData as RecipeWithIngredients[]) ?? []);
        setIngredients((ingData as Ingredient[]) ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const q = searchQuery.toLowerCase();
    return recipes.filter((r) => {
      const inTitle = r.title.toLowerCase().includes(q);
      const inDesc = r.description?.toLowerCase().includes(q) ?? false;
      const inIngs = r.recipe_ingredients?.some(
        (ri) => ri.ingredient?.name.toLowerCase().includes(q),
      );
      return inTitle || inDesc || inIngs;
    });
  }, [recipes, searchQuery]);

  const matchResults = useMemo<MatchResult[]>(() => {
    if (availableSlugs.size === 0) return [];
    return matchRecipes(recipes, availableSlugs);
  }, [recipes, availableSlugs]);

  const addIngredient = useCallback(
    (name: string) => {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) return;
      const found = ingredients.find((i) => i.name === trimmed || i.slug === trimmed);
      if (found) {
        setAvailableSlugs((prev) => new Set(prev).add(found.slug));
        setIngredientInput('');
      }
    },
    [ingredients],
  );

  const removeIngredient = useCallback((slug: string) => {
    setAvailableSlugs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }, []);

  const availableIngredientsForPicker = useMemo(() => {
    return ingredients.filter((i) => !availableSlugs.has(i.slug));
  }, [ingredients, availableSlugs]);

  const selectedIngredientNames = useMemo(() => {
    return ingredients.filter((i) => availableSlugs.has(i.slug));
  }, [ingredients, availableSlugs]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <ChefHat className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-stone-900">
                Recetario Inteligente
              </h1>
              <p className="text-xs text-stone-500">¿Qué cocino hoy?</p>
            </div>
          </div>
          <nav className="flex gap-1 rounded-full bg-stone-100 p-1">
            <button
              onClick={() => setView('catalog')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'catalog'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>
            <button
              onClick={() => setView('matcher')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'matcher'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">¿Qué cocino hoy?</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : view === 'catalog' ? (
          <CatalogView
            recipes={filteredRecipes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectRecipe={setSelectedRecipe}
          />
        ) : (
          <MatcherView
            ingredientInput={ingredientInput}
            setIngredientInput={setIngredientInput}
            addIngredient={addIngredient}
            removeIngredient={removeIngredient}
            selectedIngredients={selectedIngredientNames}
            availableIngredients={availableIngredientsForPicker}
            matchResults={matchResults}
            onSelectRecipe={setSelectedRecipe}
          />
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      <Chatbot recipes={recipes} onSelectRecipe={setSelectedRecipe} />

      <footer className="border-t border-stone-200 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-400 sm:px-6">
          Recetario Inteligente · Prototipo con arquitectura documentada
        </div>
      </footer>
    </div>
  );
}

// ==================== Loading State ====================
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-stone-400">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-orange-600" />
      <p className="mt-4 text-sm">Cargando recetas…</p>
    </div>
  );
}

// ==================== Catalog View ====================
type CatalogViewProps = {
  recipes: RecipeWithIngredients[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectRecipe: (r: RecipeWithIngredients) => void;
};

function CatalogView({ recipes, searchQuery, setSearchQuery, onSelectRecipe }: CatalogViewProps) {
  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, descripción o ingrediente…"
          className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="h-12 w-12 text-stone-300" />
          <p className="mt-4 text-lg font-medium text-stone-500">No se encontraron recetas</p>
          <p className="mt-1 text-sm text-stone-400">Prueba con otro término de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Recipe Card ====================
type RecipeCardProps = {
  recipe: RecipeWithIngredients;
  onClick: () => void;
};

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <UtensilsCrossed className="h-12 w-12" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${difficultyColor(
            recipe.difficulty,
          )}`}
        >
          {difficultyLabel(recipe.difficulty)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-snug text-stone-900">{recipe.title}</h3>
        {recipe.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{recipe.description}</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-stone-400">
          {recipe.prep_time_minutes != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.prep_time_minutes} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {recipe.servings} porciones
          </span>
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {recipe.recipe_ingredients?.length ?? 0} ingredientes
          </span>
        </div>
      </div>
    </button>
  );
}

// ==================== Matcher View ====================
type MatcherViewProps = {
  ingredientInput: string;
  setIngredientInput: (v: string) => void;
  addIngredient: (name: string) => void;
  removeIngredient: (slug: string) => void;
  selectedIngredients: Ingredient[];
  availableIngredients: Ingredient[];
  matchResults: MatchResult[];
  onSelectRecipe: (r: RecipeWithIngredients) => void;
};

function MatcherView({
  ingredientInput,
  setIngredientInput,
  addIngredient,
  removeIngredient,
  selectedIngredients,
  availableIngredients,
  matchResults,
  onSelectRecipe,
}: MatcherViewProps) {
  const filteredAvailable = useMemo(() => {
    const q = ingredientInput.trim().toLowerCase();
    if (!q) return availableIngredients.slice(0, 8);
    return availableIngredients.filter((i) => i.name.includes(q)).slice(0, 8);
  }, [availableIngredients, ingredientInput]);

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <h2 className="text-2xl font-bold">¿Qué cocino hoy?</h2>
        </div>
        <p className="mt-2 max-w-lg text-orange-50">
          Selecciona los ingredientes que tienes en casa y te recomiendo recetas según lo que
          puedas preparar.
        </p>
      </div>

      {/* Ingredient selector */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-semibold text-stone-700">
          Tus ingredientes disponibles
        </label>
        <div className="relative">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredAvailable.length === 1) addIngredient(filteredAvailable[0].name);
                else addIngredient(ingredientInput);
              }
            }}
            placeholder="Escribe un ingrediente (ej. huevo, tomate, pollo)…"
            className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-4 pr-4 text-base shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {ingredientInput.trim() && filteredAvailable.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
              {filteredAvailable.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => addIngredient(ing.name)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-stone-700 transition-colors hover:bg-orange-50"
                >
                  <span>{ing.name}</span>
                  <Plus className="h-4 w-4 text-stone-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected chips */}
        {selectedIngredients.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedIngredients.map((ing) => (
              <span
                key={ing.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700"
              >
                {ing.name}
                <button
                  onClick={() => removeIngredient(ing.slug)}
                  className="rounded-full p-0.5 transition-colors hover:bg-orange-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {matchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ChefHat className="h-12 w-12 text-stone-300" />
          <p className="mt-4 text-lg font-medium text-stone-500">
            Agrega ingredientes para ver recomendaciones
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Cuantos más ingredientes selecciones, mejores serán las sugerencias
          </p>
        </div>
      ) : (
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Recetas recomendadas ({matchResults.length})
          </h3>
          <div className="space-y-4">
            {matchResults.map((result) => (
              <MatchCard
                key={result.recipe.id}
                result={result}
                onClick={() => onSelectRecipe(result.recipe)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Match Card ====================
function MatchCard({ result, onClick }: { result: MatchResult; onClick: () => void }) {
  const { recipe, matchedCount, totalCount, missingIngredients, score } = result;
  const percentage = Math.round(score * 100);
  const canCook = missingIngredients.length === 0;

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-stretch gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-bold leading-snug text-stone-900">{recipe.title}</h4>
            {canCook && (
              <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                ¡Lista!
              </span>
            )}
          </div>
          {recipe.description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-stone-500">{recipe.description}</p>
          )}
        </div>

        <div className="mt-2">
          {/* Match bar */}
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full transition-all ${
                  canCook ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-rose-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-stone-600">
              {matchedCount}/{totalCount}
            </span>
          </div>
          {missingIngredients.length > 0 && (
            <p className="mt-1.5 text-xs text-stone-400">
              <span className="font-medium text-stone-500">Falta:</span>{' '}
              {missingIngredients.join(', ')}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ==================== Recipe Detail Modal ====================
function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: RecipeWithIngredients;
  onClose: () => void;
}) {
  const steps = useMemo(
    () => recipe.steps?.split('\n').filter((s) => s.trim()) ?? [],
    [recipe.steps],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative h-56 flex-shrink-0 overflow-hidden bg-stone-100 sm:h-64">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-300">
              <UtensilsCrossed className="h-16 w-16" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${difficultyColor(
                recipe.difficulty,
              )}`}
            >
              {difficultyLabel(recipe.difficulty)}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-stone-900">{recipe.title}</h2>
          {recipe.description && (
            <p className="mt-2 text-stone-600">{recipe.description}</p>
          )}

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
            {recipe.prep_time_minutes != null && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-500" />
                {recipe.prep_time_minutes} minutos
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-orange-500" />
              {recipe.servings} porciones
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              {difficultyLabel(recipe.difficulty)}
            </span>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-stone-700">
              <UtensilsCrossed className="h-4 w-4" />
              Ingredientes
            </h3>
            <ul className="mt-3 space-y-2">
              {(recipe.recipe_ingredients as RecipeIngredient[] | undefined)?.map((ri) => (
                <li
                  key={ri.id}
                  className="flex items-center justify-between border-b border-stone-100 pb-2 text-sm"
                >
                  <span className="text-stone-700">
                    {ri.ingredient?.name}
                    {ri.is_optional && (
                      <span className="ml-1 text-xs text-stone-400">(opcional)</span>
                    )}
                  </span>
                  {ri.quantity && (
                    <span className="text-stone-500">{ri.quantity}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          {steps.length > 0 && (
            <div className="mt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-stone-700">
                <ChefHat className="h-4 w-4" />
                Preparación
              </h3>
              <ol className="mt-3 space-y-3">
                {steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-stone-700">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-stone-100 p-4">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
