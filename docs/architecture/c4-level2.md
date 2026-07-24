# C4 Nivel 2 — Diagrama de Contenedores

El diagrama de contenedores descompone el sistema en sus contenedores principales
(aplicaciones desplegables independientes) y muestra cómo se comunican.

```mermaid
C4Context
    title Recetario Inteligente — Diagrama de Contenedores (Nivel 2)

    Person(usuario, "Cocina", "Usuario de la aplicación")

    System_Boundary(sistema, "Recetario Inteligente") {
        Container(spa, "SPA React + Vite", "React 18, TypeScript, Tailwind CSS", "Catálogo de recetas, búsqueda, matcher de ingredientes y vista de detalle. Ejecuta el algoritmo de matching en el navegador.")
        Container(cliente_supabase, "Cliente Supabase (supabase-js)", "@supabase/supabase-js", "Cliente JavaScript que envía queries SQL a la API REST de Supabase usando la anon key.")
    }

    System_Ext(supabase, "Supabase", "PostgreSQL gestionado + API REST")
    SystemDb(db, "Base de Datos PostgreSQL", "Tablas: recipes, ingredients, recipe_ingredients")

    Rel(usuario, spa, "Interactúa vía navegador (HTTPS)")
    Rel(spa, cliente_supabase, "Usa para queries")
    Rel(cliente_supabase, supabase, "API REST sobre HTTPS (anon key)")
    Rel(supabase, db, "Ejecuta SQL / aplica RLS")

    UpdateRelStyle(usuario, spa, $offsetX="-30", $offsetY="-10")
    UpdateRelStyle(spa, cliente_supabase, $offsetX="-15", $offsetY="-10")
    UpdateRelStyle(cliente_supabase, supabase, $offsetX="-15", $offsetY="-10")
    UpdateRelStyle(supabase, db, $offsetX="-15", $offsetY="-10")
```

## Contenedores

| Contenedor              | Tecnología                          | Responsabilidad |
| ----------------------- | ----------------------------------- | --------------- |
| **SPA React + Vite**    | React 18, TypeScript, Tailwind CSS  | Toda la UI: catálogo, búsqueda, matcher, modal de detalle. Descarga todas las recetas e ingredientes en el primer load y ejecuta el matching en el cliente. |
| **Cliente Supabase**    | @supabase/supabase-js               | Capa de acceso a datos. Se inicializa con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Expone métodos `.from().select()`, `.insert()`, etc. |
| **Base de Datos PostgreSQL** | Supabase (PostgreSQL gestionado) | Almacena `recipes`, `ingredients` y `recipe_ingredients`. RLS habilitado con políticas `anon, authenticated`. |

## Modelo de datos

```mermaid
erDiagram
    recipes ||--o{ recipe_ingredients : tiene
    ingredients ||--o{ recipe_ingredients : aparece_en

    recipes {
        uuid id PK
        text title
        text description
        text image_url
        int prep_time_minutes
        int servings
        text difficulty
        text steps
        timestamptz created_at
    }

    ingredients {
        uuid id PK
        text name UK
        text slug UK
        text category
        timestamptz created_at
    }

    recipe_ingredients {
        uuid id PK
        uuid recipe_id FK
        uuid ingredient_id FK
        text quantity
        boolean is_optional
        timestamptz created_at
    }
```

## Flujo de datos en "¿Qué cocino hoy?"

```mermaid
sequenceDiagram
    actor U as Usuario
    participant SPA as SPA React
    participant SC as Cliente Supabase
    participant DB as PostgreSQL

    Note over SPA,DB: Carga inicial (una sola vez)
    SPA->>SC: select * from recipes join recipe_ingredients, ingredients
    SC->>DB: SQL (RLS: anon puede leer)
    DB-->>SC: 10 recetas + 64 relaciones + 24 ingredientes
    SC-->>SPA: JSON con todo el catálogo

    Note over U,SPA: Interacción
    U->>SPA: Selecciona ingredientes (huevo, tomate, …)
    SPA->>SPA: matchRecipes(recipes, slugs disponibles)
    SPA-->>U: Ranking de recetas con % de match

    Note over SPA,DB: No hay nuevas llamadas a DB durante el matching
```

## Seguridad

- **RLS habilitado** en las 3 tablas.
- **Políticas `TO anon, authenticated`** (CRUD abierto) porque la app no tiene login
  y los datos son intencionalmente públicos.
- **Anon key** en el cliente: no hay secretos sensibles expuestos; la anon key está
  diseñada para uso en el navegador.
