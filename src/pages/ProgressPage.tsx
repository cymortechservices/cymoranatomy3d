import { Card, EmptyState, PageHeader, ProgressBar } from '../components/common/ui'
import { DataModeBanner } from '../components/common/DataModeBanner'
import { useUserData } from '../contexts/UserDataContext'
import { LESSONS } from '../data/lessons'

const SUBJECTS = ['anatomy', 'physiology', 'histology', 'embryology'] as const

export default function ProgressPage() {
  const { completedLessons, attempts } = useUserData()
  const topics = Array.from(new Set(attempts.map((a) => a.topic)))
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Progress" title="Learning progress" subtitle="Real figures from your own activity: nothing is estimated or pre-filled." />
      <DataModeBanner />
      <Card className="space-y-4"><h2 className="font-display text-lg font-semibold text-white">Lessons completed</h2>
        {SUBJECTS.map((s) => { const all = LESSONS.filter((l) => l.subject === s); const d = all.filter((l) => completedLessons.includes(l.id)).length; return (
          <div key={s}><div className="mb-1 flex justify-between text-sm"><span className="capitalize">{s}</span><span className="text-text-dim">{d} of {all.length}</span></div><ProgressBar value={all.length ? (d / all.length) * 100 : 0} label={`${s} lessons completed`} /></div>) })}
      </Card>
      <Card className="space-y-3"><h2 className="font-display text-lg font-semibold text-white">Average by quiz topic</h2>
        {attempts.length === 0 ? <p className="text-sm text-text-dim">Take a quiz to see your results here.</p> : topics.map((t) => { const a = attempts.filter((x) => x.topic === t); const avg = Math.round(a.reduce((n, x) => n + x.percent, 0) / a.length); return (
          <div key={t}><div className="mb-1 flex justify-between text-sm"><span className="capitalize">{t}</span><span className="text-text-dim">{avg}% average · {a.length} attempt{a.length === 1 ? '' : 's'}</span></div><ProgressBar value={avg} label={`${t} quiz average`} /></div>) })}
      </Card>
      <Card className="space-y-2"><h2 className="font-display text-lg font-semibold text-white">Quiz history</h2>
        {attempts.length === 0 ? <EmptyState title="No attempts yet" body="Your quiz scores will be listed here." action={{ to: '/quiz', label: 'Start a quiz' }} /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="text-xs uppercase text-text-dim"><tr><th className="py-2">Date</th><th>Topic</th><th>Difficulty</th><th>Mode</th><th className="text-right">Score</th></tr></thead>
            <tbody>{attempts.map((a) => <tr key={a.id} className="border-t border-white/10"><td className="py-2">{new Date(a.taken_at).toLocaleString()}</td><td className="capitalize">{a.topic}</td><td className="capitalize">{a.difficulty}</td><td className="capitalize">{a.mode}</td><td className="text-right font-semibold text-white">{a.correct}/{a.total} ({a.percent}%)</td></tr>)}</tbody></table></div>
        )}
      </Card>
    </div>
  )
}
