/*
# Recetario Inteligente — Datos semilla

## Resumen
Inserta ingredientes, recetas y sus relaciones para tener un catálogo funcional
con el que se pueda demostrar la búsqueda y el "¿qué cocino hoy?".

## Datos
- 24 ingredientes comunes (verdura, fruta, proteina, lacteo, grano, especia, otro).
- 10 recetas variadas (desayuno, almuerzo, cena, postre) con imágenes de Pexels.
- Relaciones receta↔ingrediente con cantidades.

## Notas
- Usa ON CONFLICT DO NOTHING para ser idempotente.
- Los slugs se generan manualmente en minúsculas sin acentos.
*/

-- ==================== Ingredientes ====================
INSERT INTO ingredients (name, slug, category) VALUES
('huevo', 'huevo', 'proteina'),
('harina', 'harina', 'grano'),
('leche', 'leche', 'lacteo'),
('queso', 'queso', 'lacteo'),
('tomate', 'tomate', 'verdura'),
('cebolla', 'cebolla', 'verdura'),
('ajo', 'ajo', 'verdura'),
('pimiento', 'pimiento', 'verdura'),
('pollo', 'pollo', 'proteina'),
('arroz', 'arroz', 'grano'),
('pasta', 'pasta', 'grano'),
('aceite de oliva', 'aceite-de-oliva', 'otro'),
('sal', 'sal', 'especia'),
('pimienta', 'pimienta', 'especia'),
('azúcar', 'azucar', 'otro'),
('mantequilla', 'mantequilla', 'lacteo'),
('limón', 'limon', 'fruta'),
('cilantro', 'cilantro', 'verdura'),
('papa', 'papa', 'verdura'),
('zanahoria', 'zanahoria', 'verdura'),
('ajo picado', 'ajo-picado', 'verdura'),
('pan', 'pan', 'grano'),
('espinaca', 'espinaca', 'verdura'),
('chocolate', 'chocolate', 'otro')
ON CONFLICT (name) DO NOTHING;

