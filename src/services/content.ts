import { supabase } from '../lib/supabase'
import { MODIFICATIONS, registerRemoteBundles, MODEL_BASE, type AtlasBundle, type Vec3 } from '../data/atlas'
import { ORGANS } from '../data/organs'
import { REGIONS } from '../data/regions'
import { STRUCTURES } from '../data/structures'
import { SYSTEMS } from '../data/systems'

type Row = { id: string }

function mergeById<T extends Row>(target: T[], incoming: T[]) {
  for (const row of incoming) {
    const i = target.findIndex((x) => x.id === row.id)
    if (i >= 0) target[i] = { ...target[i], ...stripNulls(row) }
    else target.push(row)
  }
}

const stripNulls = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined)) as T

/**
 * When Supabase is configured, rows in systems / regions / organs / structures override or extend the bundled
 * content (matched by id). Administrators edit those rows in the Admin page; changes appear after a reload.
 * Never throws: on any failure the bundled content is used.
 */
interface ModelRow {
  id: string; name: string; system_id: string | null; file_url: string | null; manifest_url: string | null; size_bytes: number | null
  mesh_count: number | null; tris_out: number | null; bbox: [Vec3, Vec3] | null; creator: string | null; source: string | null; source_url: string | null
  licence_name: string | null; licence_url: string | null; attribution: string | null; modified: boolean | null; modification_notes: string | null
  verification_status: 'verified' | 'unverified' | 'failed' | 'rejected' | null; verified_at: string | null
}

/** Admin-uploaded models become extra bundles. Rows without a GLB, manifest and bounding box cannot be displayed and are skipped. */
function toBundle(r: ModelRow): AtlasBundle | null {
  if (!r.file_url || !r.manifest_url || !r.bbox || r.verification_status === 'rejected') return null
  return {
    id: r.id, title: r.name, system: r.system_id ?? 'other', url: r.file_url, manifestUrl: r.manifest_url, bytes: r.size_bytes ?? 0,
    mesh_count: r.mesh_count ?? 0, tris_source: r.tris_out ?? 0, tris_out: r.tris_out ?? 0, decimation_ratio: 1, bbox: r.bbox, origin: 'uploaded',
    creator: r.creator ?? 'Not recorded', source: r.source ?? 'Not recorded', source_url: r.source_url ?? MODEL_BASE, licence: r.licence_name ?? 'Not recorded',
    licence_url: r.licence_url ?? '', attribution: r.attribution ?? '', modified: !!r.modified, modifications: r.modification_notes ?? (r.modified ? MODIFICATIONS : 'None recorded'),
    verification: { status: r.verification_status === 'verified' ? 'verified' : r.verification_status === 'failed' ? 'failed' : 'unverified', checked_at: r.verified_at ?? undefined },
  }
}

export async function loadRemoteContent(timeoutMs = 3500): Promise<{ source: 'bundled' | 'database'; merged: number }> {
  if (!supabase) return { source: 'bundled', merged: 0 }
  const client = supabase
  const run = async () => {
    const [sys, reg, org, str] = await Promise.all([
      client.from('systems').select('*'),
      client.from('regions').select('*'),
      client.from('organs').select('*'),
      client.from('structures').select('*'),
    ])
    let merged = 0
    const models = await client.from('anatomical_models').select('*')
    if (models.data) {
      const extra = (models.data as ModelRow[]).map(toBundle).filter((b): b is AtlasBundle => !!b)
      registerRemoteBundles(extra); merged += extra.length
    }
    if (sys.data) { mergeById(SYSTEMS, sys.data as never[]); merged += sys.data.length }
    if (reg.data) { mergeById(REGIONS, reg.data as never[]); merged += reg.data.length }
    if (org.data) { mergeById(ORGANS, org.data as never[]); merged += org.data.length }
    if (str.data) { mergeById(STRUCTURES, str.data as never[]); merged += str.data.length }
    return { source: 'database' as const, merged }
  }
  try {
    return await Promise.race([
      run(),
      new Promise<{ source: 'bundled'; merged: number }>((resolve) => setTimeout(() => resolve({ source: 'bundled', merged: 0 }), timeoutMs)),
    ])
  } catch {
    return { source: 'bundled', merged: 0 }
  }
}
