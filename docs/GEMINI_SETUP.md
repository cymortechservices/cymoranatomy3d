# Gemini AI tutor setup

The browser never sees the Gemini key. The tutor is the Edge Function `supabase/functions/tutor`.

```bash
supabase login
supabase link --project-ref <ref>
supabase secrets set GEMINI_API_KEY=<key from aistudio.google.com>
supabase secrets set GEMINI_MODEL=gemini-3.5-flash-lite      # optional; change if unavailable to you
supabase secrets set ALLOWED_ORIGIN=https://your-app.vercel.app
supabase secrets set TUTOR_RATE_LIMIT_PER_MINUTE=8           # optional
supabase functions deploy tutor
```

The function applies per-IP rate limiting, input length limits, an educational-only system prompt and a medical disclaimer, and maps upstream errors to clean messages. Model names change over time; if Gemini returns "model not found", set `GEMINI_MODEL` to a current model.

Status: not tested against the live Gemini API from the build environment (no key / network allowlist).
