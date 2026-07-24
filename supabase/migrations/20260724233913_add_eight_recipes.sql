-- ============================================================
-- Ampliación del catálogo: 8 recetas nuevas en 6 categorías
-- Categorías: saludables, vegetarianas, carnes, pastas, postres, comidas rápidas
-- ============================================================

-- ==================== Nuevos ingredientes ====================
INSERT INTO ingredients (name, slug, category) VALUES
  ('lentejas', 'lentejas', 'grano'),
  ('garbanzos', 'garbanzos', 'grano'),
  ('avena', 'avena', 'grano'),
  ('banana', 'banana', 'fruta'),
  ('carne molida', 'carne-molida', 'proteina'),
  ('pan rallado', 'pan-rallado', 'otro'),
  ('manzana', 'manzana', 'fruta'),
  ('canela', 'canela', 'especia'),
  ('vainilla', 'vainilla', 'especia'),
  ('queso parmesano', 'queso-parmesano', 'lacteo'),
  ('tocino', 'tocino', 'proteina'),
  ('lechuga', 'lechuga', 'verdura'),
  ('pepino', 'pepino', 'verdura'),
  ('vinagre', 'vinagre', 'otro'),
  ('hongos', 'hongos', 'verdura'),
  ('caldo de verduras', 'caldo-de-verduras', 'otro')
ON CONFLICT (slug) DO NOTHING;

