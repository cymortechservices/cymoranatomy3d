import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Badge, Card, EmptyState, PageHeader } from '../components/common/ui'
import { LESSONS } from '../data/lessons'
import { SYSTEMS } from '../data/systems'
import { REGIONS } from '../data/regions'
import { ORGANS } from '../data/organs'
import { useUserData } from '../contexts/UserDataContext'

const chip = (a: boolean) => `rounded-full border px-3 py-1.5 text-xs font-medium ${a ? 'border-cyan-brand bg-cyan-brand/20 text-cyan-brand' : 'border-white/15 text-text-dim hover:border-cyan-brand/50'}`
const SUBJECTS = ['anatomy', 'physiology', 'histology', 'embryology'] as const

export default function StudyPage() {
  const [p, setP] = useSearchParams()
  const { completedLessons } = useUserData()
  const f = { subject: p.get('subject') ?? '', system: p.get('system') ?? '', region: p.get('region') ?? '', organ: p.get('organ') ?? '', level: p.get('level') ?? '' }
  const set = (k: string, v: string) => { const n = new URLSearchParams(p); if (!v || n.get(k) === v) n.delete(k); else n.set(k, v); setP(n, { replace: true }) }

  const list = LESSONS.filter((l) => (!f.subject || l.subject === f.subject) && (!f.system || l.system_id === f.system) && (!f.region || l.region_id === f.region) && (!f.organ || l.organ_id === f.organ) && (!f.level || l.difficulty === f.level))
  const row = (label: string, children: React.ReactNode) => <div className="flex flex-wrap items-center gap-2"><span className="w-20 shrink-0 text-xs text-text-dim">{label}</span>{children}</div>

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Study centre" title="Study centre" subtitle="Notes with learning objectives, summaries and revision exercises. Filter by subject, body system, region, organ and difficulty. Only categories that contain lessons are shown." />
      <div className="space-y-2.5">
        {row('Subject', SUBJECTS.map((s) => <button key={s} className={`${chip(f.subject === s)} capitalize`} aria-pressed={f.subject === s} onClick={() => set('subject', s)}>{s}</button>))}
        {row('System', SYSTEMS.filter((s) => LESSONS.some((l) => l.system_id === s.id)).map((s) => <button key={s.id} className={chip(f.system === s.id)} aria-pressed={f.system === s.id} onClick={() => set('system', s.id)}>{s.name.replace(' system', '')}</button>))}
        {row('Region', REGIONS.filter((r) => LESSONS.some((l) => l.region_id === r.id)).map((r) => <button key={r.id} className={chip(f.region === r.id)} aria-pressed={f.region === r.id} onClick={() => set('region', r.id)}>{r.name}</button>))}
        {row('Organ', ORGANS.filter((o) => LESSONS.some((l) => l.organ_id === o.id)).map((o) => <button key={o.id} className={chip(f.organ === o.id)} aria-pressed={f.organ === o.id} onClick={() => set('organ', o.id)}>{o.name}</button>))}
        {row('Difficulty', ['beginner', 'intermediate', 'advanced'].map((d) => <button key={d} className={`${chip(f.level === d)} capitalize`} aria-pressed={f.level === d} onClick={() => set('level', d)}>{d}</button>))}
      </div>
      <p className="text-sm text-text-dim" aria-live="polite">{list.length} lesson{list.length === 1 ? '' : 's'} · {completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length} of {LESSONS.length} completed</p>
      {list.length === 0 ? <EmptyState title="No lessons match" body="Try removing a filter." action={{ to: '/study', label: 'Clear filters' }} /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((l) => (
            <li key={l.id}>
              <Link to={`/study/${l.id}`} className="block h-full">
                <Card className="flex h-full flex-col gap-2 transition hover:border-cyan-brand/50">
                  <div className="flex items-start justify-between gap-2"><h2 className="font-display font-semibold text-white">{l.title}</h2>{completedLessons.includes(l.id) && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-label="Completed" />}</div>
                  <p className="text-sm text-text-dim">{l.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5"><Badge tone="cyan">{l.subject}</Badge><Badge tone="violet">{SYSTEMS.find((s) => s.id === l.system_id)?.name.replace(' system', '')}</Badge><Badge tone="slate">{l.difficulty}</Badge>{l.bundle_id && <Badge tone="gold">3D model</Badge>}</div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
