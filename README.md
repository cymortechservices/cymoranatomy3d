# CYMOR ANATOMY 3D

**Explore the Human Body. Understand Every Structure.**

Free educational 3D anatomy platform. Developed by Legendary Smiley Cymor · Powered by CymorTechServices · © CymorTechServices 2026.

Stack: React 19 + Vite + TypeScript + Tailwind + React Router + three.js / React Three Fiber / drei + Lucide. Backend: Supabase (Postgres, Auth, Storage, Edge Functions). AI tutor: Gemini through a Supabase Edge Function (key never reaches the browser). Hosting: Vercel.

## Quick start (demo mode, no accounts needed)

```bash
npm ci
npm run dev        # http://localhost:5173
```

With no `.env`, the app runs in **demo mode**: all content and models are bundled, progress/bookmarks stay in this browser only, the AI tutor is disabled with a clear message, and the admin panel is hidden.

## Real anatomy models

The viewer uses 15 Draco-compressed GLB bundles (2,871 meshes) built from **Z-Anatomy** (CC BY-SA 4.0), which itself derives from **BodyParts3D** (CC BY-SA 2.1 JP). Nothing is procedurally faked. Creators, licences, modifications and verification status are listed in-app on the **Credits & Sources** page and in:

- `docs/MODEL_VERIFICATION_REPORT.md`
- `docs/MODEL_LICENCE_REGISTER.md`
- `docs/MODEL_SOURCING.md`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | typecheck + production build |
| `npm run typecheck` / `lint` / `test` | static checks and unit tests |
| `npm run test:e2e` | Playwright tests (needs Chromium, see `docs/TEST_REPORT.md`) |
| `npm run verify:models` | loads every bundle in the real viewer and records a verification run |
| `npm run validate:sql` | applies the migrations to an in-process Postgres (PGlite) and tests RLS |
| `npm run seed:generate` | regenerates `supabase/seed.sql` from `src/data` |
| `npm run models:rebuild` | re-export models from Z-Anatomy (needs Blender `bpy`, see MODEL_SOURCING) |
| `npm run report:models` | regenerates the model reports |

## Documentation

`docs/INSTALL.md`, `SUPABASE_SETUP.md`, `GEMINI_SETUP.md`, `VERCEL_DEPLOY.md`, `ADMIN_SETUP.md`, `MODEL_SOURCING.md`, `MIGRATION_PLAN.md`, `TEST_REPORT.md`, `KNOWN_LIMITATIONS.md`, `ROADMAP.md`. Also `DEVELOPMENT_STATUS.md`.

## Medical disclaimer

Educational use only. Not a diagnostic or clinical tool. Not medical advice.
