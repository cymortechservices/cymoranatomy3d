# Model source and licence register

| Source | Used? | Licence | Notes |
|---|---|---|---|
| Z-Anatomy (github.com/Z-Anatomy/Models-of-human-anatomy) | **Yes, all models** | CC BY-SA 4.0 | Creators: Gauthier Kervyn, Marcin Zielinski. Cloned over git; licence text read from the repository's License.txt. |
| BodyParts3D (dbarchive.biosciencedbc.jp) | **Indirectly**, through Z-Anatomy | CC BY-SA 2.1 Japan (per Z-Anatomy's licence file) | The download site was not reachable from the build environment, and Z-Anatomy already contains BodyParts3D-derived geometry, so it was not downloaded separately. Note: the task brief says CC BY 4.0; the licence text shipped with Z-Anatomy says CC BY-SA 2.1 Japan, and that stricter text is what this project follows. |
| NIH 3D (3d.nih.gov) | **No** | model-specific | The site was not reachable from the build environment; no NIH model was downloaded, inspected or included. Per-model licences must be checked before adding any (docs/MODEL_SOURCING.md). |
| LearnAnatomy3D (learnanatomy3d.com) | **No** | n/a | Used only as the reference for which original sources exist. No file was taken from it. |

## Third-party models inside Z-Anatomy with different licences (quarantined)

Z-Anatomy's licence file states that parts of the atlas come from other authors. Anything that does not allow redistribution under CC BY-SA 4.0, or whose licence is not stated, was left out:

| Source object | Reason |
|---|---|
| ???????? (heart) | unreadable source name (cannot be identified, so not imported) |
| Kidney.l (urinary) | licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution |
| Kidney.r (urinary) | licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution |
| Renal pelvis.l (urinary) | licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution |
| Renal pelvis.r (urinary) | licence: Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution |
| White matter of telencephalon.l (cns) | licence: White-matter model from University of Washington: licence not stated in the Z-Anatomy repository |
| White matter of telencephalon.r (cns) | licence: White-matter model from University of Washington: licence not stated in the Z-Anatomy repository |
| White matter of spinal cord (cns) | licence: White-matter model from University of Washington: licence not stated in the Z-Anatomy repository |
| Vestibule.r (sensory) | licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike) |
| Vestibule.l (sensory) | licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike) |
| Cochlea.r (sensory) | licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike) |
| Cochlea.l (sensory) | licence: Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike) |

## Per-bundle register

| Bundle | Creator | Source | Licence | Modified | SHA-256 of GLB |
|---|---|---|---|---|---|
| Skeletal system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `b5a7d3aa704207a9…` |
| Joints, ligaments and articular structures | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `d77b10416fabd9d6…` |
| Muscular system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `74daacb8e5dae2b4…` |
| Fasciae (deep and superficial) | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `d56869c73005bf92…` |
| Heart, valves and coronary vessels | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `d154a9a9b4896874…` |
| Arteries and veins | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `e24fb584f692ff0d…` |
| Respiratory system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `cb13e14d014599a3…` |
| Digestive system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `7718663f1f4803cc…` |
| Urinary system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `e4fc36530ddb5ef8…` |
| Genital system (male) | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `6a9560179c4c1985…` |
| Endocrine glands | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `125de9d5f6b61ee0…` |
| Lymphoid organs and lymph nodes | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `461a9211d4fb3713…` |
| Central nervous system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `cda4cc0782348ce0…` |
| Peripheral nervous system | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `3d68ef8a5f56fbd1…` |
| Sense organs (eye and ear) | Z-Anatomy project (G. Kervyn, M. Zielinski), built on BodyParts3D (DBCLS) | github.com/Z-Anatomy/Models-of-human-anatomy | CC BY-SA 4.0 | Yes: converted, decimated, recoloured | `7fa505912e5fecdd…` |

**Attribution to display:** "Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0", based on "BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan".

**Share-alike:** the converted files in `public/models/zanatomy/` are adaptations and must stay under CC BY-SA 4.0 when redistributed. The application's source code is MIT; the licence of the models does not change that, and vice versa.

**Modifications (all bundles):** converted from Blender to glTF 2.0; curves converted to meshes; world transforms baked into one shared body frame; triangle counts reduced by collapse decimation (per-bundle ratios in the catalogue); smooth shading; flat colour palette applied by CymorTechServices; Draco geometry compression; the ".g" 3D text labels and unreadable-name objects dropped. Nothing was added.
