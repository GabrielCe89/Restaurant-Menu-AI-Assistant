import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Prompt del sistema del asistente de recetas
const SYSTEM_PROMPT = `Eres el asistente del "Recetario Inteligente", una aplicación web con un catálogo de recetas de cocina.

Tu función es ayudar al usuario con todo lo relacionado a cocina y recetas:
- Buscar recetas existentes por nombre o ingrediente
- Explicar los ingredientes o pasos de una receta del catálogo
- Sugerir recetas rápidas o fáciles
- CREAR recetas nuevas y originales cuando el usuario lo pida o cuando no haya coincidencias exactas en el catálogo
- Responder preguntas generales sobre cocina, técnicas, nutrición y combinaciones de ingredientes

A continuación se incluye:
1. RESULTADOS DE BÚSQUEDA LOCAL: recetas del catálogo que coinciden con la consulta del usuario (puede estar vacío).
2. CATÁLOGO COMPLETO: todas las recetas disponibles en la base de datos.

=== RESULTADOS DE BÚSQUEDA LOCAL ===
{{LOCAL_SEARCH_RESULTS}}

=== CATÁLOGO COMPLETO ===
{{RECIPES_CONTEXT}}

Instrucciones:
- Responde SIEMPRE en español, de forma clara, amable y bien estructurada.
- Si el usuario pregunta por una receta que EXISTE en el catálogo, usa esa información.
- Si el usuario te da ingredientes y te pide crear una receta, INVENTA una receta nueva y completa con título, ingredientes (con cantidades), pasos numerados, tiempo estimado, porciones y dificultad. No importa si no existe en el catálogo.
- Si no hay resultados locales pero el usuario pide recetas con ciertos ingredientes, primero menciona si hay algo parecido en el catálogo y luego crea una receta nueva si es pertinente.
- Si la pregunta no está relacionada con cocina o recetas, redirige amablemente al tema.
- Sé conciso pero completo. Usa listas y pasos numerados cuando sea útil.`;

interface ChatRequest {
  message: string;
  model: string;
  recipesContext: string;
  localSearchResults: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const { message, model, recipesContext, localSearchResults } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Falta el mensaje" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY no configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Modelo único configurado en el backend
    const MODEL = "google/gemini-2.0-flash-001";

    // Construir el prompt del sistema con el contexto inyectado
    const systemPrompt = SYSTEM_PROMPT
      .replace("{{LOCAL_SEARCH_RESULTS}}", localSearchResults || "No se encontraron recetas locales que coincidan.")
      .replace("{{RECIPES_CONTEXT}}", recipesContext || "No hay recetas disponibles.");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://recetario.bolt.new",
        "X-Title": "Recetario Inteligente",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Error de OpenRouter: ${response.status}`, detail: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "No se pudo generar una respuesta.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
