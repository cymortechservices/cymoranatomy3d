# Model verification report

Generated from `src/data/atlas.catalogue.json` and the automated run recorded in `src/data/atlas.verification.json` (`npm run verify:models`). Run date: 2026-11-06T20:57:38.485Z.

## Summary

| Item | Count |
|---|---|
| Geometry objects discovered in the Z-Anatomy source file | 3,913 |
| …of which in the body-system collections that were targeted | 2,896 |
| Not targeted (muscle attachment markers 705, body-region surfaces 257, reference planes/lines 51, bonus 4) | 1,017 |
| Meshes imported (selectable structures) | 2,871 |
| Bundles (GLB files) | 15 |
| Bundles loaded and checked in the real viewer | 15 of 15 |
| Meshes inside bundles that passed | 2,871 |
| Bundles awaiting verification | 0 |
| Source objects rejected for licence | 11 |
| Source objects rejected as unidentifiable | 1 |
| Total download if every bundle is opened | 8.27 MB |

## What "verified" means here

For each bundle the script opened the laboratory in headless Chromium (software WebGL), waited for the viewer to finish loading, then checked: the GLB and manifest downloaded; the number of meshes created in the scene equals the manifest; the viewport is not blank (non-background pixel ratio ≥ 1%); a structure picked from the list opens an information panel with the same name; hide / restore controls ran; no console or page errors. Orientation and scale were checked by eye on the thumbnails. It does **not** mean a clinician has reviewed anatomical accuracy, and the load times below are software-rendered, not representative of a real GPU.

## Per bundle

| Bundle | Meshes | Latin names | Triangles (source → shown) | GLB size | Load to ready* | Non-blank | Result |
|---|---|---|---|---|---|---|---|
| Skeletal system (`skeleton`) | 277 | 118 | 702,015 → 350,796 | 1.23 MB | 1460 ms | 9% | verified |
| Joints, ligaments and articular structures (`joints`) | 409 | 399 | 325,703 → 111,569 | 706 KB | 1084 ms | 6% | verified |
| Muscular system (`muscles`) | 593 | 579 | 2,151,116 → 340,779 | 1.54 MB | 1411 ms | 13% | verified |
| Fasciae (deep and superficial) (`fasciae`) | 76 | 76 | 157,219 → 71,030 | 276 KB | 1035 ms | 14% | verified |
| Heart, valves and coronary vessels (`heart`) | 28 | 27 | 276,360 → 139,976 | 367 KB | 1262 ms | 57% | verified |
| Arteries and veins (`vessels`) | 647 | 612 | 3,546,672 → 186,312 | 1.11 MB | 1108 ms | 7% | verified |
| Respiratory system (`respiratory`) | 36 | 36 | 143,028 → 129,957 | 327 KB | 1012 ms | 20% | verified |
| Digestive system (`digestive`) | 46 | 46 | 299,466 → 120,129 | 354 KB | 1025 ms | 11% | verified |
| Urinary system (`urinary`) | 4 | 4 | 11,964 → 11,964 | 23 KB | 1079 ms | 4% | verified |
| Genital system (male) (`reproductive`) | 14 | 14 | 19,523 → 19,523 | 53 KB | 1092 ms | 17% | verified |
| Endocrine glands (`endocrine`) | 10 | 10 | 11,308 → 11,308 | 40 KB | 1044 ms | 2% | verified |
| Lymphoid organs and lymph nodes (`lymphatic`) | 158 | 156 | 126,338 → 80,852 | 347 KB | 1090 ms | 2% | verified |
| Central nervous system (`cns`) | 282 | 227 | 699,564 → 259,612 | 1000 KB | 1492 ms | 6% | verified |
| Peripheral nervous system (`pns`) | 255 | 255 | 1,210,746 → 153,718 | 680 KB | 1190 ms | 4% | verified |
| Sense organs (eye and ear) (`sensory`) | 36 | 36 | 178,162 → 119,968 | 327 KB | 1073 ms | 19% | verified |

*Wall time from navigation to "viewer ready" in headless Chromium on a CPU-only container, including page boot (about 1 s of it). Every bundle was ready in under 1.6 s on localhost; real-world time depends on the network (largest single file: 1.54 MB).

## Largest assets

- Muscular system: 1.54 MB (593 meshes)
- Skeletal system: 1.23 MB (277 meshes)
- Arteries and veins: 1.11 MB (647 meshes)
- Central nervous system: 1000 KB (282 meshes)
- Joints, ligaments and articular structures: 706 KB (409 meshes)

No single bundle exceeds 2 MB. The library is never loaded as a whole unless the user chooses "Whole body".

## Models with incomplete mesh separation

- Every imported mesh is its own selectable object. No model in this build is a single fused mesh.
- Some source structures are grouped by the original authors (for example an entire gyrus rather than its sub-parts); the app cannot split what the source does not split.

## Missing anatomical categories (honest list)

- **Female anatomy**: the source atlas contains a male reference only. Female reproductive organs are not available.
- **Heart**: no interatrial or interventricular septum mesh, no chordae tendineae, no sinoatrial node, no complete mitral or tricuspid leaflet sets (only the leaflets the source provides: the right AV valve has inferior and septal leaflets, the left AV valve one posterior leaflet).
- **Respiratory**: no bronchioles, alveoli or pleura meshes; lung lobes are present.
- **Urinary**: kidneys excluded for licence reasons (see register).
- **Sense organs**: inner ear (cochlea, vestibule) excluded for licence reasons.
- **Brain**: white-matter models excluded (licence not stated).
- **Capillaries, neurons, cells**: not in the source atlas.
- **Histology**: no genuine 3D or microscopic models were available from the permitted sources. The histology pages use CYMOR's own labelled schematics and say so.
- **Skin / external body surface**: the body-region surfaces were not imported.
- **Muscle origins and insertions**: the 705 attachment markers were not imported.

## Models that need manual Blender correction

None were found to be unusable. Known cosmetic limits: colours are applied by a palette (the source materials are shader node groups with no portable colour); decimation can soften sharp edges on small bones; the source muscle layer includes tendon sheaths that are drawn pale.

## Rejected / not imported source objects

- `????????` (heart): unreadable source name (cannot be identified, so not imported)
- `Kidney.l` (urinary): licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution
- `Kidney.r` (urinary): licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution
- `Renal pelvis.l` (urinary): licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution
- `Renal pelvis.r` (urinary): licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution
- `White matter of telencephalon.l` (cns): licence: White-matter model from University of Washington: licence not stated in the Z-Anatomy repository
- `White matter of telencephalon.r` (cns): licence: White-matter model from University of Washington: licence not stated in the Z-Anatomy repository
- `White matter of spinal cord` (cns): licence: White-matter model from University of Washington: licence not stated in the Z-Anatomy repository
- `Vestibule.r` (sensory): licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike)
- `Vestibule.l` (sensory): licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike)
- `Cochlea.r` (sensory): licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike)
- `Cochlea.l` (sensory): licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike)
