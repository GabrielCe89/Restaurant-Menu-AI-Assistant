import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Prompt del sistema del asistente de recetas
const SYSTEM_PROMPT = `Eres el asistente del "Recetario Inteligente", una aplicación web con un catálogo de recetas de cocina.
Tu función es ayudar al usuario a:
- Buscar recetas por nombre o ingrediente
- Explicar los ingredientes o pasos de una receta
- Sugerir recetas rápidas o fáciles
- Responder preguntas generales sobre cocina

Contexto del catálogo de recetas disponible:
{{RECIPES_CONTEXT}}

Instrucciones:
- Responde SIEMPRE en español, de forma clara y amable.
- Si el usuario pregunta por una receta específica, usa la información del catálogo.
- Si la pregunta no está relacionada con recetas o cocina, redirige amablemente al tema.
- Sé conciso pero completo. Usa listas cuando sea útil.`;

interface ChatRequest {
  message: string;
  model: string;
  recipesContext: string;
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
    const { message, model, recipesContext } = body;

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

    // Construir el prompt del sistema con el contexto de recetas inyectado
    const systemPrompt = SYSTEM_PROMPT.replace(
      "{{RECIPES_CONTEXT}}",
      recipesContext || "No hay recetas disponibles.",
    );

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://recetario.bolt.new",
        "X-Title": "Recetario Inteligente",
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.0-flash-001",
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
