# Arquitectura — Recetario Inteligente

Documentación de arquitectura usando el modelo C4 (Contexto, Contenedores, Componentes).

## Diagramas

- [`c4-level1.md`](./c4-level1.md) — Diagrama de Contexto (Nivel 1)
- [`c4-level2.md`](./c4-level2.md) — Diagrama de Contenedores (Nivel 2)
- [`adr/`](./adr/) — Registros de Decisiones de Arquitectura (ADR)

## Resumen

El Recetario Inteligente es una aplicación web de una sola página (SPA) que permite
a un usuario:

1. **Explorar** un catálogo de recetas con búsqueda por nombre, descripción o ingrediente.
2. **Descubrir** qué cocinar según los ingredientes que tiene disponibles, mediante un
   algoritmo de matching que rankea recetas por porcentaje de coincidencia.

### Stack tecnológico

| Capa            | Tecnología                          |
| --------------- | ----------------------------------- |
| Frontend        | React 18 + TypeScript + Vite        |
| Estilos         | Tailwind CSS                        |
| Iconos          | lucide-react                        |
| Base de datos   | PostgreSQL (Supabase)               |
| Cliente DB      | @supabase/supabase-js (anon key)    |
| Despliegue      | Bolt (dev server local para demo)  |

### Decisiones clave

- **Sin autenticación**: la app es single-tenant, los datos son públicos. Ver ADR-001.
- **Matching en el cliente**: el algoritmo de "¿qué cocino hoy?" se ejecuta en el
  navegador, no en el servidor. Ver ADR-001.
- **RLS abierto**: las políticas permiten `anon, authenticated` CRUD en todas las tablas.
