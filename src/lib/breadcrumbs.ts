import type { Crumb } from '../components/navigation/Breadcrumb'
import { getOrgan } from '../data/organs'
import { getRegion } from '../data/regions'
import { getStructure } from '../data/structures'
import { getSystem } from '../data/systems'

export function crumbsForStructure(structureId: string | null | undefined): Crumb[] {
  const base: Crumb[] = [{ label: 'Human body', to: '/explore' }]
  const s = structureId ? getStructure(structureId) : undefined
  if (!s) return base
  const system = getSystem(s.system_id)
  const region = getRegion(s.region_id)
  const organ = getOrgan(s.organ_id)
  return [
    ...base,
    ...(system ? [{ label: system.name.replace(' system', ''), to: `/systems/${system.id}` }] : []),
    ...(region ? [{ label: region.name, to: `/explore?region=${region.id}` }] : []),
    ...(organ ? [{ label: organ.name, to: `/organ/${organ.id}` }] : []),
    { label: s.anatomical_name, to: `/structure/${s.id}` },
  ]
}
