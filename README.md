# Recetario Inteligente

Catálogo de recetas con asistente de IA integrado. Permite buscar recetas,
explorar ingredientes y preguntar al asistente "¿Qué cocino hoy?" para obtener
sugerencias o recetas nuevas generadas por IA.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Iconos**: lucide-react
- **Base de datos**: Supabase (PostgreSQL)
- **IA**: OpenRouter (Google Gemini Flash)

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Un proyecto de Supabase (gratuito en https://supabase.com)
- Una clave de API de OpenRouter (gratuita en https://openrouter.ai)

## Variables de entorno

El proyecto usa dos tipos de credenciales. Las del frontend son públicas por
diseño ( protegidas por RLS); las del backend nunca se exponen en el cliente.

### Frontend (archivo `.env`)

Copia `.env.example` a `.env` y completa estos valores:

| Variable | Dónde obtenerla | Descripción |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key | Clave pública, segura para el frontend (RLS la protege) |

### Backend (secreto de la Edge Function)

Esta clave **no** va en el archivo `.env`. Se configura directamente en Supabase:

| Variable | Dónde configurarla | Descripción |
|---|---|---|
| `OPENROUTER_API_KEY` | Supabase Dashboard → Edge Functions → Secrets | Clave de OpenRouter; la Edge Function la lee en el servidor con `Deno.env.get()`. Nunca se expone en el frontend. |

> **Seguridad**: la clave de OpenRouter vive únicamente en los secretos de la
> Edge Function. El frontend nunca la ve ni la envía; solo llama a la Edge
> Function, y esta la usa server-side para comunicarse con OpenRouter.

## Instalación y ejecución en Windows

### 1. Instalar Node.js

Descarga el instalador desde https://nodejs.org (versión LTS recomendada)
y ejecútalo. Verifica la instalación abriendo una terminal (PowerShell o CMD):

```powershell
node --version
npm --version
```

### 2. Clonar o descomprimir el proyecto

Si recibiste un ZIP, descomprímelo en una carpeta, por ejemplo:

```
C:\Proyectos\recetario-inteligente
```

Abre una terminal en esa carpeta:

```powershell
cd C:\Proyectos\recetario-inteligente
```

### 3. Instalar dependencias

```powershell
npm install
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y renómbralo:

```powershell
copy .env.example .env
```

Abre `.env` con un editor de texto y completa:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 5. Configurar la clave de OpenRouter

La clave de OpenRouter NO va en el archivo `.env`. Se configura como secreto
de la Edge Function en Supabase:

1. Ve a https://openrouter.ai, crea una cuenta y genera una API key.
2. Entra al Dashboard de Supabase de tu proyecto.
3. Ve a **Edge Functions → Secrets**.
4. Agrega un secreto llamado `OPENROUTER_API_KEY` con tu clave de OpenRouter.

### 6. Aplicar las migraciones de base de datos

Las migraciones están en la carpeta `supabase/migrations/`. Ejecútalas en
orden en el **SQL Editor** del Dashboard de Supabase:

1. `20260723045003_create_recetario_schema.sql`
2. `20260723045035_seed_recetario_data.sql`
3. `20260724222922_add_two_recipes.sql`
4. `20260724233913_add_eight_recipes.sql`
5. `20260724233913_add_lasagna_recipe.sql` (si existe)

### 7. Desplegar la Edge Function

La función del chat está en `supabase/functions/chat/index.ts`. Despliégala
desde el Dashboard de Supabase:

1. Ve a **Edge Functions → Deploy**.
2. Sube el archivo `supabase/functions/chat/index.ts`.
3. Asegúrate de que el secreto `OPENROUTER_API_KEY` esté configurado.

### 8. Ejecutar el proyecto en modo desarrollo

```powershell
npm run dev
```

Abre el navegador en `http://localhost:5173`.

### 9. Build de producción

```powershell
npm run build
```

Los archivos generados quedan en la carpeta `dist/`.

## Estructura del proyecto

```
recetario-inteligente/
├── src/
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind base
│   ├── components/
│   │   └── Chatbot.tsx         # Asistente de IA
│   └── lib/
│       ├── supabase.ts         # Cliente Supabase + tipos
│       ├── matcher.ts          # Algoritmo de matching
│       ├── chatbot.ts          # Lógica del chatbot
│       └── models.ts          # Modelo de IA (OpenRouter)
├── supabase/
│   ├── migrations/             # Migraciones SQL
│   └── functions/
│       └── chat/
│           └── index.ts        # Edge Function del chat
├── docs/
│   └── architecture/           # Diagramas C4 y ADR
├── .env.example                # Variables de entorno (ejemplo)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run lint` | Linter (ESLint) |
| `npm run preview` | Previsualizar build de producción |
