import { ORGANS } from '../data/organs'
import { REGIONS } from '../data/regions'
import { STRUCTURES } from '../data/structures'
import { SYSTEMS } from '../data/systems'

export interface SearchResult {
  kind: 'structure' | 'organ' | 'system' | 'region'
  id: string
  label: string
  detail: string
  href: string
  score: number
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

function scoreText(query: string, text: string, exact = 100, starts = 80, includes = 55): number {
  const t = norm(text)
  if (!t) return 0
  if (t === query) return exact
  if (t.startsWith(query)) return starts
  if (t.split(' ').some((w) => w.startsWith(query))) return starts - 10
  if (t.includes(query)) return includes
  return 0
}

/**
 * Search anatomical names, common names, synonyms, systems, regions and organs.
 * Every token of the query must match somewhere (AND semantics) to avoid noisy results.
 */
export function searchAnatomy(rawQuery: string, limit = 12): SearchResult[] {
  const query = norm(rawQuery)
  if (query.length < 2) return []
  const tokens = query.split(' ')
  const results: SearchResult[] = []

  const test = (fields: string[]): number => {
    let total = 0
    for (const token of tokens) {
      let best = 0
      for (const f of fields) best = Math.max(best, scoreText(token, f))
      if (best === 0) return 0
      total += best
    }
    // bonus for a whole-phrase match on the first field (the primary name)
    return total / tokens.length + scoreText(query, fields[0], 20, 10, 5)
  }

  for (const s of STRUCTURES) {
    const system = SYSTEMS.find((x) => x.id === s.system_id)?.name ?? ''
    const region = REGIONS.find((x) => x.id === s.region_id)?.name ?? ''
    const score = test([s.anatomical_name, s.common_name, ...s.synonyms, system, region])
    if (score > 0) results.push({ kind: 'structure', id: s.id, label: s.anatomical_name, detail: `${s.common_name} · ${system}`, href: `/structure/${s.id}`, score })
  }
  for (const o of ORGANS) {
    const system = SYSTEMS.find((x) => x.id === o.system_id)?.name ?? ''
    const score = test([o.name, system])
    if (score > 0) results.push({ kind: 'organ', id: o.id, label: o.name, detail: `Organ · ${system}`, href: `/organ/${o.id}`, score: score - 1 })
  }
  for (const s of SYSTEMS) {
    const score = test([s.name, ...s.major_organs])
    if (score > 0) results.push({ kind: 'system', id: s.id, label: s.name, detail: 'Body system', href: `/systems/${s.id}`, score: score - 2 })
  }
  for (const r of REGIONS) {
    const score = test([r.name])
    if (score > 0) results.push({ kind: 'region', id: r.id, label: r.name, detail: 'Anatomical region', href: `/explore?region=${r.id}`, score: score - 2 })
  }
  return results.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label)).slice(0, limit)
}
