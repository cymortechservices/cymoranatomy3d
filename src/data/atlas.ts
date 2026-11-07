import catalogue from './atlas.catalogue.json'
import verification from './atlas.verification.json'

/**
 * ANATOMICAL ATLAS (real models)
 * --------------------------------
 * All built-in 3D anatomy comes from the Z-Anatomy atlas (CC BY-SA 4.0), itself derived from BodyParts3D.
 * `scripts/model-pipeline/` converts the original Blender file into the GLB bundles in public/models/zanatomy/.
 * One bundle = one GLB (Draco compressed) + one JSON manifest listing every mesh. Only the bundles a user opens
 * are downloaded. Admin-uploaded bundles (Supabase) use the same shape and appear alongside the built-in ones.
 */

export type Vec3 = [number, number, number]

export interface MeshRow {
  /** Stable id = glTF node name = mesh name in the GLB. */
  id: string
  name: string
  side: 'left' | 'right' | null
  /** Terminologia Anatomica Latin name from the source, when the English name matches it exactly. */
  latin?: string
  /** Nearest ancestor mesh in the same bundle (e.g. papillary muscle -> ventricle). */
  parent: string | null
  /** Group labels from the source hierarchy, outermost first. */
  group_path: string[]
  source_object: string
  source_material: string
  color: string
  tris_source: number
  tris_out: number
  bbox: [Vec3, Vec3] | null
}

export interface Manifest {
  bundle: string
  title: string
  system: string
  file: string
  bytes: number
  tris_source: number
  tris_out: number
  decimation_ratio: number
  meshes: MeshRow[]
}

export type VerificationStatus = 'verified' | 'unverified' | 'failed'
export interface Verification {
  status: VerificationStatus
  checked_at?: string
  load_ms?: number
  meshes_rendered?: number
  notes?: string
  thumb?: string
}

export interface AtlasBundle {
  id: string
  title: string
  system: string
  url: string
  manifestUrl: string
  bytes: number
  mesh_count: number
  tris_source: number
  tris_out: number
  decimation_ratio: number
  bbox: [Vec3, Vec3]
  sha256?: string
  latin_names?: number
  origin: 'builtin' | 'uploaded'
  /** Credits (always shown). */
  creator: string
  source: string
  source_url: string
  licence: string
  licence_url: string
  attribution: string
  modified: boolean
  modifications: string
  verification: Verification
}

const BASE = ((import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/').replace(/\/?$/, '/')
export const MODEL_BASE = `${BASE}models/zanatomy/`

export const Z_ANATOMY = {
  creator: 'Gauthier Kervyn (design, 3D, anatomy) and Marcin Zielinski (script), Z-Anatomy project',
  source: 'Z-Anatomy: the libre 3D atlas of anatomy',
  source_url: 'https://github.com/Z-Anatomy/Models-of-human-anatomy',
  site_url: 'https://www.z-anatomy.com/',
  licence: 'CC BY-SA 4.0',
  licence_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  attribution: '"Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0", based on "BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan".',
} as const

export const BODYPARTS3D = {
  creator: 'The Database Center for Life Science (DBCLS), Japan',
  source: 'BodyParts3D',
  source_url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/',
  download_url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html',
  licence: 'CC BY-SA 2.1 Japan (as stated in the Z-Anatomy repository licence file)',
  licence_url: 'https://creativecommons.org/licenses/by-sa/2.1/jp/',
} as const

export const MODIFICATIONS =
  'Converted from the Z-Anatomy Blender file to glTF by CymorTechServices: curves (vessels, nerves) converted to meshes, ' +
  'world transforms baked, triangle count reduced by collapse decimation, smooth shading applied, source node-shader materials ' +
  'replaced by a documented flat colour palette, Draco compression applied. No structures were added or invented.'

export const SYSTEM_LABEL: Record<string, string> = {
  skeletal: 'Skeletal system', muscular: 'Muscular system', cardiovascular: 'Cardiovascular system',
  respiratory: 'Respiratory system', digestive: 'Digestive system', urinary: 'Urinary system',
  reproductive: 'Reproductive system', endocrine: 'Endocrine system', lymphatic: 'Lymphatic system',
  nervous: 'Nervous system', sensory: 'Sense organs',
}

type RawBundle = (typeof catalogue)['bundles'][number]
const ver = verification as Record<string, Verification>

const toBundle = (b: RawBundle): AtlasBundle => ({
  id: b.id, title: b.title, system: b.system,
  url: `${MODEL_BASE}${b.file}`, manifestUrl: `${MODEL_BASE}${b.manifest}`,
  bytes: b.bytes, mesh_count: b.mesh_count, tris_source: b.tris_source, tris_out: b.tris_out, decimation_ratio: b.decimation_ratio,
  bbox: b.bbox as [Vec3, Vec3], sha256: b.sha256, latin_names: b.latin_names, origin: 'builtin',
  creator: Z_ANATOMY.creator, source: Z_ANATOMY.source, source_url: Z_ANATOMY.source_url,
  licence: Z_ANATOMY.licence, licence_url: Z_ANATOMY.licence_url, attribution: Z_ANATOMY.attribution,
  modified: true, modifications: MODIFICATIONS,
  verification: ver[b.id] ?? { status: 'unverified' },
})

const builtin: AtlasBundle[] = catalogue.bundles.map(toBundle)
let remote: AtlasBundle[] = []
const listeners = new Set<() => void>()

export const BUILTIN_BUNDLES = builtin
export const SKIPPED_SOURCE_OBJECTS = catalogue.skipped as { bundle: string; source_object: string; reason: string }[]

export function allBundles(): AtlasBundle[] { return [...builtin, ...remote] }
export function getBundle(id: string): AtlasBundle | undefined { return allBundles().find((b) => b.id === id) }
export function bundlesForSystem(system: string): AtlasBundle[] { return allBundles().filter((b) => b.system === system) }
export function subscribeBundles(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
export function registerRemoteBundles(rows: AtlasBundle[]) { remote = rows; listeners.forEach((f) => f()) }

/** Union bounding box of the whole built-in atlas: gives every bundle the same body coordinate frame and scale. */
export const BODY_BOX: [Vec3, Vec3] = (() => {
  const lo: Vec3 = [Infinity, Infinity, Infinity]; const hi: Vec3 = [-Infinity, -Infinity, -Infinity]
  for (const b of builtin) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], b.bbox[0][i]); hi[i] = Math.max(hi[i], b.bbox[1][i]) }
  return [lo, hi]
})()
const BODY_SIZE = Math.max(BODY_BOX[1][0] - BODY_BOX[0][0], BODY_BOX[1][1] - BODY_BOX[0][1], BODY_BOX[1][2] - BODY_BOX[0][2])
/** Scene scale: the whole body fits in a ~4 unit box. */
export const SCENE_SCALE = 4 / BODY_SIZE
export const SCENE_OFFSET: Vec3 = [0, 1, 2].map((i) => -((BODY_BOX[0][i] + BODY_BOX[1][i]) / 2) * SCENE_SCALE) as Vec3

