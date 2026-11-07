import { Link } from 'react-router-dom'
import { Badge, PageHeader } from '../components/common/ui'
import { SYSTEMS } from '../data/systems'
import { STRUCTURES } from '../data/structures'
import { LESSONS } from '../data/lessons'

export default function SystemsPage() {
  return (
    <div>
      <PageHeader eyebrow="Body systems" title="Body systems" subtitle="Twelve systems. Progress is shown honestly: only the cardiovascular and skeletal systems have full demonstration content; the rest are introductory." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SYSTEMS.map((s) => {
          const nStruct = STRUCTURES.filter((x) => x.system_id === s.id).length
          const nLess = LESSONS.filter((l) => l.system_id === s.id).length
          const has3D = s.bundle_ids.length > 0
          return (
            <li key={s.id}>
              <Link to={`/systems/${s.id}`} className="glass flex h-full flex-col gap-3 rounded-2xl p-5 transition hover:border-cyan-brand/50">
                <div className="flex items-start justify-between gap-2"><h2 className="font-display text-lg font-semibold text-white">{s.name}</h2><Badge tone={s.status === 'demonstration' ? 'green' : 'gold'}>{s.status === 'demonstration' ? 'Demonstration' : 'Introductory'}</Badge></div>
                <p className="text-sm text-text-dim">{s.summary}</p>
                <dl className="mt-auto grid grid-cols-3 gap-2 text-center text-[11px] text-text-dim">
                  <div className="rounded-lg bg-ink-800/70 p-2"><dt>Structures</dt><dd className="font-display text-base font-bold text-white">{nStruct}</dd></div>
                  <div className="rounded-lg bg-ink-800/70 p-2"><dt>Lessons</dt><dd className="font-display text-base font-bold text-white">{nLess}</dd></div>
                  <div className="rounded-lg bg-ink-800/70 p-2"><dt>3D model</dt><dd className="font-display text-base font-bold text-white">{has3D ? 'Yes' : 'None'}</dd></div>
                </dl>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
