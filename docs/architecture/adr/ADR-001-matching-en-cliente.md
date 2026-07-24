# ADR-001: Matching de ingredientes en el cliente vs. en el servidor

**Estado:** Aceptado
**Fecha:** 2026-07-23
**Decisor:** Equipo del Recetario Inteligente

## Contexto

El Recetario Inteligente debe ofrecer la funcionalidad "¿Qué cocino hoy?": dado un
conjunto de ingredientes que el usuario tiene disponibles, recomendar recetas que
pueda preparar, rankeadas por porcentaje de coincidencia.

Existen dos enfoques arquitectónicos para implementar el matching:

1. **En el cliente (browser)**: cargar todas las recetas e ingredientes al iniciar la
   app, y ejecutar el algoritmo de matching en JavaScript cada vez que el usuario
   agrega o quita un ingrediente.

2. **En el servidor (PostgreSQL / Edge Function)**: enviar la lista de ingredientes
   disponibles al backend en cada cambio, y que una query SQL o una función de
   Postgres calcule el ranking y devuelva solo los resultados.

El catálogo actual es pequeño (10 recetas, 24 ingredientes, 64 relaciones). En un
escenario realista de un recetario casero o de un restaurante local, el catálogo no
excedería las pocas centenas de recetas.

## Decisión

Implementar el **matching en el cliente**. La SPA carga todas las recetas con sus
ingredientes en una única consulta al iniciar; el algoritmo `matchRecipes()` se
ejecuta en el navegador con `useMemo`, recalculando solo cuando cambia el set de
ingredientes seleccionados.

## Razonamiento

- **Latencia percibida**: al ejecutar en el cliente, el resultado es instantáneo
  (sub-milisegundo para <100 recetas). Cada round-trip al servidor añadiría 100-300ms
  de red, lo que degrada la experiencia de "escribo un ingrediente y veo resultados".
- **Simplicidad operacional**: no se necesita una Edge Function ni una RPC de
  Postgres. Menos superficie de fallo y menos puntos de depuración para la demo.
- **Carga de datos marginal**: una receta son ~200 bytes de JSON. 100 recetas = ~20KB,
  trivial frente al presupuesto de red de cualquier página web moderna.
- **Offline-friendly**: una vez cargado el catálogo, el matcher funciona sin red,
  útil para una demo en vivo donde la conexión puede ser inestable.
- **El catálogo es acotado y de lectura predominante**: las recetas cambian con muy
  baja frecuencia, lo que favorece un modelo de "cargar todo una vez y computar local".

## Consecuencias

### Positivas

- Respuesta instantánea al agregar/quitar ingredientes.
- Cero llamadas adicionales al backend durante la interacción.
- Código más simple: un solo módulo `matcher.ts` con lógica pura y testeable.
- Funciona offline después de la carga inicial.

### Negativas

- Si el catálogo creciera a miles de recetas, el payload inicial y el coste de
  cómputo en el cliente dejarían de ser triviales.
- La lógica de ranking no es reutilizable por otros clientes (no hay API de matching).

## Mitigación del riesgo de crecimiento

Si el catálogo supera ~500 recetas, se migrará el matching a una RPC de Postgres
(`match_recipes(ingredient_slugs text[])`) que devuelva solo las recetas con score > 0.
El contrato de la función `matchRecipes()` del cliente se mantiene idéntico, por lo
que el cambio sería transparente para la UI.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
| --- | --- |
| RPC de Postgres (`match_recipes`) | Sobre-ingeniería para 10 recetas. Complejidad SQL innecesaria para la demo. |
| Edge Function con Deno que reciba ingredientes y devuelva el ranking | Añade un hop de red y un despliegue extra sin beneficio a esta escala. |
| Embeddings + RAG (estilo LLM) | No aporta valor para un matcheo exacto de ingredientes; introduciría dependencia de un modelo externo y latencia. |

## Notas

Esta decisión se revisará si:
- El catálogo supera 500 recetas.
- Se requiere reutilizar el matcher desde otros clientes (mobile, API pública).
- Se añaden criterios de ranking más complejos (preferencias dietarias, tiempo límite, etc.).
