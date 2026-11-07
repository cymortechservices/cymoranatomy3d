import { lazy, Suspense, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box, GraduationCap } from 'lucide-react'
import NotFoundPage from './NotFoundPage'
import { Badge, Card, Notice, PageHeader, Spinner, buttonGhost, buttonPrimary } from '../components/common/ui'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { HeartDiagram } from '../components/quizzes/Diagrams'
import { getSystem, SYSTEMS } from '../data/systems'
import { ORGANS } from '../data/organs'
import { STRUCTURES } from '../data/structures'
import { LESSONS } from '../data/lessons'
import { QUESTIONS } from '../data/questions'
import { useAtlasView } from '../components/viewer3d/useAtlasView'
import { isWebGLAvailable } from '../lib/webgl'
import { useSettings } from '../contexts/SettingsContext'

const AnatomyViewer = lazy(() => import('../components/viewer3d/AnatomyViewer'))

const List = ({ items }: { items: string[] }) => <ul className="ml-5 list-disc space-y-1 text-sm text-text-main">{items.map((i) => <li key={i}>{i}</li>)}</ul>

function Reveal({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="rounded-xl bg-ink-800/60 p-3 text-sm">
      <p className="text-white">{q}</p>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-1 text-xs font-medium text-cyan-brand hover:underline">{open ? 'Hide answer' : 'Show answer'}</button>
      {open && <p className="mt-1 text-text-main">{a}</p>}
    </li>
  )
}

export default function SystemDetailPage() {
  const { systemId = '' } = useParams()
  const system = getSystem(systemId)
  const { force2D } = useSettings()
  const overview = useAtlasView(system?.bundle_ids.slice(0, 1) ?? [])
  if (!system) return <NotFoundPage what="body system" />

  const organs = ORGANS.filter((o) => o.system_id === system.id)
  const structures = STRUCTURES.filter((s) => s.system_id === system.id)
  const lessons = LESSONS.filter((l) => l.system_id === system.id)
  const has3DModel = system.bundle_ids.length > 0
  const quizTopic = QUESTIONS.some((q) => q.topic === system.id) ? system.id : null
  const can3D = isWebGLAvailable() && !force2D

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Human body', to: '/explore' }, { label: 'Body systems', to: '/systems' }, { label: system.name }]} />
      <PageHeader
        title={system.name} subtitle={system.summary}
        actions={<>
          {has3DModel && <Link to={`/laboratory?b=${system.bundle_ids.join(',')}`} className={buttonPrimary}><Box className="h-4 w-4" aria-hidden />Open in 3D</Link>}
          {quizTopic && <Link to={`/quiz?topic=${quizTopic}`} className={buttonGhost}><GraduationCap className="h-4 w-4" aria-hidden />Quiz</Link>}
        </>}
      />
      {system.status === 'introductory' && <Notice tone="warn" title="Introductory content">This system has an introduction, functions and learning objectives, but a real 3D model from the atlas (where one exists), but detailed teaching notes for individual structures have not been written yet.</Notice>}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-3"><h2 className="font-display text-lg font-semibold text-white">Introduction</h2><p className="text-sm leading-relaxed text-text-main">{system.introduction}</p></Card>
        <Card className="!p-3">
          <h2 className="mb-2 px-1 font-display text-lg font-semibold text-white">Overview illustration</h2>
          {has3DModel ? (
            can3D ? <div className="aspect-[4/3] overflow-hidden rounded-xl bg-ink-900/60"><Suspense fallback={<Spinner />}><AnatomyViewer view={overview.view} loading={overview.loading} error={overview.error} autoRotate static /></Suspense></div>
              : system.id === 'cardiovascular' ? <HeartDiagram /> : <p className="p-4 text-sm text-text-dim">3D is off. Use the laboratory's 2D list to study this system.</p>
          ) : <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-text-dim">No overview illustration is available for this system yet.</p>}
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Major organs</h2>
          <ul className="flex flex-wrap gap-1.5">{system.major_organs.map((o) => { const org = organs.find((x) => x.name.toLowerCase() === o.toLowerCase()); return <li key={o}>{org ? <Link to={`/organ/${org.id}`} className="inline-block rounded-full border border-cyan-brand/40 px-2.5 py-1 text-xs text-cyan-brand hover:bg-cyan-brand/10">{o}</Link> : <span className="inline-block rounded-full border border-white/15 px-2.5 py-1 text-xs text-text-dim">{o}</span>}</li> })}</ul>
        </Card>
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Major structures</h2>
          <ul className="flex flex-wrap gap-1.5">{system.major_structures.map((n) => { const st = structures.find((x) => x.anatomical_name.toLowerCase().startsWith(n.toLowerCase()) || x.common_name.toLowerCase() === n.toLowerCase()); return <li key={n}>{st ? <Link to={`/structure/${st.id}`} className="inline-block rounded-full border border-cyan-brand/40 px-2.5 py-1 text-xs text-cyan-brand hover:bg-cyan-brand/10">{n}</Link> : <span className="inline-block rounded-full border border-white/15 px-2.5 py-1 text-xs text-text-dim">{n}</span>}</li> })}</ul>
          <p className="text-[11px] text-text-dim">Highlighted items have a full notes page.</p>
        </Card>
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Functions</h2><List items={system.functions} /></Card>
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Structural adaptations</h2><List items={system.structural_adaptations} /></Card>
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Physiological relationships</h2><List items={system.physiological_relationships} /></Card>
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Learning objectives</h2><List items={system.learning_objectives} /></Card>
      </div>

      <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Related systems</h2>
        <div className="flex flex-wrap gap-2">{system.related_systems.map((id) => { const r = SYSTEMS.find((s) => s.id === id); return r ? <Link key={id} to={`/systems/${id}`} className={buttonGhost}>{r.name}</Link> : null })}</div>
      </Card>

      {lessons.length > 0 && <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Lessons</h2><ul className="space-y-1.5">{lessons.map((l) => <li key={l.id}><Link to={`/study/${l.id}`} className="flex items-center justify-between rounded-lg bg-ink-800/60 px-3 py-2 text-sm hover:bg-ink-700/70"><span>{l.title}</span><Badge tone="slate">{l.subject}</Badge></Link></li>)}</ul></Card>}

      <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Revision questions</h2><ul className="space-y-2">{system.revision_questions.map((r) => <Reveal key={r.question} q={r.question} a={r.answer} />)}</ul></Card>
      <Card className="space-y-1"><h2 className="font-display text-lg font-semibold text-white">References</h2><ul className="text-xs text-text-dim">{system.references.map((r) => <li key={r.title}>{r.title}, {r.source}</li>)}</ul></Card>
    </div>
  )
}
