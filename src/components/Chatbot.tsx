import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, ChefHat, Cpu } from 'lucide-react';
import type { RecipeWithIngredients } from '@/lib/supabase';
import { generateAIResponse, createMessage, type ChatMessage } from '@/lib/chatbot';
import { MODELS, DEFAULT_MODEL_ID } from '@/lib/models';

type ChatbotProps = {
  recipes: RecipeWithIngredients[];
  onSelectRecipe: (r: RecipeWithIngredients) => void;
};

export function Chatbot({ recipes, onSelectRecipe }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = useCallback(() => {
    return createMessage(
      'bot',
      '¡Hola! Soy el asistente del Recetario. Pregúntame sobre cualquier receta, '
        + 'sus ingredientes, sus pasos, o pídeme recetas rápidas o fáciles. '
        + '\n\nEscribe "ayuda" para ver todo lo que puedo hacer.',
    );
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([welcomeMessage()]);
    }
  }, [open, messages.length, welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg = createMessage('user', text);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    generateAIResponse(text, recipes, selectedModel)
      .then((response) => {
        const botMsg = createMessage('bot', response.text, response.recipeId);
        setMessages((prev) => [...prev, botMsg]);
      })
      .catch(() => {
        const botMsg = createMessage('bot', 'Lo siento, hubo un problema al procesar tu pregunta. Inténtalo de nuevo.');
        setMessages((prev) => [...prev, botMsg]);
      })
      .finally(() => setIsTyping(false));
  }, [input, recipes, selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      onSelectRecipe(recipe);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          open
            ? 'bg-stone-800 text-white rotate-90'
            : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-105'
        }`}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[min(520px,70vh)] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-stone-100 bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Asistente del Recetario</p>
              <p className="text-xs text-orange-50">Pregúntame sobre las recetas</p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-stone-700 shadow-sm border border-stone-100'
                  }`}
                >
                  {msg.text}
                  {msg.recipeId && (
                    <button
                      onClick={() => handleRecipeClick(msg.recipeId!)}
                      className="mt-2 block w-full rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100"
                    >
                      Ver receta completa
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm border border-stone-100">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-stone-100 bg-white p-3">
            {/* Selector de modelo de IA */}
            <div className="mb-2 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex-1 cursor-pointer rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-600 outline-none transition-all hover:border-stone-300 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta…"
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
