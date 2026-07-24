/*
# Recetario Inteligente — Esquema inicial

## Resumen
Crea el esquema de base de datos para el Recetario Inteligente: un catálogo de recetas
con sus ingredientes, que permite buscar recetas y sugerir "¿qué cocino hoy?" según
los ingredientes que el usuario tiene disponibles.

Es una aplicación single-tenant (sin autenticación): todos los datos son públicos y
compartidos. Las políticas RLS permiten lectura/escritura a anon y authenticated.

## Tablas nuevas
1. `ingredients`
   - `id` (uuid, pk)
   - `name` (text, not null, único) — nombre del ingrediente en minúsculas
   - `slug` (text, not null, único) — slug para URLs/búsqueda
   - `category` (text) — categoría: verdura, fruta, proteina, lacteo, grano, especia, otro
   - `created_at` (timestamptz)

2. `recipes`
   - `id` (uuid, pk)
   - `title` (text, not null)
   - `description` (text)
   - `image_url` (text) — URL de imagen (Pexels)
   - `prep_time_minutes` (int) — tiempo total de preparación
   - `servings` (int, default 2) — porciones
   - `difficulty` (text, default 'media') — facil, media, dificil
   - `steps` (text) — pasos de la receta separados por saltos de línea
   - `created_at` (timestamptz)

3. `recipe_ingredients`
   - `id` (uuid, pk)
   - `recipe_id` (uuid, fk → recipes.id ON DELETE CASCADE)
   - `ingredient_id` (uuid, fk → ingredients.id ON DELETE CASCADE)
   - `quantity` (text) — ej. "200 g", "2 tazas"
   - `is_optional` (boolean, default false)
   - `created_at` (timestamptz)
   - UNIQUE (recipe_id, ingredient_id)

## Seguridad
- RLS habilitado en las 3 tablas.
- Políticas CRUD para `anon, authenticated` (datos públicos, sin sign-in).

## Notas
- Índices en `recipes.title`, `ingredients.slug`, `recipe_ingredients.recipe_id`.
- Sin user_id (no hay auth).
*/

-- ==================== ingredients ====================
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'otro',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_slug ON ingredients (slug);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients (category);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ingredients" ON ingredients;
CREATE POLICY "anon_select_ingredients" ON ingredients FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ingredients" ON ingredients;
CREATE POLICY "anon_insert_ingredients" ON ingredients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ingredients" ON ingredients;
CREATE POLICY "anon_update_ingredients" ON ingredients FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ingredients" ON ingredients;
CREATE POLICY "anon_delete_ingredients" ON ingredients FOR DELETE
  TO anon, authenticated USING (true);

-- ==================== recipes ====================
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  prep_time_minutes int,
  servings int NOT NULL DEFAULT 2,
  difficulty text NOT NULL DEFAULT 'media',
  steps text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes (title);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes (difficulty);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recipes" ON recipes;
CREATE POLICY "anon_select_recipes" ON recipes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recipes" ON recipes;
CREATE POLICY "anon_insert_recipes" ON recipes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recipes" ON recipes;
CREATE POLICY "anon_update_recipes" ON recipes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recipes" ON recipes;
CREATE POLICY "anon_delete_recipes" ON recipes FOR DELETE
  TO anon, authenticated USING (true);

-- ==================== recipe_ingredients ====================
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity text,
  is_optional boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (recipe_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients (ingredient_id);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "anon_select_recipe_ingredients" ON recipe_ingredients FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "anon_insert_recipe_ingredients" ON recipe_ingredients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "anon_update_recipe_ingredients" ON recipe_ingredients FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "anon_delete_recipe_ingredients" ON recipe_ingredients FOR DELETE
  TO anon, authenticated USING (true);