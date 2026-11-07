import type { QuizItem } from '../../lib/quiz'
import type { UserAnswer } from '../../types'
import { BoneDiagram, HeartDiagram } from './Diagrams'

interface Props {
  item: QuizItem
  answer: UserAnswer
  onChange: (a: UserAnswer) => void
  disabled?: boolean
}

const selectCls = 'w-full rounded-lg border border-white/15 bg-ink-800 px-2 py-2 text-sm text-text-main'

/** Renders one question of any of the six types. Answers are plain strings or {key: value} maps. */
export function QuestionView({ item, answer, onChange, disabled }: Props) {
  const q = item.question
  const map = (typeof answer === 'object' && answer !== null ? answer : {}) as Record<string, string>

  const choices = (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="sr-only">Choose one answer</legend>
      {item.options.map((o) => (
        <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${answer === o.id ? 'border-cyan-brand bg-cyan-brand/15 text-white' : 'border-white/10 bg-ink-800/60 hover:border-cyan-brand/40'}`}>
          <input type="radio" name={q.id} value={o.id} checked={answer === o.id} onChange={() => onChange(o.id)} className="h-4 w-4 accent-cyan-400" />
          {o.text}
        </label>
      ))}
    </fieldset>
  )

  switch (q.type) {
    case 'mcq':
    case 'tf':
      return choices
    case 'identify':
      return (
        <div className="space-y-4">
          {q.diagram === 'heart' ? <HeartDiagram highlightPin={q.highlight_pin} visiblePins={q.highlight_pin ? [q.highlight_pin] : undefined} /> : <BoneDiagram highlightPin={q.highlight_pin} visiblePins={q.highlight_pin ? [q.highlight_pin] : undefined} />}
          {choices}
        </div>
      )
    case 'fill':
      return (
        <div>
          <label htmlFor={`fill-${q.id}`} className="mb-1 block text-xs text-text-dim">Type the missing term</label>
          <input id={`fill-${q.id}`} type="text" disabled={disabled} value={typeof answer === 'string' ? answer : ''} onChange={(e) => onChange(e.target.value)} maxLength={80} autoComplete="off" autoCapitalize="none" spellCheck={false}
            className="w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-3 text-sm text-white focus:border-cyan-brand focus:outline-none" />
        </div>
      )
    case 'match':
      return (
        <ul className="space-y-3">
          {(q.pairs ?? []).map((p) => (
            <li key={p.left} className="grid gap-1.5 sm:grid-cols-[1fr_1.4fr] sm:items-center">
              <label htmlFor={`m-${q.id}-${p.left}`} className="text-sm font-medium text-white">{p.left}</label>
              <select id={`m-${q.id}-${p.left}`} disabled={disabled} value={map[p.left] ?? ''} onChange={(e) => onChange({ ...map, [p.left]: e.target.value })} className={selectCls}>
                <option value="">Choose…</option>
                {item.rightChoices.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )
    case 'label': {
      const pins = Object.keys(q.pin_answers ?? {})
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {q.diagram === 'heart' ? <HeartDiagram visiblePins={pins} answeredPins={Object.keys(map).filter((k) => map[k])} /> : <BoneDiagram visiblePins={pins} answeredPins={Object.keys(map).filter((k) => map[k])} />}
          <ul className="space-y-2.5">
            {pins.map((pin) => (
              <li key={pin} className="grid grid-cols-[2.2rem_1fr] items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-white/60 text-sm font-bold">{pin}</span>
                <label className="sr-only" htmlFor={`l-${q.id}-${pin}`}>Label for pin {pin}</label>
                <select id={`l-${q.id}-${pin}`} disabled={disabled} value={map[pin] ?? ''} onChange={(e) => onChange({ ...map, [pin]: e.target.value })} className={selectCls}>
                  <option value="">Choose…</option>
                  {item.options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }
}
