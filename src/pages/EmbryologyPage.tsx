import { Link } from 'react-router-dom'
import { Badge, Card, Notice, PageHeader } from '../components/common/ui'
import { LESSONS } from '../data/lessons'

export default function EmbryologyPage() {
  const lessons = LESSONS.filter((l) => l.subject === 'embryology')
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Embryology" title="Embryology learning centre" subtitle="From fertilisation to the three germ layers, then the heart and the fetal circulation." />
      <Notice tone="warn" title="Early-stage content">Embryology currently has three text lessons with revision exercises. Illustrated and animated embryology is on the roadmap and is not part of this build.</Notice>
      <ul className="grid gap-4 md:grid-cols-3">
        {lessons.map((l) => (
          <li key={l.id}><Link to={`/study/${l.id}`} className="block h-full"><Card className="flex h-full flex-col gap-2 transition hover:border-cyan-brand/50">
            <h2 className="font-display font-semibold text-white">{l.title}</h2><p className="text-sm text-text-dim">{l.summary}</p>
            <div className="mt-auto flex gap-1.5"><Badge tone="slate">{l.difficulty}</Badge></div>
          </Card></Link></li>
        ))}
      </ul>
    </div>
  )
}
