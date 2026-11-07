# Replacement plan (procedural → sourced models)

1. Backup of the previous build kept (`CYMOR-ANATOMY-3D-BACKUP-PRE-ATLAS.zip`, delivered separately).
2. Removed the procedural geometry, `ModelReference/AnatomicalModel/PartMapping/ModelLayer` types and per-organ primitives.
3. Added atlas bundles, manifests, loader, scene, selection/isolation/X-ray, search, guided exploration, on-demand loading and disposal.
4. Curated teaching content links to real meshes via `src/lib/atlasLinks.ts`. Two curated structures (cardiac muscle, sinoatrial node) have no mesh and are shown as such.
5. User data tables unchanged; `anatomical_models` extended with origin/licence metadata.
