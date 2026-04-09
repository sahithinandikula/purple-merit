# StyleSync

StyleSync is a full-stack web app for extracting lightweight design tokens from a website, refining them with lockable controls, and previewing the results instantly through CSS variables.

## Stack

- Frontend: React 18, Vite, Tailwind CSS, Zustand
- Backend: Node.js 18+, Express, Puppeteer
- Persistence: Supabase Postgres (`design_tokens` table)
- Deployment targets: Vercel (frontend), Render (backend)

## Features

- URL analysis flow with loading skeletons and clean error states
- Token extraction for `primary`, `secondary`, `background`, `fontFamily`, and `baseSize`
- Lockable token editor so re-scrapes preserve selected values
- Live preview panel driven entirely by CSS custom properties
- Optional persistence with `POST /tokens` and `GET /tokens/:id`
- Fallback tokens returned automatically when scraping fails

## Project Structure

```text
.
├─ frontend
│  └─ React app
├─ backend
│  └─ Express API
└─ package.json
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Supabase Schema

Create a table called `design_tokens`:

```sql
create extension if not exists "pgcrypto";

create table if not exists design_tokens (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  tokens jsonb not null,
  locked jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## Local Development

Install dependencies:

```bash
npm install
```

Run both apps:

```bash
npm run dev
```

Run individually:

```bash
npm --workspace backend run dev
npm --workspace frontend run dev
```

## API

### `POST /scrape`

Request:

```json
{ "url": "https://example.com" }
```

Response:

```json
{
  "colors": {
    "primary": "#000000",
    "secondary": "#ffffff",
    "background": "#f5f5f5"
  },
  "typography": {
    "fontFamily": "Inter",
    "baseSize": "16px"
  }
}
```

### `POST /tokens`

Persists tokens to Supabase.

### `GET /tokens/:id`

Retrieves a saved token payload from Supabase.

## Deployment Notes

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

### Backend on Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add all backend environment variables in the Render dashboard

## Demo Checklist

For the 2-3 minute walkthrough video:

- Enter a website URL
- Analyze and show extracted tokens
- Lock one or two values
- Re-analyze with a different site
- Edit tokens manually and show instant preview updates
- Save tokens to Supabase if configured
