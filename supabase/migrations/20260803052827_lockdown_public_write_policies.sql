/*
# Aplicar principio de mínimo privilegio: solo lectura pública

## Resumen
Esta migración elimina los permisos públicos de escritura (INSERT, UPDATE, DELETE)
sobre las tablas `recipes`, `recipe_ingredients` e `ingredients`. A partir de
este cambio, el frontend (que usa la anon key) solo puede leer (SELECT) datos.

Las operaciones de creación, edición y borrado deben realizarse únicamente desde
una Edge Function o backend seguro que use la service role key, nunca desde
el cliente.

## Cambios por tabla

### Tabla `recipes`
- Se eliminan las políticas: `anon_insert_recipes`, `anon_update_recipes`,
  `anon_delete_recipes`.
- Se conserva la política `anon_select_recipes` (lectura pública).
- Se revocan los permisos INSERT, UPDATE, DELETE de los roles `anon` y
  `authenticated`.

### Tabla `recipe_ingredients`
- Se eliminan las políticas: `anon_insert_recipe_ingredients`,
  `anon_update_recipe_ingredients`, `anon_delete_recipe_ingredients`.
- Se conserva la política `anon_select_recipe_ingredients` (lectura pública).
- Se revocan los permisos INSERT, UPDATE, DELETE de los roles `anon` y
  `authenticated`.

### Tabla `ingredients`
- Se eliminan las políticas: `anon_insert_ingredients`,
  `anon_update_ingredients`, `anon_delete_ingredients`.
- Se conserva la política `anon_select_ingredients` (lectura pública).
- Se revocan los permisos INSERT, UPDATE, DELETE de los roles `anon` y
  `authenticated`.

## Seguridad
- RLS sigue habilitado en las tres tablas.
- La única política restante por tabla es SELECT (lectura pública).
- Los roles `anon` y `authenticated` conservan únicamente SELECT.
- Cualquier escritura futura debe hacerse mediante una Edge Function con la
  service role key, que bypassa RLS de forma controlada en el servidor.

## Notas importantes
1. Esta migración es idempotente: usa `DROP POLICY IF EXISTS` y `REVOKE` (que
   no falla si el permiso ya no existe).
2. No se elimina ni modifica ninguna fila de datos.
3. No se altera la estructura de las tablas.
*/

-- ============================================================
-- Tabla: recipes
-- ============================================================

-- Eliminar políticas de escritura
DROP POLICY IF EXISTS "anon_insert_recipes" ON recipes;
DROP POLICY IF EXISTS "anon_update_recipes" ON recipes;
DROP POLICY IF EXISTS "anon_delete_recipes" ON recipes;

-- Revocar permisos de escritura de anon y authenticated
REVOKE INSERT, UPDATE, DELETE ON recipes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON recipes FROM authenticated;

-- Asegurar que solo queda SELECT
GRANT SELECT ON recipes TO anon;
GRANT SELECT ON recipes TO authenticated;

-- ============================================================
-- Tabla: recipe_ingredients
-- ============================================================

-- Eliminar políticas de escritura
DROP POLICY IF EXISTS "anon_insert_recipe_ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "anon_update_recipe_ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "anon_delete_recipe_ingredients" ON recipe_ingredients;

-- Revocar permisos de escritura de anon y authenticated
REVOKE INSERT, UPDATE, DELETE ON recipe_ingredients FROM anon;
REVOKE INSERT, UPDATE, DELETE ON recipe_ingredients FROM authenticated;

-- Asegurar que solo queda SELECT
GRANT SELECT ON recipe_ingredients TO anon;
GRANT SELECT ON recipe_ingredients TO authenticated;

-- ============================================================
-- Tabla: ingredients
-- ============================================================

-- Eliminar políticas de escritura
DROP POLICY IF EXISTS "anon_insert_ingredients" ON ingredients;
DROP POLICY IF EXISTS "anon_update_ingredients" ON ingredients;
DROP POLICY IF EXISTS "anon_delete_ingredients" ON ingredients;

-- Revocar permisos de escritura de anon y authenticated
REVOKE INSERT, UPDATE, DELETE ON ingredients FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ingredients FROM authenticated;

-- Asegurar que solo queda SELECT
GRANT SELECT ON ingredients TO anon;
GRANT SELECT ON ingredients TO authenticated;