-- ==================== Recetas ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps) VALUES
(
  'Tortilla de Papas',
  'Clásica tortilla española con papas y cebolla, jugosa por dentro y dorada por fuera.',
  'https://images.pexels.com/photos/805998/pexels-photo-805998.jpeg?auto=compress&cs=tinysrgb&w=800',
  45, 4, 'facil',
  'Pelar y cortar las papas en láminas finas.
Cortar la cebolla en juliana.
Freír las papas y la cebolla en aceite a fuego medio 15 min.
Batir los huevos, salpimentar.
Mezclar las papas escurridas con el huevo.
Cuajar en sartén hot 3 min por lado.'
),
(
  'Pasta al Pesto',
  'Pasta fresca con pesto de cilantro, ajo y aceite de oliva. Lista en 20 minutos.',
  'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800',
  20, 2, 'facil',
  'Cocer la pasta en agua con sal según el paquete.
Mientras, triturar cilantro, ajo, queso y aceite de oliva.
Escurrir la pasta y mezclar con el pesto.
Servir con queso rallado.'
),
(
  'Arroz con Pollo',
  'Arroz aromático con pollo dorado, pimiento y zanahoria. Un plato completo.',
  'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800',
  40, 4, 'media',
  'Sazonar y dorar el pollo en aceite.
Sofreír cebolla, pimiento y zanahoria.
Agregar arroz y tostar 2 min.
Añadir agua (2x volumen de arroz) y sal.
Cocinar tapado 18 min.
Reposar 5 min antes de servir.'
),
(
  'Pan con Huevo',
  'Tostadas de pan con huevo revuelto y queso. Desayuno rápido y rendidor.',
  'https://images.pexels.com/photos/1352270/pexels-photo-1352270.jpeg?auto=compress&cs=tinysrgb&w=800',
  10, 1, 'facil',
  'Tostar dos rebanadas de pan.
Revolver un huevo con sal y pimienta.
Cuajar el huevo en sartén con mantequilla.
Servir sobre el pan con queso espolvoreado.'
),
(
  'Ensalada de Tomate',
  'Ensalada fresca de tomate, cebolla y cilantro con aceite de oliva y limón.',
  'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=800',
  10, 2, 'facil',
  'Cortar tomates en rodajas.
Cortar cebolla en juliana fina.
Mezclar con cilantro picado.
Aliñar con aceite de oliva, limón, sal y pimienta.'
),
(
  'Pollo al Limón',
  'Pechuga de pollo jugosa al sartén con salsa de limón y ajo.',
  'https://images.pexels.com/photos/869752/pexels-photo-869752.jpeg?auto=compress&cs=tinysrgb&w=800',
  25, 2, 'media',
  'Sazonar el pollo con sal, pimienta y ajo.
Sellar en sartén hot 4 min por lado.
Agregar jugo de limón y mantequilla.
Reducir 3 min bañando el pollo.
Servir con cilantro picado.'
),
(
  'Sopa de Espinaca',
  'Sopa cremosa de espinaca con papa y cebolla. Reconfortante y ligera.',
  'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800',
  30, 3, 'facil',
  'Sofreír cebolla y ajo en aceite.
Agregar papas en cubos y agua.
Cocinar 15 min hasta que la papa esté blanda.
Añadir espinaca y cocer 3 min.
Licuar y sazonar con sal y pimienta.'
),
(
  'Brownie de Chocolate',
  'Brownie denso y húmedo con chocolate y nueces. Postre para 8 personas.',
  'https://images.pexels.com/photos/2069383/pexels-photo-2069383.jpeg?auto=compress&cs=tinysrgb&w=800',
  35, 8, 'facil',
  'Derretir chocolate con mantequilla.
Batir huevos con azúcar.
Mezclar chocolate con huevos y harina.
Hornear 25 min a 180°C.'
),
(
  'Omelette de Queso',
  'Omelette esponjoso de queso y pimienta. Listo en 8 minutos.',
  'https://images.pexels.com/photos/8500402/pexels-photo-8500402.jpeg?auto=compress&cs=tinysrgb&w=800',
  8, 1, 'facil',
  'Batir 2 huevos con sal y pimienta.
Derretir mantequilla en sartén.
Verter el huevo y espolvorear queso.
Doblar cuando los bordes cuajen.'
),
(
  'Salsa de Tomate Casera',
  'Salsa de tomate fresca con cebolla, ajo y albahaca para acompañar pasta.',
  'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800',
  25, 4, 'facil',
  'Escaldar y pelar los tomates.
Sofreír cebolla y ajo en aceite.
Agregar tomates picados y cocer 15 min.
Sazonar con sal, pimienta y cilantro.'
)
ON CONFLICT DO NOTHING;

