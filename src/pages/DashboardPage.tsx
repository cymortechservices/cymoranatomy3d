import { Link } from 'react-router-dom'
import { Bot, FlaskConical } from 'lucide-react'
import { Badge, Card, EmptyState, PageHeader, ProgressBar, buttonGhost, buttonPrimary } from '../components/common/ui'
import { DataModeBanner } from '../components/common/DataModeBanner'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../contexts/UserDataContext'
import { LESSONS } from '../data/lessons'
import { SYSTEMS } from '../data/systems'
import { getStructure } from '../data/structures'

export default function DashboardPage() {
  const { user, demoName } = useAuth()
  const { recent, bookmarks, completedLessons, attempts } = useUserData()
  const name = user?.display_name ?? (demoName || 'learner')
  const done = LESSONS.filter((l) => completedLessons.includes(l.id)).length
  const pct = Math.round((done / LESSONS.length) * 100)
  const next = LESSONS.find((l) => !completedLessons.includes(l.id))
  const recentSystems = new Set(recent.map((id) => getStructure(id)?.system_id))
  const recommended = LESSONS.filter((l) => !completedLessons.includes(l.id)).sort((a, b) => Number(recentSystems.has(b.system_id)) - Number(recentSystems.has(a.system_id)) || (a.difficulty === 'beginner' ? -1 : 1)).slice(0, 3)
  const guest = recent.length === 0 && bookmarks.length === 0 && completedLessons.length === 0 && attempts.length === 0

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title={`Welcome, ${name}`} subtitle={guest ? 'Here is a good place to start. Your activity will appear here as you learn.' : 'Pick up where you left off.'}
        actions={<><Link to="/laboratory" className={buttonPrimary}><FlaskConical className="h-4 w-4" aria-hidden />Open the 3D laboratory</Link><Link to="/tutor" className={buttonGhost}><Bot className="h-4 w-4" aria-hidden />AI tutor</Link></>} />
      <DataModeBanner />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-white">Continue learning</h2>
          {next ? (
            <Link to={`/study/${next.id}`} className="block rounded-xl bg-ink-800/70 p-4 hover:bg-ink-700/70"><p className="font-semibold text-white">{next.title}</p><p className="mt-1 text-sm text-text-dim">{next.summary}</p><div className="mt-2 flex gap-1.5"><Badge>{next.subject}</Badge><Badge tone="slate">{next.difficulty}</Badge></div></Link>
          ) : <p className="text-sm text-text-dim">You have completed every available lesson. More are on the roadmap.</p>}
          <div><div className="mb-1 flex justify-between text-xs text-text-dim"><span>Study progress</span><span>{done} of {LESSONS.length} lessons</span></div><ProgressBar value={pct} label="Lessons completed" /></div>
        </Card>
        <Card className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-white">Recent quiz performance</h2>
          {attempts.length === 0 ? <p className="text-sm text-text-dim">No quizzes taken yet. <Link to="/quiz" className="text-cyan-brand hover:underline">Try a 5-question quiz</Link>.</p> : (
            <ul className="space-y-1.5 text-sm">{attempts.slice(0, 4).map((a) => <li key={a.id} className="flex items-center justify-between rounded-lg bg-ink-800/60 px-3 py-2"><span className="capitalize">{a.topic}</span><span className="font-semibold text-white">{a.correct}/{a.total} · {a.percent}%</span></li>)}</ul>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Recently explored</h2>
          {recent.length === 0 ? <p className="text-sm text-text-dim">Structures you open in the laboratory will appear here.</p> : <div className="flex flex-wrap gap-1.5">{recent.slice(0, 8).map((id) => { const s = getStructure(id); return s ? <Link key={id} to={`/structure/${id}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-cyan-brand hover:text-cyan-brand">{s.anatomical_name}</Link> : null })}</div>}
        </Card>
        <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Saved structures</h2>
          {bookmarks.length === 0 ? <p className="text-sm text-text-dim">Use the bookmark button on any structure to save it here.</p> : <div className="flex flex-wrap gap-1.5">{bookmarks.slice(0, 8).map((id) => { const s = getStructure(id); return s ? <Link key={id} to={`/structure/${id}`} className="rounded-full border border-cyan-brand/40 px-2.5 py-1 text-xs text-cyan-brand hover:bg-cyan-brand/10">{s.anatomical_name}</Link> : null })}<Link to="/bookmarks" className="px-2 py-1 text-xs text-text-dim hover:text-white">All bookmarks →</Link></div>}
        </Card>
      </div>

      <Card className="space-y-3"><h2 className="font-display text-lg font-semibold text-white">{guest ? 'Recommended to start' : 'Recommended lessons'}</h2>
        {recommended.length === 0 ? <EmptyState title="All lessons completed" body="Nice work. Try a timed quiz to test yourself." action={{ to: '/quiz', label: 'Take a quiz' }} /> : <ul className="grid gap-3 md:grid-cols-3">{recommended.map((l) => <li key={l.id}><Link to={`/study/${l.id}`} className="block h-full rounded-xl bg-ink-800/60 p-3 text-sm hover:bg-ink-700/70"><span className="font-medium text-white">{l.title}</span><span className="mt-1 block text-xs capitalize text-text-dim">{l.subject} · {l.difficulty}</span></Link></li>)}</ul>}
      </Card>

      <Card className="space-y-3"><h2 className="font-display text-lg font-semibold text-white">Featured body systems</h2>
        <ul className="grid gap-3 sm:grid-cols-2">{SYSTEMS.filter((s) => s.status === 'demonstration').map((s) => <li key={s.id}><Link to={`/systems/${s.id}`} className="block rounded-xl bg-ink-800/60 p-3 hover:bg-ink-700/70"><span className="font-semibold text-white">{s.name}</span><span className="mt-1 block text-sm text-text-dim">{s.summary}</span></Link></li>)}</ul>
      </Card>
    </div>
  )
}
