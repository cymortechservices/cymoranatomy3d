import { Link, useParams } from 'react-router-dom'
import { Box } from 'lucide-react'
import NotFoundPage from './NotFoundPage'
import { Badge, Card, PageHeader, buttonPrimary } from '../components/common/ui'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { getOrgan } from '../data/organs'
import { getRegion } from '../data/regions'
import { getSystem } from '../data/systems'
import { getStructure } from '../data/structures'
import { LESSONS } from '../data/lessons'
import { atlasLinkFor } from '../lib/atlasLinks'

export default function OrganPage() {
  const { organId = '' } = useParams()
  const organ = getOrgan(organId)
  if (!organ) return <NotFoundPage what="organ" />
  const system = getSystem(organ.system_id)
  const region = getRegion(organ.region_id)
  const structures = organ.structure_ids.map(getStructure).filter(Boolean)
  const first = structures.find((s) => s && atlasLinkFor(s.id))
  const lessons = LESSONS.filter((l) => l.organ_id === organ.id)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Human body', to: '/explore' }, { label: system?.name.replace(' system', '') ?? '', to: `/systems/${organ.system_id}` }, { label: region?.name ?? '', to: `/explore?region=${organ.region_id}` }, { label: organ.name }]} />
      <PageHeader title={organ.name} subtitle={organ.description} actions={first && <Link to={`/laboratory?structure=${first.id}`} className={buttonPrimary}><Box className="h-4 w-4" aria-hidden />Open in 3D</Link>} />
      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white">Structures ({structures.length})</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {structures.map((s) => s && (
            <li key={s.id}><Link to={`/structure/${s.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-ink-800/60 px-3 py-2.5 text-sm hover:bg-ink-700/70"><span><span className="text-white">{s.anatomical_name}</span><span className="block text-xs text-text-dim">{s.classification}</span></span><Badge tone="slate">{s.difficulty_level}</Badge></Link></li>
          ))}
        </ul>
      </Card>
      {lessons.length > 0 && <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Lessons</h2><ul className="space-y-1.5">{lessons.map((l) => <li key={l.id}><Link to={`/study/${l.id}`} className="block rounded-lg bg-ink-800/60 px-3 py-2 text-sm hover:bg-ink-700/70">{l.title}</Link></li>)}</ul></Card>}
    </div>
  )
}
