# Test report (final run)

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `eslint .` | clean |
| `vitest` unit tests | 30 / 30 passed |
| Playwright e2e (headless Chromium, software WebGL) | 36 / 36 passed |
| `vite build` | succeeds |
| SQL migrations + seed + RLS (`npm run validate:sql`, PGlite) | passed: cross-user reads/inserts blocked, students cannot edit content, admin can, self-promotion blocked, profiles auto-created |
| Model verification (`npm run verify:models`) | 15 / 15 bundles loaded and rendered non-blank in the real viewer; see `MODEL_VERIFICATION_REPORT.md` |

E2E covers intro sequence, navigation, laboratory (bundle load, selection, isolate, X-ray, search, missing-model retry fallback, phone size), search, quiz, bookmarks persistence, credits page.

**Not tested:** live Supabase (auth, storage, uploads, RLS on a real project), the Gemini edge function against the real API, Vercel deployment, real GPUs, physical mobile devices. Load times in the report come from software rendering and are only indicative.
