# Install

Requirements: Node 20+ (tested on current Node), npm 10+.

```bash
unzip CYMOR-ANATOMY-3D-FINAL.zip && cd cymor-anatomy-3d
npm ci
cp .env.example .env     # optional; leave blank for demo mode
npm run dev
```

Production build: `npm run build` → `dist/`. Preview: `npm run preview`.

Environment variables (frontend, public, not secrets):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put the Supabase service-role key or the Gemini key in `.env` for the frontend; Gemini lives only in Edge Function secrets.
