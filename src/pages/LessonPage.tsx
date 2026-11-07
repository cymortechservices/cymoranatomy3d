import { useState } from 'react'
import { atlasLinkFor } from '../lib/atlasLinks'
import { Link, useParams } from 'react-router-dom'
import { Bot, Box, CheckCircle2, Download } from 'lucide-react'
import NotFoundPage from './NotFoundPage'
import { Badge, Card, buttonGhost, buttonPrimary } from '../components/common/ui'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { getLesson } from '../data/lessons'
import { getStructure } from '../data/structures'
import { getSystem } from '../data/systems'
import { useUserData } from '../contexts/UserDataContext'
import type { Lesson } from '../types'

const KIND_LABEL: Record<string, string> = { characteristics: 'Characteristics: what it is like', adaptations: 'Adaptations: how structure supports function', functions: 'Functions: what it does' }

function toMarkdown(l: Lesson): string {
  return [
    `# ${l.title}`, '', `*${l.subject} · ${l.difficulty} · CYMOR ANATOMY 3D, © CymorTechServices 2026*`, '', l.summary, '',
    '## Learning objectives', ...l.learning_objectives.map((o) => `- ${o}`), '',
    ...l.sections.flatMap((s) => [`## ${s.heading}`, ...s.body.map((b) => `- ${b}`), '']),
    '## Revision exercises', ...l.exercises.flatMap((e, i) => [`${i + 1}. ${e.question}`, `   - Answer: ${e.answer}`]), '',
    '## References', ...l.references.map((r) => `- ${r.title}, ${r.source}`), '',
  ].join('\n')
}

export default function LessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLesson(lessonId)
  const { completedLessons, toggleLesson } = useUserData()
  const [shown, setShown] = useState<Record<number, boolean>>({})
  if (!lesson) return <NotFoundPage what="lesson" />
  const done = completedLessons.includes(lesson.id)
  const system = getSystem(lesson.system_id)

  const download = () => {
    const url = URL.createObjectURL(new Blob([toMarkdown(lesson)], { type: 'text/markdown' }))
    const a = document.createElement('a'); a.href = url; a.download = `${lesson.id}.md`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <article className="space-y-5">
      <Breadcrumb items={[{ label: 'Study centre', to: '/study' }, { label: system?.name ?? '', to: `/systems/${lesson.system_id}` }, { label: lesson.title }]} />
      <header className="space-y-2">
        <div className="flex flex-wrap gap-1.5"><Badge>{lesson.subject}</Badge><Badge tone="slate">{lesson.difficulty}</Badge></div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{lesson.title}</h1>
        <p className="max-w-3xl text-sm text-text-dim">{lesson.summary}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={() => toggleLesson(lesson.id)} aria-pressed={done} className={done ? buttonGhost : buttonPrimary}><CheckCircle2 className="h-4 w-4" aria-hidden />{done ? 'Completed (undo)' : 'Mark as completed'}</button>
          {lesson.bundle_id && <Link to={`/laboratory?b=${lesson.bundle_id}${lesson.related_structure_ids[0] && atlasLinkFor(lesson.related_structure_ids[0]) ? `&structure=${lesson.related_structure_ids[0]}` : ''}`} className={buttonGhost}><Box className="h-4 w-4" aria-hidden />Related 3D model</Link>}
          <Link to={`/tutor?lesson=${lesson.id}`} className={buttonGhost}><Bot className="h-4 w-4" aria-hidden />Ask the tutor</Link>
          <button onClick={download} className={buttonGhost}><Download className="h-4 w-4" aria-hidden />Download notes (.md)</button>
        </div>
      </header>

      <Card><h2 className="font-display text-lg font-semibold text-white">Learning objectives</h2><ul className="mt-2 ml-5 list-disc space-y-1 text-sm">{lesson.learning_objectives.map((o) => <li key={o}>{o}</li>)}</ul></Card>

      {lesson.sections.map((s) => (
        <Card key={s.heading} className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">{s.heading}</h2>
          {s.kind && s.kind !== 'text' && <p className="text-xs italic text-cyan-brand">{KIND_LABEL[s.kind]}</p>}
          {s.body.length > 1 ? <ul className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed">{s.body.map((b) => <li key={b}>{b}</li>)}</ul> : <p className="text-sm leading-relaxed">{s.body[0]}</p>}
        </Card>
      ))}

      {lesson.related_structure_ids.length > 0 && (
        <Card><h2 className="font-display text-lg font-semibold text-white">Related structures</h2><div className="mt-2 flex flex-wrap gap-1.5">{lesson.related_structure_ids.map((id) => <Link key={id} to={`/structure/${id}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-cyan-brand hover:text-cyan-brand">{getStructure(id)?.anatomical_name ?? id}</Link>)}</div></Card>
      )}

      <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Revision exercises</h2>
        <ol className="space-y-2">{lesson.exercises.map((e, i) => (
          <li key={e.question} className="rounded-xl bg-ink-800/60 p-3 text-sm"><p className="text-white">{i + 1}. {e.question}</p>
            <button onClick={() => setShown((s) => ({ ...s, [i]: !s[i] }))} aria-expanded={!!shown[i]} className="mt-1 text-xs font-medium text-cyan-brand hover:underline">{shown[i] ? 'Hide answer' : 'Show answer'}</button>
            {shown[i] && <p className="mt-1 text-text-main">{e.answer}</p>}
          </li>))}</ol>
      </Card>
      <Card><h2 className="font-display text-sm font-semibold text-white">References</h2><ul className="mt-1 text-xs text-text-dim">{lesson.references.map((r) => <li key={r.title}>{r.title}, {r.source}{r.note ? `. ${r.note}` : ''}</li>)}</ul></Card>
    </article>
  )
}
