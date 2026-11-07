import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Box } from 'lucide-react'
import { Badge, Card, EmptyState, PageHeader } from '../components/common/ui'
import { SearchBox } from '../components/navigation/SearchBox'
import { STRUCTURES } from '../data/structures'
import { SYSTEMS } from '../data/systems'
import { REGIONS } from '../data/regions'
import { getOrgan } from '../data/organs'
import { atlasLinkFor } from '../lib/atlasLinks'

const chip = (active: boolean) => `rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? 'border-cyan-brand bg-cyan-brand/20 text-cyan-brand' : 'border-white/15 text-text-dim hover:border-cyan-brand/50'}`

export default function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const region = params.get('region') ?? ''
  const system = params.get('system') ?? ''
  const level = params.get('level') ?? ''

  const set = (key: string, value: string) => {
    const n = new URLSearchParams(params)
    if (!value || n.get(key) === value) n.delete(key)
    else n.set(key, value)
    setParams(n, { replace: true })
  }

  const list = STRUCTURES.filter((s) => (!region || s.region_id === region) && (!system || s.system_id === system) && (!level || s.difficulty_level === level))
  const regionsWithContent = REGIONS.filter((r) => STRUCTURES.some((s) => s.region_id === r.id))

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Explore" title="Explore the human body" subtitle="Whole body → body system → region → organ → structure. Filter below, or search for any structure." />
      <SearchBox onPick={(r) => nav(r.kind === 'structure' ? `/structure/${r.id}` : r.href)} className="max-w-xl" />

      <div className="space-y-3" aria-label="Filters">
        <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-xs text-text-dim">System</span>
          {SYSTEMS.filter((s) => STRUCTURES.some((x) => x.system_id === s.id)).map((s) => <button key={s.id} className={chip(system === s.id)} aria-pressed={system === s.id} onClick={() => set('system', s.id)}>{s.name.replace(' system', '')}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-xs text-text-dim">Region</span>
          {regionsWithContent.map((r) => <button key={r.id} className={chip(region === r.id)} aria-pressed={region === r.id} onClick={() => set('region', r.id)}>{r.name}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-xs text-text-dim">Difficulty</span>
          {['beginner', 'intermediate', 'advanced'].map((d) => <button key={d} className={chip(level === d)} aria-pressed={level === d} onClick={() => set('level', d)}>{d}</button>)}
        </div>
      </div>

      <p className="text-sm text-text-dim" aria-live="polite">{list.length} structure{list.length === 1 ? '' : 's'}{region && ` in ${REGIONS.find((r) => r.id === region)?.name}`}. Regions and systems without notes yet are not listed.</p>
      {list.length === 0 ? (
        <EmptyState title="No structures match these filters" body="Try removing a filter." action={{ to: '/explore', label: 'Clear filters' }} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <li key={s.id}>
              <Card className="flex h-full flex-col gap-2 !p-4">
                <Link to={`/structure/${s.id}`} className="font-display font-semibold text-white hover:text-cyan-brand">{s.anatomical_name}</Link>
                <p className="text-xs text-text-dim">{s.common_name} · {getOrgan(s.organ_id)?.name}</p>
                <div className="flex flex-wrap gap-1.5"><Badge tone="violet">{SYSTEMS.find((x) => x.id === s.system_id)?.name.replace(' system', '')}</Badge><Badge tone="slate">{s.difficulty_level}</Badge></div>
                {atlasLinkFor(s.id) && <Link to={`/laboratory?structure=${s.id}`} className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-cyan-brand hover:underline"><Box className="h-3.5 w-3.5" aria-hidden />View in 3D</Link>}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
