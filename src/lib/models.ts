// ============================================================
// Modelos de IA disponibles en el asistente del Recetario
// ============================================================
// Para AGREGAR un nuevo modelo: añade un objeto al arreglo MODELS
// con un id único, una etiqueta legible y el identificador exacto
// que usa OpenRouter en su campo `model`.
// Para QUITAR un modelo: elimina el objeto del arreglo.
// El primer modelo del arreglo se usa como predeterminado.
// ============================================================

export type AIModel = {
  id: string;
  label: string;
  openrouterModel: string;
};

export const MODELS: AIModel[] = [
  {
    id: 'gemini-flash',
    label: 'Google Gemini Flash',
    openrouterModel: 'google/gemini-2.0-flash-001',
  },
  {
    id: 'gpt-5',
    label: 'OpenAI GPT-5',
    openrouterModel: 'openai/gpt-5',
  },
  {
    id: 'claude-opus',
    label: 'Anthropic Claude Opus',
    openrouterModel: 'anthropic/claude-opus-4.1',
  },
  {
    id: 'deepseek-chat',
    label: 'DeepSeek Chat',
    openrouterModel: 'deepseek/deepseek-chat-v3.1:free',
  },
];

export const DEFAULT_MODEL_ID: string = MODELS[0].id;

export function getModelById(id: string | undefined | null): AIModel {
  if (!id) return MODELS[0];
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
