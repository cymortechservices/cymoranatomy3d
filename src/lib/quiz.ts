import type { Difficulty, Question, QuestionOption, UserAnswer } from '../types'

export interface QuizConfig {
  topic: 'all' | Question['topic']
  difficulty: 'any' | Difficulty
  count: number
  mode: 'timed' | 'untimed'
}

export interface QuizItem {
  question: Question
  /** Options shown to the learner (shuffled for mcq/identify; fixed order for true/false). */
  options: QuestionOption[]
  /** For match questions: the right-hand choices, shuffled. */
  rightChoices: string[]
}

export type Rng = () => number

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const normaliseAnswer = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(the|a|an) /, '')

/** Select, order and prepare questions for one attempt. Random but reproducible when an rng is given. */
export function buildQuiz(pool: Question[], config: QuizConfig, rng: Rng = Math.random): QuizItem[] {
  const filtered = pool.filter(
    (q) => (config.topic === 'all' || q.topic === config.topic) && (config.difficulty === 'any' || q.difficulty === config.difficulty),
  )
  return shuffle(filtered, rng)
    .slice(0, Math.max(1, config.count))
    .map((question) => ({
      question,
      options: question.type === 'tf' || question.type === 'label' ? question.options ?? [] : shuffle(question.options ?? [], rng),
      rightChoices: question.pairs ? shuffle(question.pairs.map((p) => p.right), rng) : [],
    }))
}

/** True when the answer is fully correct. Match and label questions are all-or-nothing. */
export function isCorrect(q: Question, answer: UserAnswer): boolean {
  if (answer === null || answer === undefined) return false
  switch (q.type) {
    case 'mcq':
    case 'tf':
    case 'identify':
      return typeof answer === 'string' && answer === q.correct
    case 'fill': {
      if (typeof answer !== 'string') return false
      const given = normaliseAnswer(answer)
      return !!given && (q.accepted ?? []).some((a) => normaliseAnswer(a) === given)
    }
    case 'match': {
      if (typeof answer !== 'object' || !q.pairs) return false
      return q.pairs.every((p) => (answer as Record<string, string>)[p.left] === p.right)
    }
    case 'label': {
      if (typeof answer !== 'object' || !q.pin_answers) return false
      return Object.entries(q.pin_answers).every(([pin, opt]) => (answer as Record<string, string>)[pin] === opt)
    }
    default:
      return false
  }
}

export interface QuizResult {
  total: number
  correct: number
  percent: number
  incorrectIds: string[]
  unanswered: number
}

export function scoreQuiz(items: QuizItem[], answers: Record<string, UserAnswer>): QuizResult {
  let correct = 0
  let unanswered = 0
  const incorrectIds: string[] = []
  for (const { question } of items) {
    const a = answers[question.id] ?? null
    if (a === null || (typeof a === 'string' && a.trim() === '') || (typeof a === 'object' && Object.keys(a).length === 0)) unanswered++
    if (isCorrect(question, a)) correct++
    else incorrectIds.push(question.id)
  }
  const total = items.length
  return { total, correct, percent: total ? Math.round((correct / total) * 100) : 0, incorrectIds, unanswered }
}

/** Time allowance for a timed quiz: 45 seconds per question. */
export const secondsForQuiz = (count: number) => count * 45

/** Human-readable correct answer, used on the review screen. */
export function correctAnswerText(item: { question: Question; options: QuestionOption[] }): string {
  const q = item.question
  switch (q.type) {
    case 'mcq':
    case 'tf':
    case 'identify':
      return (q.options ?? []).find((o) => o.id === q.correct)?.text ?? ''
    case 'fill':
      return (q.accepted ?? [])[0] ?? ''
    case 'match':
      return (q.pairs ?? []).map((p) => `${p.left} → ${p.right}`).join('; ')
    case 'label':
      return Object.entries(q.pin_answers ?? {}).map(([pin, opt]) => `${pin} = ${(q.options ?? []).find((o) => o.id === opt)?.text}`).join('; ')
  }
}

/** A fully correct answer for a question (used by tests and by the "show answer" review). */
export function correctAnswerValue(q: Question): UserAnswer {
  switch (q.type) {
    case 'mcq':
    case 'tf':
    case 'identify':
      return q.correct ?? null
    case 'fill':
      return (q.accepted ?? [])[0] ?? null
    case 'match':
      return Object.fromEntries((q.pairs ?? []).map((p) => [p.left, p.right]))
    case 'label':
      return { ...(q.pin_answers ?? {}) }
  }
}
