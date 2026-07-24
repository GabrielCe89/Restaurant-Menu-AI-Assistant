import type { RecipeWithIngredients } from '@/lib/supabase';
import { difficultyLabel } from '@/lib/matcher';
import { getModelById } from '@/lib/models';
import { supabase } from '@/lib/supabase';

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  recipeId?: string;
};

type Intent =
  | 'greeting'
  | 'help'
  | 'recipe_detail'
  | 'recipe_steps'
  | 'recipe_ingredients'
  | 'by_ingredient'
  | 'quick_recipes'
  | 'easy_recipes'
  | 'list_recipes'
  | 'difficulty'
  | 'servings'
  | 'fallback';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findRecipesByName(query: string, recipes: RecipeWithIngredients[]): RecipeWithIngredients[] {
  const q = normalize(query);
  return recipes.filter(
    (r) =>
      normalize(r.title).includes(q) ||
      normalize(r.description ?? '').includes(q),
  );
}

function findRecipesByIngredient(query: string, recipes: RecipeWithIngredients[]): RecipeWithIngredients[] {
  const q = normalize(query);
  return recipes.filter((r) =>
    r.recipe_ingredients?.some((ri) => ri.ingredient && normalize(ri.ingredient.name).includes(q)),
  );
}

function extractRecipeName(input: string): string {
  let cleaned = input
    .replace(/^(como|como se hace|como hago|como preparo|como cocino|que lleva|que ingredientes tiene|cuales son los ingredientes de|cuales son los pasos de|la receta de|la preparacion de|preparacion de|receta de|pasos de|pasos para|ingredientes de|ingredientes para|dime los ingredientes de|dime los pasos de)\s+/i, '')
    .replace(/[?¿!.]/g, '')
    .trim();
  return cleaned;
}

function detectIntent(input: string): Intent {
  const q = normalize(input);

  if (/\b(hola|buenas|hey|que tal|saludos|buenos dias|buenas tardes)\b/.test(q)) return 'greeting';
  if (/\b(ayuda|que puedes hacer|que haces|help|opciones|menu)\b/.test(q)) return 'help';
  if (/\b(rapida|rapido|corto|tiempo|minutos|express|veloz)\b/.test(q)) return 'quick_recipes';
  if (/\b(facil|sencilla|simple|basica|principiantes)\b/.test(q)) return 'easy_recipes';
  if (/\b(dificil|dificultad|compleja)\b/.test(q)) return 'difficulty';
  if (/\b(porciones|personas|raciones|sirve para)\b/.test(q)) return 'servings';
  if (/\b(todas|lista|catalogo|ver recetas|que recetas)\b/.test(q)) return 'list_recipes';

  if (/\b(ingredientes|lleva|que tiene|que necesita|que contiene|que lleva)\b/.test(q))
    return 'recipe_ingredients';
  if (/\b(pasos|preparacion|preparo|como se hace|como hago|como cocino|como preparo|instrucciones|elaboracion)\b/.test(q))
    return 'recipe_steps';
  if (/\b(receta|recetas con|que tengan|que usen|con .+)\b/.test(q) && !q.includes('receta de'))
    return 'by_ingredient';
  if (/\b(receta de|receta para|como hago|como preparo|dime|hablame de|quiero saber de|informacion de|detalle)\b/.test(q))
    return 'recipe_detail';

  return 'fallback';
}

function formatRecipeList(recipes: RecipeWithIngredients[], max: number = 5): string {
  const shown = recipes.slice(0, max);
  const lines = shown.map(
    (r) => `- ${r.title} (${r.prep_time_minutes ?? '?'} min, ${difficultyLabel(r.difficulty)})`,
  );
  let text = lines.join('\n');
  if (recipes.length > max) {
    text += `\n…y ${recipes.length - max} más. Pregunta por una en específico.`;
  }
  return text;
}

