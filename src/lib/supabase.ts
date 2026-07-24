import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Ingredient = {
  id: string;
  name: string;
  slug: string;
  category: string;
  created_at: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time_minutes: number | null;
  servings: number;
  difficulty: string;
  steps: string | null;
  created_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: string | null;
  is_optional: boolean;
  ingredient?: Ingredient;
};

export type RecipeWithIngredients = Recipe & {
  recipe_ingredients?: RecipeIngredient[];
};
