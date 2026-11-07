import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import { QUESTIONS } from '../../data/questions'
import { buildQuiz, correctAnswerText, isCorrect, scoreQuiz, secondsForQuiz, type QuizConfig, type QuizItem } from '../../lib/quiz'
import type { Difficulty, Question, QuizAttempt, UserAnswer } from '../../types'
import { Badge, Card, Notice, ProgressBar, buttonGhost, buttonPrimary } from '../common/ui'
import { QuestionView } from './QuestionView'
import { useUserData } from '../../contexts/UserDataContext'
import { getStructure } from '../../data/structures'

type Stage = 'setup' | 'run' | 'results'

const TOPICS: { id: QuizConfig['topic']; label: string }[] = [
  { id: 'all', label: 'All topics' }, { id: 'cardiovascular', label: 'Cardiovascular' }, { id: 'skeletal', label: 'Skeletal' }, { id: 'histology', label: 'Histology' },
]
const TYPE_LABEL: Record<Question['type'], string> = { mcq: 'Multiple choice', tf: 'True or false', match: 'Match', identify: 'Identify the part', label: 'Label the diagram', fill: 'Fill in the term' }

export function describeAnswer(item: QuizItem, a: UserAnswer): string {
  const q = item.question
  if (a === null || a === undefined || a === '' || (typeof a === 'object' && Object.keys(a).length === 0)) return 'No answer'
  if (typeof a === 'string') {
    if (q.type === 'fill') return a
    return item.options.find((o) => o.id === a)?.text ?? a
  }
  if (q.type === 'match') return Object.entries(a).map(([l, r]) => `${l} → ${r}`).join('; ')
  return Object.entries(a).map(([pin, opt]) => `${pin} = ${item.options.find((o) => o.id === opt)?.text ?? '?'}`).join('; ')
}