/** Converts a point in source coordinates (metres) to scene coordinates. */
export const toScene = (p: Vec3): Vec3 => [p[0] * SCENE_SCALE + SCENE_OFFSET[0], p[1] * SCENE_SCALE + SCENE_OFFSET[1], p[2] * SCENE_SCALE + SCENE_OFFSET[2]]

export interface Preset { id: string; name: string; description: string; bundles: string[] }
export const PRESETS: Preset[] = [
  { id: 'heart', name: 'Heart and coronary vessels', description: 'Chambers, valve leaflets, papillary muscles, coronary arteries and cardiac veins.', bundles: ['heart'] },
  { id: 'heart-vessels', name: 'Heart with great vessels', description: 'Heart plus the arteries and veins of the body.', bundles: ['heart', 'vessels'] },
  { id: 'thorax', name: 'Thoracic organs', description: 'Heart, great vessels and respiratory system together.', bundles: ['heart', 'vessels', 'respiratory'] },
  { id: 'skeleton', name: 'Skeleton', description: 'All bones, cartilages and teeth of the atlas.', bundles: ['skeleton'] },
  { id: 'skeleton-joints', name: 'Skeleton with joints', description: 'Bones plus ligaments, discs and articular structures.', bundles: ['skeleton', 'joints'] },
  { id: 'muscles', name: 'Muscular system', description: 'Muscles, tendons and fasciae.', bundles: ['muscles'] },
  { id: 'musculoskeletal', name: 'Musculoskeletal system', description: 'Skeleton and muscles together (use X-ray mode to see through).', bundles: ['skeleton', 'muscles'] },
  { id: 'nervous', name: 'Nervous system', description: 'Brain, spinal cord and peripheral nerves.', bundles: ['cns', 'pns'] },
  { id: 'digestive', name: 'Digestive system', description: 'Mouth, canal, liver, gallbladder and pancreas.', bundles: ['digestive'] },
  { id: 'respiratory', name: 'Respiratory system', description: 'Nose, larynx, trachea, bronchial tree and lungs.', bundles: ['respiratory'] },
  { id: 'whole-body', name: 'Whole body (all systems)', description: 'Loads every bundle (about 8 MB). Use layers and X-ray to explore.', bundles: builtin.map((b) => b.id) },
]

// ---------------------------------------------------------------- manifests (lazy, cached)
const manifestCache = new Map<string, Promise<Manifest>>()
export function loadManifest(b: AtlasBundle): Promise<Manifest> {
  let p = manifestCache.get(b.id)
  if (!p) {
    p = fetch(b.manifestUrl).then((r) => { if (!r.ok) throw new Error(`Manifest ${b.manifestUrl} returned ${r.status}`); return r.json() as Promise<Manifest> })
    p.catch(() => manifestCache.delete(b.id))
    manifestCache.set(b.id, p)
  }
  return p
}
export function clearManifest(id: string) { manifestCache.delete(id) }

// ---------------------------------------------------------------- load timing (measured, shown to the user)
const loadStart = new Map<string, number>()
export const loadTimes = new Map<string, number>()
export const markLoadStart = (id: string) => { if (!loadTimes.has(id) && !loadStart.has(id)) loadStart.set(id, performance.now()) }
export const markLoadEnd = (id: string) => { const s = loadStart.get(id); if (s !== undefined && !loadTimes.has(id)) { loadTimes.set(id, Math.round(performance.now() - s)); loadStart.delete(id) } }
export const resetLoad = (id: string) => { loadTimes.delete(id); loadStart.delete(id) }

export const formatBytes = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)
export const meshLabel = (m: Pick<MeshRow, 'name' | 'side'>) => (m.side ? `${m.name} (${m.side})` : m.name)
