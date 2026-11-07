import { allBundles, loadManifest, type MeshRow } from '../data/atlas'

export interface AtlasHit { row: MeshRow; bundle: string; score: number }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
let index: Promise<{ row: MeshRow; bundle: string; n: string; l: string }[]> | null = null

/** Loads every manifest once (about 1.5 MB of JSON, not the 3D files) the first time the user searches. */
export function loadAtlasIndex() {
  index ??= Promise.all(allBundles().map(async (b) => (await loadManifest(b)).meshes.map((row) => ({ row, bundle: b.id, n: norm(`${row.name} ${row.side ?? ''}`), l: norm(row.latin ?? '') })))).then((a) => a.flat())
  index.catch(() => { index = null })
  return index
}

export async function searchAtlas(raw: string, limit = 15): Promise<AtlasHit[]> {
  const q = norm(raw)
  if (q.length < 2) return []
  const tokens = q.split(' ')
  const idx = await loadAtlasIndex()
  const hits: AtlasHit[] = []
  for (const e of idx) {
    let total = 0
    for (const t of tokens) {
      const hay = `${e.n} ${e.l}`
      const s = e.n === q ? 100 : e.n.startsWith(t) ? 85 : e.n.split(' ').some((w) => w.startsWith(t)) ? 70 : hay.includes(t) ? 45 : 0
      if (!s) { total = 0; break }
      total += s
    }
    if (total) hits.push({ row: e.row, bundle: e.bundle, score: total / tokens.length - e.n.length * 0.05 })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}