-- ==================== 1. Ensalada de Pollo Saludable (saludable) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Ensalada de Pollo Saludable',
  'Ensalada fresca y nutritiva con pollo grillado, lechuga, tomate, pepino y un aderezo de limón y aceite de oliva.',
  'https://images.pexels.com/photos/27969809/pexels-photo-27969809.jpeg?auto=compress&cs=tinysrgb&w=800',
  20,
  2,
  'facil',
  'Sazonar las pechugas de pollo con sal, pimienta y jugo de limón.
  Grillar el pollo en una sartén con aceite de oliva, 4 minutos por lado, hasta dorar.
  Dejar reposar y cortar en tiras.
  Lavar y cortar la lechuga, el tomate y el pepino.
  Mezclar las verduras en un bol, agregar el pollo.
  Aliñar con aceite de oliva, limón, sal y pimienta al gusto.
  Servir inmediatamente.'
)
RETURNING id AS r1;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('pollo', '2 pechugas', false),
  ('lechuga', '1 planta', false),
  ('tomate', '2 unidades', false),
  ('pepino', '1 unidad', false),
  ('aceite-de-oliva', '2 cucharadas', false),
  ('limon', '1 unidad', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Ensalada de Pollo Saludable';

-- ==================== 2. Guiso de Lentejas (vegetariana) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Guiso de Lentejas',
  'Guiso vegetariano de lentejas con verduras, rico en proteínas vegetales y fibra. Reconfortante y fácil.',
  'https://images.pexels.com/photos/6120506/pexels-photo-6120506.jpeg?auto=compress&cs=tinysrgb&w=800',
  45,
  4,
  'facil',
  'Enjuagar las lentejas y remojar 30 minutos.
  Picar la cebolla, el ajo, la zanahoria y el pimiento.
  Rehogar la cebolla y el ajo en aceite de oliva.
  Agregar la zanahoria, el pimiento y las lentejas.
  Cubrir con caldo de verduras, salpimentar y cocinar 30 minutos a fuego bajo.
  Servir caliente.'
)
RETURNING id AS r2;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('lentejas', '200 g', false),
  ('cebolla', '1 mediana', false),
  ('ajo', '2 dientes', false),
  ('zanahoria', '2 unidades', false),
  ('pimiento', '1 grande', false),
  ('aceite-de-oliva', '2 cucharadas', false),
  ('caldo-de-verduras', '1 litro', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Guiso de Lentejas';

-- ==================== 3. Salteado de Carne con Verduras (carnes) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Salteado de Carne con Verduras',
  'Carne molida salteada con pimientos, cebolla, ajo y zanahoria. Una comida rápida y completa.',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800',
  25,
  3,
  'media',
  'Picar la cebolla, el ajo, el pimiento y la zanahoria en tiras finas.
  Calentar aceite en un wok o sartén grande.
  Saltear la carne molida hasta dorar, reservar.
  En la misma sartén, saltear las verduras 5 minutos.
  Devolver la carne, mezclar y sazonar con sal, pimienta y un toque de ajo.
  Servir caliente.'
)
RETURNING id AS r3;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('carne-molida', '500 g', false),
  ('cebolla', '1 grande', false),
  ('ajo', '3 dientes', false),
  ('pimiento', '2 unidades', false),
  ('zanahoria', '2 unidades', false),
  ('aceite-de-oliva', '2 cucharadas', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Salteado de Carne con Verduras';

-- ==================== 4. Pasta Carbonara (pastas) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Pasta Carbonara',
  'Clásica pasta italiana con tocino, huevo y queso parmesano. Cremosa sin necesidad de crema.',
  'https://images.pexels.com/photos/6223191/pexels-photo-6223191.jpeg?auto=compress&cs=tinysrgb&w=800',
  25,
  2,
  'media',
  'Cocer la pasta en agua con sal según el paquete.
  Cortar el tocino en tiras y dorar en una sartén.
  Batir los huevos con el queso parmesano rallado y pimienta.
  Escurrir la pasta y mezclar con el tocino fuera del fuego.
  Agregar la mezcla de huevo y queso, remover rápido para cremarla sin cuajar.
  Servir inmediatamente con más queso y pimienta.'
)
RETURNING id AS r4;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('pasta', '250 g', false),
  ('tocino', '150 g', false),
  ('huevo', '2 yemas', false),
  ('queso-parmesano', '50 g', false),
  ('ajo', '1 diente', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Pasta Carbonara';

-- ==================== 5. Panqueques de Avena y Banana (saludable / postre) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Panqueques de Avena y Banana',
  'Panqueques saludables sin harina, hechos con avena y banana. Ideales para un desayuno nutritivo.',
  'https://images.pexels.com/photos/14263510/pexels-photo-14263510.jpeg?auto=compress&cs=tinysrgb&w=800',
  15,
  2,
  'facil',
  'Procesar la avena hasta obtener harina fina.
  Triturar la banana con un tenedor.
  Mezclar la avena, la banana, el huevo y la vainilla.
  Calentar una sartén antiadherente con un toque de aceite.
  Verter pequeños montones de masa y cocinar 2 minutos por lado.
  Servir con rodajas de banana.'
)
RETURNING id AS r5;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('avena', '1 taza', false),
  ('banana', '2 unidades', false),
  ('huevo', '1 unidad', false),
  ('vainilla', '1 cucharadita', false),
  ('aceite-de-oliva', '1 cucharada', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Panqueques de Avena y Banana';

-- ==================== 6. Hamburguesas Caseras (comida rápida) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Hamburguesas Caseras',
  'Hamburguesas caseras con carne, queso, lechuga y tomate. Un clásico rápido que gusta a todos.',
  'https://images.pexels.com/photos/15523395/pexels-photo-15523395.jpeg?auto=compress&cs=tinysrgb&w=800',
  30,
  4,
  'facil',
  'Mezclar la carne molida con sal, pimienta y ajo picado.
  Formar 4 hamburguesas con las manos.
  Grillar en sartén o plancha, 4 minutos por lado.
  Tostar el pan.
  Armar: pan, lechuga, tomate, hamburguesa, queso y pan.
  Servir con papas si se desea.'
)
RETURNING id AS r6;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('carne-molida', '600 g', false),
  ('pan', '4 unidades', false),
  ('queso', '4 fetas', false),
  ('lechuga', '4 hojas', false),
  ('tomate', '1 unidad', false),
  ('ajo', '1 diente', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Hamburguesas Caseras';

-- ==================== 7. Risotto de Hongos y Parmesano (vegetariana) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Risotto de Hongos y Parmesano',
  'Risotto cremoso de arroz con hongos salteados y queso parmesano. Elegante y reconfortante.',
  'https://images.pexels.com/photos/12630590/pexels-photo-12630590.jpeg?auto=compress&cs=tinysrgb&w=800',
  40,
  3,
  'dificil',
  'Calentar el caldo de verduras y mantener a fuego bajo.
  Picar la cebolla y el ajo finamente.
  Rehogar cebolla y ajo en aceite de oliva.
  Agregar el arroz y tostar 2 minutos.
  Incorporar cucharones de caldo caliente, uno por uno, removiendo constantemente.
  Por separado, saltear los hongos en aceite y ajo.
  A los 18 minutos, agregar los hongos y el queso parmesano.
  Mezclar, reposar 2 minutos y servir.'
)
RETURNING id AS r7;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('arroz', '1 taza', false),
  ('hongos', '300 g', false),
  ('cebolla', '1 mediana', false),
  ('ajo', '2 dientes', false),
  ('queso-parmesano', '60 g', false),
  ('aceite-de-oliva', '3 cucharadas', false),
  ('caldo-de-verduras', '1 litro', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Risotto de Hongos y Parmesano';

-- ==================== 8. Torta de Manzana y Canela (postre) ====================
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Torta de Manzana y Canela',
  'Torta casera húmeda con manzanas y canela. Perfecta para acompañar con café o té.',
  'https://images.pexels.com/photos/31581244/pexels-photo-31581244.jpeg?auto=compress&cs=tinysrgb&w=800',
  60,
  8,
  'media',
  'Precalentar el horno a 180°C.
  Pelar y cortar las manzanas en rodajas finas.
  Batir los huevos con el azúcar hasta que estén espumosos.
  Agregar la leche, la vainilla y la mantequilla derretida.
  Tamizar la harina con la canela e incorporar.
  Verter la mitad de la masa en un molde, cubrir con manzanas, verter el resto.
  Hornear 45 minutos hasta que al insertar un palillo salga limpio.
  Dejar enfriar y desmoldar.'
)
RETURNING id AS r8;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('manzana', '3 unidades', false),
  ('harina', '200 g', false),
  ('azucar', '150 g', false),
  ('huevo', '3 unidades', false),
  ('leche', '100 ml', false),
  ('mantequilla', '100 g', false),
  ('canela', '2 cucharaditas', false),
  ('vainilla', '1 cucharadita', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Torta de Manzana y Canela';
