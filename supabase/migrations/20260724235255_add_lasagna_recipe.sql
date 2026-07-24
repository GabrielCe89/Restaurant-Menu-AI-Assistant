-- Lasaña de Espinaca y Queso (vegetariana)
INSERT INTO recipes (title, description, image_url, prep_time_minutes, servings, difficulty, steps)
VALUES (
  'Lasaña de Espinaca y Queso',
  'Lasaña vegetariana con capas de pasta, espinaca salteada, salsa de tomate y queso derretido. Un clásico reconfortante.',
  'https://images.pexels.com/photos/5949887/pexels-photo-5949887.jpeg?auto=compress&cs=tinysrgb&w=800',
  50,
  4,
  'media',
  'Precalentar el horno a 190°C.
  Cocer las placas de pasta en agua con sal según el paquete, escurrir y reservar.
  Saltear la espinaca con ajo y aceite de oliva hasta que reduzca, salpimentar.
  En una fuente, cubrir el fondo con salsa de tomate.
  Colocar una capa de pasta, luego espinaca, queso y tomate.
  Repetir las capas hasta llenar la fuente, terminando con queso.
  Hornear 25 minutos hasta que el queso gratine.
  Dejar reposar 5 minutos antes de servir.'
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_optional)
SELECT r.id, i.id, ri.qty, ri.opt
FROM recipes r
CROSS JOIN (VALUES
  ('pasta', '8 placas', false),
  ('espinaca', '300 g', false),
  ('tomate', '400 g (salsa)', false),
  ('queso', '200 g', false),
  ('ajo', '2 dientes', false),
  ('aceite-de-oliva', '3 cucharadas', false),
  ('sal', 'al gusto', false),
  ('pimienta', 'al gusto', false)
) AS ri(slug, qty, opt)
JOIN ingredients i ON i.slug = ri.slug
WHERE r.title = 'Lasaña de Espinaca y Queso';