function formatSteps(recipe: RecipeWithIngredients): string {
  const steps = recipe.steps?.split('\n').filter((s) => s.trim()) ?? [];
  if (steps.length === 0) return 'Esta receta no tiene pasos registrados.';
  return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

function formatIngredients(recipe: RecipeWithIngredients): string {
  const ings = recipe.recipe_ingredients ?? [];
  if (ings.length === 0) return 'Esta receta no tiene ingredientes registrados.';
  return ings
    .map((ri) => {
      const name = ri.ingredient?.name ?? '?';
      const qty = ri.quantity ? ` — ${ri.quantity}` : '';
      const opt = ri.is_optional ? ' (opcional)' : '';
      return `- ${name}${qty}${opt}`;
    })
    .join('\n');
}

export function generateBotResponse(
  input: string,
  recipes: RecipeWithIngredients[],
): { text: string; recipeId?: string } {
  if (recipes.length === 0) {
    return { text: 'Aún no se han cargado las recetas. Espera un momento…' };
  }

  const intent = detectIntent(input);
  const recipeName = extractRecipeName(input);
  const matchedByName = recipeName ? findRecipesByName(recipeName, recipes) : [];

  switch (intent) {
    case 'greeting':
      return {
        text:
          '¡Hola! Soy el asistente del Recetario. Puedo ayudarte con:\n' +
          '- Buscar recetas por nombre o ingrediente\n' +
          '- Decirte los ingredientes o pasos de una receta\n' +
          '- Sugerir recetas rápidas o fáciles\n' +
          '\n¿Qué te gustaría saber?',
      };

    case 'help':
      return {
        text:
          'Esto es lo que puedo hacer:\n\n' +
          '1. "¿Qué recetas tienen pollo?" — busca por ingrediente\n' +
          '2. "¿Cómo se hace la tortilla?" — pasos de una receta\n' +
          '3. "¿Qué lleva el arroz con pollo?" — ingredientes\n' +
          '4. "¿Algo rápido?" — recetas con poco tiempo\n' +
          '5. "¿Algo fácil?" — recetas sencillas\n' +
          '6. "Muéstrame todas las recetas" — catálogo completo\n' +
          '\nEscribe tu pregunta y te respondo al instante.',
      };

    case 'list_recipes':
      return {
        text: `Tenemos ${recipes.length} recetas:\n${formatRecipeList(recipes, 10)}`,
      };

    case 'quick_recipes': {
      const quick = recipes
        .filter((r) => (r.prep_time_minutes ?? 999) <= 20)
        .sort((a, b) => (a.prep_time_minutes ?? 0) - (b.prep_time_minutes ?? 0));
      if (quick.length === 0) return { text: 'No hay recetas particularmente rápidas, pero todas son manejables.' };
      return {
        text: `Estas son las más rápidas (20 min o menos):\n${formatRecipeList(quick)}`,
      };
    }

    case 'easy_recipes': {
      const easy = recipes.filter((r) => r.difficulty === 'facil');
      if (easy.length === 0) return { text: 'No hay recetas marcadas como fáciles por ahora.' };
      return {
        text: `Las recetas más fáciles:\n${formatRecipeList(easy)}`,
      };
    }

    case 'difficulty': {
      const byDiff: Record<string, RecipeWithIngredients[]> = {};
      for (const r of recipes) {
        const d = r.difficulty || 'otro';
        if (!byDiff[d]) byDiff[d] = [];
        byDiff[d].push(r);
      }
      const parts = Object.entries(byDiff).map(([d, rs]) => {
        return `${difficultyLabel(d)} (${rs.length}): ${rs.map((r) => r.title).join(', ')}`;
      });
      return { text: `Recetas por dificultad:\n\n${parts.join('\n')}` };
    }

    case 'servings': {
      const parts = recipes.map(
        (r) => `- ${r.title}: ${r.servings} porciones`,
      );
      return { text: `Porciones por receta:\n${parts.join('\n')}` };
    }

    case 'recipe_ingredients': {
      if (matchedByName.length === 0) {
        return { text: `No encontré una receta con "${recipeName}". Prueba con: ${recipes.slice(0, 3).map((r) => r.title).join(', ')}…` };
      }
      if (matchedByName.length === 1) {
        const r = matchedByName[0];
        return {
          text: `Ingredientes de ${r.title}:\n${formatIngredients(r)}`,
          recipeId: r.id,
        };
      }
      return {
        text: `Encontré varias recetas que coinciden. ¿Cuál te interesa?\n${matchedByName.map((r) => `- ${r.title}`).join('\n')}`,
      };
    }

    case 'recipe_steps': {
      if (matchedByName.length === 0) {
        return { text: `No encontré una receta con "${recipeName}". Prueba con: ${recipes.slice(0, 3).map((r) => r.title).join(', ')}…` };
      }
      if (matchedByName.length === 1) {
        const r = matchedByName[0];
        return {
          text: `Preparación de ${r.title}:\n${formatSteps(r)}`,
          recipeId: r.id,
        };
      }
      return {
        text: `Encontré varias recetas que coinciden. ¿Cuál te interesa?\n${matchedByName.map((r) => `- ${r.title}`).join('\n')}`,
      };
    }

    case 'recipe_detail': {
      if (matchedByName.length === 0) {
        return { text: `No encontré una receta llamada "${recipeName}". Prueba con: ${recipes.slice(0, 3).map((r) => r.title).join(', ')}…` };
      }
      if (matchedByName.length === 1) {
        const r = matchedByName[0];
        const ings = (r.recipe_ingredients ?? []).map((ri) => ri.ingredient?.name).filter(Boolean);
        return {
          text:
            `${r.title}\n` +
            `${r.description ?? ''}\n\n` +
            `Tiempo: ${r.prep_time_minutes ?? '?'} min · Porciones: ${r.servings} · Dificultad: ${difficultyLabel(r.difficulty)}\n` +
            `Ingredientes: ${ings.join(', ')}\n\n` +
            `Pregúntame "¿cómo se prepara ${r.title.toLowerCase()}?" para ver los pasos.`,
          recipeId: r.id,
        };
      }
      return {
        text: `Encontré varias recetas que coinciden. ¿Cuál te interesa?\n${matchedByName.map((r) => `- ${r.title}`).join('\n')}`,
      };
    }

    case 'by_ingredient': {
      const ingName = input
        .replace(/^(que recetas|recetas|recetas con|que tienen|que usen|que llevan|con)\s+/i, '')
        .replace(/[?¿!.]/g, '')
        .trim();
      if (!ingName) {
        return { text: `Dime un ingrediente y te busco recetas. Ejemplo: "¿qué recetas tienen pollo?"` };
      }
      const matched = findRecipesByIngredient(ingName, recipes);
      if (matched.length === 0) {
        return { text: `No encontré recetas que usen "${ingName}". Ingredientes disponibles: ${recipes.flatMap((r) => r.recipe_ingredients ?? []).map((ri) => ri.ingredient?.name).filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 10).join(', ')}…` };
      }
      return {
        text: `Recetas con "${ingName}" (${matched.length}):\n${formatRecipeList(matched)}`,
      };
    }

    default:
      // Try a general search: maybe the user typed a recipe name directly
      if (recipeName && matchedByName.length > 0) {
        if (matchedByName.length === 1) {
          const r = matchedByName[0];
          const ings = (r.recipe_ingredients ?? []).map((ri) => ri.ingredient?.name).filter(Boolean);
          return {
            text:
              `Encontré "${r.title}".\n` +
              `${r.description ?? ''}\n\n` +
              `Tiempo: ${r.prep_time_minutes ?? '?'} min · Porciones: ${r.servings} · Dificultad: ${difficultyLabel(r.difficulty)}\n` +
              `Ingredientes: ${ings.join(', ')}`,
            recipeId: r.id,
          };
        }
        return {
          text: `Encontré varias recetas que coinciden con "${recipeName}":\n${matchedByName.map((r) => `- ${r.title}`).join('\n')}`,
        };
      }
      return {
        text:
          'No entendí tu pregunta. Prueba con algo como:\n' +
          '- "¿Qué recetas tienen pollo?"\n' +
          '- "¿Cómo se hace la tortilla de papas?"\n' +
          '- "¿Qué lleva el brownie?"\n' +
          '- "¿Algo rápido?"\n' +
          '- "Muéstrame todas las recetas"',
      };
  }
}

export function createMessage(role: 'user' | 'bot', text: string, recipeId?: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    recipeId,
  };
}

