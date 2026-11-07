# Model sourcing and pipeline

**Used:** Z-Anatomy `Startup.blend` (github.com/LluisV/Z-Anatomy), CC BY-SA 4.0, derived from BodyParts3D (CC BY-SA 2.1 JP, DBCLS). Obtained from the original repository only. LearnAnatomy3D was not scraped.

**Pipeline** (`scripts/model-pipeline/`): Blender-as-module (`bpy`, Python 3.11) loads the .blend, splits into 15 body-system bundles, quarantines objects whose licence conflicts or is unidentifiable (11 rejected, 1 unidentifiable – see licence register), applies a CYMOR colour palette (source materials have no portable colour), decimates to a per-bundle budget, exports Draco GLB, writes a JSON manifest per bundle, then `build_catalogue.py` writes `src/data/atlas.catalogue.json`.

Rebuild: obtain `Startup.blend`, create a venv with `bpy`, run `npm run models:rebuild` (see `run_all.sh`).

**Modifications** (disclosed in-app): merged into bundles, decimated, recoloured, re-oriented to glTF Y-up, scaled into a shared body frame, curves converted to meshes, Draco compressed.

**Not used directly:** BodyParts3D and NIH 3D were not downloaded separately (BodyParts3D content arrives through Z-Anatomy). To add an NIH 3D model: check its individual licence on the model page, export GLB, add it via Admin → Assets with creator/URL/licence filled in. Do not add models whose licence is unclear.
