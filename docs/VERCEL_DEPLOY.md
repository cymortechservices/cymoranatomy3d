# Vercel deployment

1. Push the project to a Git repository and import it in Vercel (framework: Vite).
2. Build command `npm run build`, output `dist` (already in `vercel.json`, which also adds SPA rewrites and long-cache headers for `/models/*`).
3. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (omit for demo mode).
4. Deploy. Add the Vercel URL to Supabase Auth redirect URLs and to `ALLOWED_ORIGIN`.

Status: `vite build` succeeds locally; an actual Vercel deploy was not performed.
