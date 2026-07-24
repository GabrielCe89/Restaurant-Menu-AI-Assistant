# C4 Nivel 1 — Diagrama de Contexto del Sistema

El diagrama de contexto muestra el sistema como un único bloque y sus interacciones
con los usuarios y sistemas externos.

```mermaid
C4Context
    title Recetario Inteligente — Diagrama de Contexto (Nivel 1)

    Person(usuario, "Cocina", "Usuario que busca recetas y descubre qué cocinar con los ingredientes que tiene disponibles.")

    System_Boundary(sistema, "Recetario Inteligente") {
        System(recetario, "Recetario Inteligente", "Aplicación web que ofrece un catálogo de recetas y un asistente de recomendación basado en los ingredientes disponibles del usuario.")
    }

    System_Ext(supabase, "Supabase (PostgreSQL)", "Base de datos alojada que almacena recetas, ingredientes y sus relaciones.")

    Rel(usuario, recetario, "Busca recetas, selecciona ingredientes, ve detalles")
    Rel(recetario, supabase, "Lee recetas e ingredientes (SQL sobre HTTPS)")

    UpdateRelStyle(usuario, recetario, $offsetX="-20", $offsetY="-10")
    UpdateRelStyle(recetario, supabase, $offsetX="-20", $offsetY="-10")
```

## Descripción

| Elemento           | Descripción                                                                          |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Cocina** (Persona) | Cualquier persona que entra a la app. No requiere cuenta ni autenticación.           |
| **Recetario Inteligente** (System) | SPA React que renderiza el catálogo, el matcher de ingredientes y el detalle de recetas. |
| **Supabase** (External) | Proveedor de PostgreSQL gestionado. La app se conecta con la anon key a través de la API REST de Supabase. |

## Flujos principales

1. **Explorar catálogo**: el usuario abre la app, ve todas las recetas y puede buscar por texto.
2. **¿Qué cocino hoy?**: el usuario selecciona ingredientes, la app consulta todas las recetas
   de Supabase una sola vez, calcula el match en el navegador y muestra un ranking.
3. **Ver detalle**: al tocar una receta, se muestra la imagen, ingredientes y pasos.
