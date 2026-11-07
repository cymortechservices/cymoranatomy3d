# Supabase setup

1. Create a project at supabase.com.
2. SQL Editor → run, in order: `supabase/migrations/0001_schema.sql`, `supabase/migrations/0002_security.sql`, then `supabase/seed.sql`.
   (Or with the CLI: `supabase link --project-ref <ref>` then `supabase db push` and run the seed.)
3. Storage: migration 0002 creates the public-read, admin-write bucket `anatomical-models`. Check it exists under Storage.
4. Auth → URL configuration: add your Vercel URL and `http://localhost:5173` to redirect URLs. Email auth is used.
5. Settings → API: copy Project URL and anon key into `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (local `.env` and Vercel env vars).
6. Admin: see `ADMIN_SETUP.md`.

Security model: row-level security on every table; public content is readable by everyone; user data (progress, bookmarks, notes, quiz attempts, tutor sessions) is own-row only; writes to content and model tables require `is_admin()`; users cannot edit their own role.

Status: SQL was validated against an in-process Postgres (`npm run validate:sql`). It has **not** been run against a live Supabase project by the developer tooling.
