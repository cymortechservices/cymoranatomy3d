# Known limitations (honest list)

- Anatomy is the Z-Anatomy male-based atlas. No female-specific models.
- Heart internals are partial; cardiac muscle and the sinoatrial node have no dedicated mesh.
- Excluded for licence/unidentifiable reasons: kidneys, inner ear and white-matter pieces (see licence register).
- BodyParts3D and NIH 3D were not fetched directly; no NIH 3D model is included.
- Histology is schematic only (no sourced histology models).
- Colours are a CYMOR palette, not the source colours.
- Supabase (auth, RLS, storage, uploads), Gemini and Vercel were **not tested live**. SQL/RLS was validated only in PGlite.
- Load times were measured in software WebGL (SwiftShader) in a headless browser, so they are not representative of real GPUs.
- Total payload is ~11 MB of models; bundles load on demand.
- Mobile touch interaction has not been tested on physical devices.
- Not a clinical tool.
