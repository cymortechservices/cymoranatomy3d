import type { MeshRow } from '../data/atlas'

/**
 * Links the curated teaching content (src/data/structures.ts) to real meshes in the atlas.
 * A structure maps to the meshes that genuinely represent it. A structure that has no matching mesh in the source
 * atlas (for example the sinoatrial node or cardiac muscle tissue) has NO link, and the app says so.
 */
export interface AtlasLink {
  bundle: string
  /** Exact mesh ids. */
  ids?: string[]
  /** Any mesh whose source group path contains this label. */
  group?: string
  /** Any mesh whose id matches. */
  idRegex?: RegExp
}

export const ATLAS_LINKS: Record<string, AtlasLink> = {
  'right-atrium': { bundle: 'heart', ids: ['right-atrium'] },
  'right-ventricle': { bundle: 'heart', ids: ['right-ventricle'] },
  'left-atrium': { bundle: 'heart', ids: ['left-atrium'] },
  'left-ventricle': { bundle: 'heart', ids: ['left-ventricle'] },
  'tricuspid-valve': { bundle: 'heart', ids: ['inferior-leaflet-of-right-atrioventricular-valve', 'septal-leaflet-of-right-atrioventricular-valve'] },
  'mitral-valve': { bundle: 'heart', ids: ['posterior-leaflet-of-left-atrioventricular-valve'] },
  'aortic-valve': { bundle: 'heart', group: 'Aortic valve' },
  'pulmonary-valve': { bundle: 'heart', group: 'Pulmonary valve' },
  'coronary-arteries': { bundle: 'heart', group: 'Arteries of heart' },
  aorta: { bundle: 'vessels', ids: ['ascending-aorta', 'aortic-arch', 'thoracic-aorta', 'abdominal-aorta'] },
  'pulmonary-trunk': { bundle: 'vessels', ids: ['pulmonary-trunk'] },
  'superior-vena-cava': { bundle: 'vessels', ids: ['superior-vena-cava'] },
  'inferior-vena-cava': { bundle: 'vessels', ids: ['inferior-vena-cava-thoracic-part', 'inferior-vena-cava-abdominal-part'] },
  'pulmonary-veins': { bundle: 'vessels', group: 'Pulmonary veins' },
  skull: { bundle: 'skeleton', group: 'Cranium' },
  'vertebral-column': { bundle: 'skeleton', group: 'Vertebral column' },
  'rib-cage': { bundle: 'skeleton', group: 'Thoracic skeleton' },
  sternum: { bundle: 'skeleton', ids: ['manubrium-of-sternum', 'body-of-sternum', 'xiphoid-process'] },
  clavicle: { bundle: 'skeleton', ids: ['clavicle-left', 'clavicle-right'] },
  scapula: { bundle: 'skeleton', ids: ['scapula-left', 'scapula-right'] },
  humerus: { bundle: 'skeleton', ids: ['humerus-left', 'humerus-right'] },
  radius: { bundle: 'skeleton', ids: ['radius-left', 'radius-right'] },
  ulna: { bundle: 'skeleton', ids: ['ulna-left', 'ulna-right'] },
  pelvis: { bundle: 'skeleton', ids: ['hip-bone-left', 'hip-bone-right', 'sacrum', 'coccyx'] },
  femur: { bundle: 'skeleton', ids: ['femur-left', 'femur-right'] },
  patella: { bundle: 'skeleton', ids: ['patella-left', 'patella-right'] },
  tibia: { bundle: 'skeleton', ids: ['tibia-left', 'tibia-right'] },
  fibula: { bundle: 'skeleton', ids: ['fibula-left', 'fibula-right'] },
}

/** Which bundle a curated structure lives in (static; no download needed). */
export const atlasLinkFor = (structureId: string): AtlasLink | undefined => ATLAS_LINKS[structureId]

/** Resolves a link to concrete mesh ids using the bundle's manifest. */
export function resolveLink(link: AtlasLink, meshes: readonly MeshRow[]): string[] {
  const out = new Set<string>()
  for (const m of meshes) {
    if (link.ids?.includes(m.id)) out.add(m.id)
    else if (link.group && m.group_path.includes(link.group)) out.add(m.id)
    else if (link.idRegex?.test(m.id)) out.add(m.id)
  }
  return [...out]
}

/** Reverse lookup: which curated structure (if any) a mesh belongs to. Most specific (fewest meshes) link wins. */
export function structureForMesh(bundle: string, mesh: MeshRow, meshes: readonly MeshRow[]): string | undefined {
  let best: { id: string; n: number } | undefined
  for (const [sid, link] of Object.entries(ATLAS_LINKS)) {
    if (link.bundle !== bundle) continue
    const hit = link.ids?.includes(mesh.id) || (link.group && mesh.group_path.includes(link.group)) || link.idRegex?.test(mesh.id)
    if (!hit) continue
    const n = resolveLink(link, meshes).length
    if (!best || n < best.n) best = { id: sid, n }
  }
  return best?.id
}