-- ==================== Relaciones receta ↔ ingrediente ====================
-- Usamos subconsultas para resolver IDs por nombre/slug de forma idempotente.

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.quantity, ri.is_optional
FROM (VALUES
  ('Tortilla de Papas', 'huevo', '6 unidades', false),
  ('Tortilla de Papas', 'papa', '4 medianas', false),
  ('Tortilla de Papas', 'cebolla', '1 grande', false),
  ('Tortilla de Papas', 'aceite de oliva', '3 cucharadas', false),
  ('Tortilla de Papas', 'sal', 'al gusto', false),

  ('Pasta al Pesto', 'pasta', '250 g', false),
  ('Pasta al Pesto', 'cilantro', '1 manojo', false),
  ('Pasta al Pesto', 'ajo', '2 dientes', false),
  ('Pasta al Pesto', 'queso', '50 g', false),
  ('Pasta al Pesto', 'aceite de oliva', '4 cucharadas', false),
  ('Pasta al Pesto', 'sal', 'al gusto', false),

  ('Arroz con Pollo', 'pollo', '4 presas', false),
  ('Arroz con Pollo', 'arroz', '2 tazas', false),
  ('Arroz con Pollo', 'pimiento', '1 grande', false),
  ('Arroz con Pollo', 'cebolla', '1 mediana', false),
  ('Arroz con Pollo', 'zanahoria', '2 unidades', false),
  ('Arroz con Pollo', 'ajo', '2 dientes', false),
  ('Arroz con Pollo', 'aceite de oliva', '3 cucharadas', false),
  ('Arroz con Pollo', 'sal', 'al gusto', false),

  ('Pan con Huevo', 'pan', '2 rebanadas', false),
  ('Pan con Huevo', 'huevo', '1 unidad', false),
  ('Pan con Huevo', 'queso', '30 g', false),
  ('Pan con Huevo', 'mantequilla', '1 cucharada', false),
  ('Pan con Huevo', 'sal', 'al gusto', false),
  ('Pan con Huevo', 'pimienta', 'al gusto', false),

  ('Ensalada de Tomate', 'tomate', '4 unidades', false),
  ('Ensalada de Tomate', 'cebolla', '1 pequeña', false),
  ('Ensalada de Tomate', 'cilantro', 'al gusto', false),
  ('Ensalada de Tomate', 'aceite de oliva', '2 cucharadas', false),
  ('Ensalada de Tomate', 'limón', '1 unidad', false),
  ('Ensalada de Tomate', 'sal', 'al gusto', false),
  ('Ensalada de Tomate', 'pimienta', 'al gusto', false),

  ('Pollo al Limón', 'pollo', '2 pechugas', false),
  ('Pollo al Limón', 'limón', '2 unidades', false),
  ('Pollo al Limón', 'ajo', '3 dientes', false),
  ('Pollo al Limón', 'mantequilla', '2 cucharadas', false),
  ('Pollo al Limón', 'sal', 'al gusto', false),
  ('Pollo al Limón', 'pimienta', 'al gusto', false),
  ('Pollo al Limón', 'cilantro', 'al gusto', true),

  ('Sopa de Espinaca', 'espinaca', '300 g', false),
  ('Sopa de Espinaca', 'papa', '2 medianas', false),
  ('Sopa de Espinaca', 'cebolla', '1 mediana', false),
  ('Sopa de Espinaca', 'ajo', '2 dientes', false),
  ('Sopa de Espinaca', 'aceite de oliva', '2 cucharadas', false),
  ('Sopa de Espinaca', 'leche', '1 taza', true),
  ('Sopa de Espinaca', 'sal', 'al gusto', false),
  ('Sopa de Espinaca', 'pimienta', 'al gusto', false),

  ('Brownie de Chocolate', 'chocolate', '200 g', false),
  ('Brownie de Chocolate', 'mantequilla', '100 g', false),
  ('Brownie de Chocolate', 'huevo', '3 unidades', false),
  ('Brownie de Chocolate', 'azúcar', '150 g', false),
  ('Brownie de Chocolate', 'harina', '100 g', false),

  ('Omelette de Queso', 'huevo', '2 unidades', false),
  ('Omelette de Queso', 'queso', '40 g', false),
  ('Omelette de Queso', 'mantequilla', '1 cucharada', false),
  ('Omelette de Queso', 'sal', 'al gusto', false),
  ('Omelette de Queso', 'pimienta', 'al gusto', false),

  ('Salsa de Tomate Casera', 'tomate', '6 unidades', false),
  ('Salsa de Tomate Casera', 'cebolla', '1 mediana', false),
  ('Salsa de Tomate Casera', 'ajo', '2 dientes', false),
  ('Salsa de Tomate Casera', 'aceite de oliva', '3 cucharadas', false),
  ('Salsa de Tomate Casera', 'sal', 'al gusto', false),
  ('Salsa de Tomate Casera', 'pimienta', 'al gusto', false),
  ('Salsa de Tomate Casera', 'cilantro', 'al gusto', true)
) AS ri(recipe_title, ingredient_name, quantity, is_optional)
JOIN recipes r ON r.title = ri.recipe_title
JOIN ingredients i ON i.name = ri.ingredient_name
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;