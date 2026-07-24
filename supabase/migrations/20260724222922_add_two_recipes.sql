-- ==================== Crepes de Espinaca y Queso ====================
-- Ingredientes que ya existen: espinaca, huevo, leche, harina, mantequilla, queso, sal, pimienta

INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Crepes de Espinaca y Queso',
  'Crepes verdes rellenas de espinaca y queso, ideales para un almuerzo ligero o cena elegante.',
  'https://images.pexels.com/photos/6824809/pexels-photo-6824809.jpeg?auto=compress&cs=tinysrgb&w=800',
  30,
  2,
  'media',
  'Licuar la espinaca con la leche, los huevos, la harina, la mantequilla derretida, sal y pimienta hasta obtener una masa lisa.
Calentar una sartén antiadherente y verter un cucharón de masa, distribuyendo en capa fina.
Cocinar 1 minuto por lado hasta que se despegue, dar vuelta y dorar el otro lado.
Repetir hasta terminar la masa, reservando los crepes en un plato.
Rellenar cada crepe con queso y espinaca salteada, doblar en cuatro.
Servir tibios.'
)
RETURNING id AS crepe_recipe_id;

-- ==================== Pollo al Horno con Papas ====================
-- Ingredientes que ya existen: pollo, papa, ajo, aceite de oliva, pimienta, sal, limón

INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Pollo al Horno con Papas',
  'Pollo dorado al horno con papas y ajo, un clásico casero reconfortante y fácil de preparar.',
  'https://images.pexels.com/photos/4589138/pexels-photo-4589138.jpeg?auto=compress&cs=tinysrgb&w=800',
  50,
  4,
  'facil',
  'Precalentar el horno a 200°C.
Lavar y cortar las papas en cubos medianos.
Colocar el pollo y las papas en una bandeja para horno.
Rociar con aceite de oliva, ajo picado, sal, pimienta y jugo de limón.
Mezclar bien para que todo quede impregnado.
Hornear 40-45 minutos hasta que el pollo esté dorado y las papas tiernas.
Servir caliente.'
)
RETURNING id AS chicken_recipe_id;

-- ==================== Relaciones: Crepes de Espinaca y Queso ====================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('espinaca', '100 g', false),
  ('huevo', '2 unidades', false),
  ('leche', '1 taza', false),
  ('harina', '1 taza', false),
  ('mantequilla', '30 g', false),
  ('queso', '100 g', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Crepes de Espinaca y Queso';

-- ==================== Relaciones: Pollo al Horno con Papas ====================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('pollo', '8 presas', false),
  ('papa', '6 medianas', false),
  ('ajo', '4 dientes', false),
  ('aceite-de-oliva', '3 cucharadas', false),
  ('limon', '1 unidad', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Pollo al Horno con Papas';
