import { Link, useSearchParams } from 'react-router-dom'
import { Card, PageHeader } from '../components/common/ui'
import { PhysiologyPlayer } from '../components/physiology/PhysiologyPlayer'
import { ANIMATIONS } from '../data/animations'
import { LESSONS } from '../data/lessons'

export default function PhysiologyPage() {
  const [p, setP] = useSearchParams()
  const anim = ANIMATIONS.find((a) => a.id === p.get('animation')) ?? ANIMATIONS[0]
  const lessons = LESSONS.filter((l) => l.subject === 'physiology')
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Physiology" title="Physiology learning centre" subtitle={anim.summary} />
      <div role="tablist" aria-label="Animations" className="flex flex-wrap gap-2">
        {ANIMATIONS.map((a) => <button key={a.id} role="tab" aria-selected={a.id === anim.id} onClick={() => setP({ animation: a.id }, { replace: true })} className={`rounded-full border px-3.5 py-1.5 text-sm ${a.id === anim.id ? 'border-cyan-brand bg-cyan-brand/20 text-cyan-brand' : 'border-white/15 text-text-dim hover:border-cyan-brand/50'}`}>{a.title}</button>)}
      </div>
      <PhysiologyPlayer key={anim.id} animation={anim} />
      <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Physiology notes</h2>
        <ul className="space-y-1.5">{lessons.map((l) => <li key={l.id}><Link to={`/study/${l.id}`} className="block rounded-lg bg-ink-800/60 px-3 py-2 text-sm hover:bg-ink-700/70">{l.title}</Link></li>)}</ul>
        <p className="text-xs text-text-dim">Not yet included: sarcomere-level muscle contraction, digestive-tract 3D models and respiratory 3D models. The demonstrations above are labelled simplifications.</p>
      </Card>
    </div>
  )
}