export function QuizRunner({ initialTopic = 'all' }: { initialTopic?: QuizConfig['topic'] }) {
  const { addAttempt, storageMode } = useUserData()
  const [config, setConfig] = useState<QuizConfig>({ topic: initialTopic, difficulty: 'any', count: 5, mode: 'untimed' })
  const [stage, setStage] = useState<Stage>('setup')
  const [items, setItems] = useState<QuizItem[]>([])
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({})
  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [attemptId, setAttemptId] = useState('')
  const finished = useRef(false)

  const available = useMemo(
    () => QUESTIONS.filter((q) => (config.topic === 'all' || q.topic === config.topic) && (config.difficulty === 'any' || q.difficulty === config.difficulty)).length,
    [config.topic, config.difficulty],
  )
  const effectiveCount = Math.min(config.count, available)

  const start = useCallback((subset?: Question[], keep?: QuizConfig) => {
    const cfg = keep ?? config
    const pool = subset ?? QUESTIONS
    const built = buildQuiz(pool, subset ? { ...cfg, topic: 'all', difficulty: 'any', count: subset.length } : cfg)
    if (built.length === 0) return
    finished.current = false
    setItems(built); setAnswers({}); setIndex(0); setAttemptId(`${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)
    setSecondsLeft(cfg.mode === 'timed' ? secondsForQuiz(built.length) : 0)
    setStage('run')
  }, [config])

  const result = useMemo(() => scoreQuiz(items, answers), [items, answers])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    const r = scoreQuiz(items, answers)
    const attempt: QuizAttempt = {
      id: attemptId, topic: config.topic, difficulty: config.difficulty, mode: config.mode,
      total: r.total, correct: r.correct, percent: r.percent, taken_at: new Date().toISOString(), incorrect_question_ids: r.incorrectIds,
    }
    addAttempt(attempt)
    setStage('results')
  }, [items, answers, attemptId, config, addAttempt])

  // countdown for timed mode
  useEffect(() => {
    if (stage !== 'run' || config.mode !== 'timed') return
    if (secondsLeft <= 0) { finish(); return }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [stage, config.mode, secondsLeft, finish])

  /* ---------------- setup ---------------- */
  if (stage === 'setup') {
    const seg = (active: boolean) => `rounded-xl border px-4 py-2.5 text-sm font-medium transition ${active ? 'border-cyan-brand bg-cyan-brand/20 text-cyan-brand' : 'border-white/15 text-text-dim hover:border-cyan-brand/50'}`
    return (
      <Card className="max-w-2xl space-y-5">
        <div><h2 className="font-display text-lg font-semibold text-white">Build your quiz</h2><p className="text-sm text-text-dim">Questions are drawn at random from {QUESTIONS.length} reviewed questions grounded in the study notes.</p></div>
        <fieldset><legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Topic</legend><div className="flex flex-wrap gap-2">{TOPICS.map((t) => <button key={t.id} aria-pressed={config.topic === t.id} onClick={() => setConfig({ ...config, topic: t.id })} className={seg(config.topic === t.id)}>{t.label}</button>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Difficulty</legend><div className="flex flex-wrap gap-2">{(['any', 'beginner', 'intermediate', 'advanced'] as const).map((d) => <button key={d} aria-pressed={config.difficulty === d} onClick={() => setConfig({ ...config, difficulty: d as 'any' | Difficulty })} className={`${seg(config.difficulty === d)} capitalize`}>{d}</button>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Number of questions</legend><div className="flex flex-wrap gap-2">{[5, 10, 15].map((n) => <button key={n} aria-pressed={config.count === n} onClick={() => setConfig({ ...config, count: n })} className={seg(config.count === n)}>{n}</button>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Mode</legend><div className="flex flex-wrap gap-2"><button aria-pressed={config.mode === 'untimed'} onClick={() => setConfig({ ...config, mode: 'untimed' })} className={seg(config.mode === 'untimed')}>Untimed</button><button aria-pressed={config.mode === 'timed'} onClick={() => setConfig({ ...config, mode: 'timed' })} className={seg(config.mode === 'timed')}>Timed (45 s per question)</button></div></fieldset>
        {available === 0 ? <Notice tone="warn">No questions match this topic and difficulty. Pick a different combination.</Notice>
          : effectiveCount < config.count && <Notice>Only {available} question{available === 1 ? '' : 's'} match, so the quiz will have {effectiveCount}.</Notice>}
        <button onClick={() => start()} disabled={available === 0} className={buttonPrimary} data-testid="start-quiz">Start quiz ({effectiveCount} question{effectiveCount === 1 ? '' : 's'})</button>
        <p className="text-xs text-text-dim">{storageMode === 'cloud' ? 'Your result will be saved to your account.' : 'Your result will be saved in this browser only.'}</p>
      </Card>
    )
  }

  /* ---------------- results ---------------- */
  if (stage === 'results') {
    const wrong = items.filter((it) => !isCorrect(it.question, answers[it.question.id] ?? null))
    const mm = result.percent >= 80 ? 'Excellent work.' : result.percent >= 50 ? 'Good progress. Review the explanations below.' : 'Keep practising. Read the notes, then retry.'
    return (
      <div className="space-y-5" data-testid="quiz-results">
        <Card className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-widest text-text-dim">Your score</p>
          <p className="font-display text-5xl font-bold text-white" data-testid="score">{result.correct}<span className="text-text-dim"> / {result.total}</span></p>
          <p className="text-lg text-cyan-brand" data-testid="percent">{result.percent}%</p>
          <ProgressBar value={result.percent} label="Score" />
          <p className="text-sm text-text-dim">{mm}{result.unanswered > 0 && ` ${result.unanswered} question${result.unanswered === 1 ? ' was' : 's were'} left unanswered.`}</p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button onClick={() => start()} className={buttonPrimary}><RotateCcw className="h-4 w-4" aria-hidden />Retry with new questions</button>
            {wrong.length > 0 && <button onClick={() => start(wrong.map((w) => w.question))} className={buttonGhost}>Retry {wrong.length} incorrect</button>}
            <button onClick={() => setStage('setup')} className={buttonGhost}>Change settings</button>
          </div>
        </Card>
        <h2 className="font-display text-lg font-semibold text-white">Review ({items.length})</h2>
        <ol className="space-y-3">
          {items.map((it, i) => {
            const a = answers[it.question.id] ?? null
            const ok = isCorrect(it.question, a)
            const s = it.question.structure_id ? getStructure(it.question.structure_id) : undefined
            return (
              <li key={it.question.id}>
                <Card className={`space-y-2 ${ok ? 'border-emerald-400/30' : 'border-rose-400/30'}`}>
                  <div className="flex items-start gap-2">{ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-label="Correct" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" aria-label="Incorrect" />}<p className="text-sm font-medium text-white">{i + 1}. {it.question.prompt}</p></div>
                  {!ok && <p className="text-sm"><span className="text-text-dim">Your answer:</span> <span className="text-rose-200">{describeAnswer(it, a)}</span></p>}
                  <p className="text-sm"><span className="text-text-dim">Correct answer:</span> <span className="text-emerald-200">{correctAnswerText(it)}</span></p>
                  <p className="text-sm text-text-main">{it.question.explanation}</p>
                  {s && <Link to={`/structure/${s.id}`} className="text-xs text-cyan-brand hover:underline">Study: {s.anatomical_name}</Link>}
                </Card>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  /* ---------------- run ---------------- */
  const item = items[index]
  const q = item.question
  const answered = items.filter((it) => { const a = answers[it.question.id]; return a && (typeof a === 'string' ? a.trim() !== '' : Object.keys(a).length > 0) }).length
  const mins = Math.floor(secondsLeft / 60), secs = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="max-w-2xl space-y-4" data-testid="quiz-run">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Badge>{TYPE_LABEL[q.type]}</Badge><Badge tone="slate">{q.difficulty}</Badge></div>
        {config.mode === 'timed' && <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${secondsLeft <= 30 ? 'text-rose-300' : 'text-cyan-brand'}`} role="timer" aria-label={`Time left ${mins} minutes ${secs} seconds`}><Clock className="h-4 w-4" aria-hidden />{mins}:{secs}</span>}
      </div>
      <ProgressBar value={((index + 1) / items.length) * 100} label={`Question ${index + 1} of ${items.length}`} />
      <Card className="space-y-4">
        <p className="text-xs text-text-dim">Question {index + 1} of {items.length} · {answered} answered</p>
        <h2 className="font-display text-lg font-semibold text-white">{q.prompt}</h2>
        <QuestionView item={item} answer={answers[q.id] ?? null} onChange={(a) => setAnswers((cur) => ({ ...cur, [q.id]: a }))} />
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button disabled={index === 0} onClick={() => setIndex(index - 1)} className={buttonGhost}>Previous</button>
        <div className="flex gap-2">
          {index < items.length - 1 && <button onClick={() => setIndex(index + 1)} className={buttonGhost}>Next</button>}
          <button
            onClick={() => { if (answered < items.length && !window.confirm(`${items.length - answered} question(s) are unanswered. Submit anyway?`)) return; finish() }}
            className={buttonPrimary} data-testid="submit-quiz"
          >Submit quiz</button>
        </div>
      </div>
    </div>
  )
}