// ============================================================
// Integración con IA vía OpenRouter (edge function /api/chat)
// ============================================================

function buildRecipesContext(recipes: RecipeWithIngredients[]): string {
  return recipes
    .map((r) => {
      const ings = (r.recipe_ingredients ?? [])
        .map((ri) => {
          const name = ri.ingredient?.name ?? '?';
          const qty = ri.quantity ? ` (${ri.quantity})` : '';
          const opt = ri.is_optional ? ' [opcional]' : '';
          return `${name}${qty}${opt}`;
        })
        .join(', ');
      const steps = r.steps?.split('\n').filter((s) => s.trim()).join(' | ') ?? '';
      return `TÍTULO: ${r.title}\nDESCRIPCIÓN: ${r.description ?? ''}\nTIEMPO: ${r.prep_time_minutes ?? '?'} min\nPORCIONES: ${r.servings}\nDIFICULTAD: ${difficultyLabel(r.difficulty)}\nINGREDIENTES: ${ings}\nPASOS: ${steps}`;
    })
    .join('\n\n---\n\n');
}

// Búsqueda local: encuentra recetas relevantes para dar contexto a la IA.
// No bloquea ni sustituye la respuesta del modelo; solo aporta información.
function searchLocalRecipes(
  input: string,
  recipes: RecipeWithIngredients[],
): RecipeWithIngredients[] {
  const q = normalize(input);
  if (!q) return [];

  const stopwords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del',
    'con', 'sin', 'que', 'tien', 'tengo', 'para', 'por', 'como', 'hacer',
    'crear', 'receta', 'recetas', 'algo', 'rapida', 'rapido', 'facil',
    'dificil', 'alta', 'baja', 'calorias', 'proteinas', 'grasa', 'carbohidratos',
    'y', 'o', 'en', 'al', 'se', 'me', 'mi', 'es', 'son', 'hay', 'ver',
    'todas', 'lista', 'catalogo', 'quisiera', 'quiero', 'necesito',
    'buenas', 'buenos', 'dias', 'tardes', 'noches', 'hola', 'ayuda',
  ]);

  const words = q
    .split(/\s+/)
    .map((w) => w.replace(/[?¿!.:,]/g, '').trim())
    .filter((w) => w.length >= 3 && !stopwords.has(w));

  const scored = recipes.map((r) => {
    let score = 0;
    const title = normalize(r.title);
    const desc = normalize(r.description ?? '');
    const ingNames = (r.recipe_ingredients ?? []).map((ri) =>
      normalize(ri.ingredient?.name ?? ''),
    );

    for (const w of words) {
      if (title.includes(w)) score += 3;
      if (desc.includes(w)) score += 1;
      for (const ingName of ingNames) {
        if (ingName.includes(w) || w.includes(ingName)) score += 2;
      }
    }
    return { recipe: r, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.recipe);
}

function formatLocalSearchResults(recipes: RecipeWithIngredients[]): string {
  if (recipes.length === 0) {
    return 'No se encontraron recetas locales que coincidan con la consulta.';
  }
  return recipes
    .map((r) => {
      const ings = (r.recipe_ingredients ?? [])
        .map((ri) => ri.ingredient?.name ?? '?')
        .join(', ');
      return `- ${r.title}: ${r.description ?? ''} | Ingredientes: ${ings} | ${r.prep_time_minutes ?? '?'} min | ${r.servings} porciones | ${difficultyLabel(r.difficulty)}`;
    })
    .join('\n');
}

export type AIResponse = {
  text: string;
  recipeId?: string;
  usedAI: boolean;
};

export async function generateAIResponse(
  input: string,
  recipes: RecipeWithIngredients[],
  modelId: string,
): Promise<AIResponse> {
  const model = getModelById(modelId);

  // 1) Búsqueda local: encontrar recetas relevantes del catálogo
  const localMatches = searchLocalRecipes(input, recipes);
  const localSearchResults = formatLocalSearchResults(localMatches);

  // 2) Contexto completo del catálogo
  const recipesContext = buildRecipesContext(recipes);

  // 3) Enviar siempre a la IA: contexto local + catálogo + pregunta del usuario
  const { data, error } = await supabase.functions.invoke('chat', {
    body: {
      message: input,
      model: model.openrouterModel,
      recipesContext,
      localSearchResults,
    },
  });

  if (error || !data?.reply) {
    // Fallback al motor local si la IA falla
    const fallback = generateBotResponse(input, recipes);
    return { ...fallback, usedAI: false };
  }

  // Intentar detectar si la respuesta menciona una receta del catálogo para enlazarla
  const mentionedRecipe = recipes.find((r) =>
    data.reply.toLowerCase().includes(r.title.toLowerCase()),
  );

  return {
    text: data.reply as string,
    recipeId: mentionedRecipe?.id,
    usedAI: true,
  };
}
