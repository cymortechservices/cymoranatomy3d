import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Tag } from 'lucide-react'
import type { PhysiologyAnimation } from '../../types'
import { currentStepIndex, useTimeline } from '../../hooks/useTimeline'
import { getStructure } from '../../data/structures'
import { useAtlasView } from '../viewer3d/useAtlasView'
import { cardiacState, heartAnimator, PHASE_LABEL } from '../../lib/cardiac'
import { Badge, Card, Notice, Spinner } from '../common/ui'
import { BreathingStage, CirculationStage, ElbowStage, PeristalsisStage, circulationStepFromT } from './Stages'

const AnatomyViewer = lazy(() => import('../viewer3d/AnatomyViewer'))
const SPEEDS = [0.25, 0.5, 1, 1.5, 2]

/** Generic player: timeline + play/pause/restart/speed/step controls around a stage chosen by animation kind. */
export function PhysiologyPlayer({ animation }: { animation: PhysiologyAnimation }) {
  const tl = useTimeline(animation.duration_s, true)
  const [labels, setLabels] = useState(true)
  const { t } = tl

  const stepIndex = useMemo(() => (animation.kind === 'circulation' ? circulationStepFromT(t) : currentStepIndex(animation.steps, t)), [animation, t])
  const step = animation.steps[stepIndex]
  const heart = useAtlasView(['heart'])
  const cs = animation.kind === 'cardiac' ? cardiacState(t) : null

  const goStep = (i: number) => {
    const n = (i + animation.steps.length) % animation.steps.length
    tl.pause()
    tl.seek(animation.steps[n].at + 0.002)
  }

  let stage: React.ReactNode
  switch (animation.kind) {
    case 'cardiac':
      stage = (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink-900/60">
          <Suspense fallback={<Spinner label="Loading 3D" />}>
            <AnatomyViewer view={heart.view} loading={heart.loading} error={heart.error} showLabels={labels} animator={heartAnimator} tRef={tl.tRef} />
          </Suspense>
          {cs && (
            <div className="pointer-events-none absolute left-2 top-2 space-y-1 rounded-lg bg-ink-950/80 p-2 text-[11px]" aria-live="polite">
              <p className="font-semibold text-white">{PHASE_LABEL[cs.phase]}</p>
              <p><span className={cs.avValvesOpen ? 'text-emerald-300' : 'text-rose-300'}>● AV valves {cs.avValvesOpen ? 'open' : 'closed'}</span></p>
              <p><span className={cs.semilunarValvesOpen ? 'text-emerald-300' : 'text-rose-300'}>● Aortic and pulmonary valves {cs.semilunarValvesOpen ? 'open' : 'closed'}</span></p>
            </div>
          )}
        </div>
      )
      break
    case 'circulation': stage = <CirculationStage t={t} stepIndex={stepIndex} />; break
    case 'breathing': stage = <BreathingStage t={t} />; break
    case 'joint': stage = <ElbowStage t={t} />; break
    case 'peristalsis': stage = <PeristalsisStage t={t} />; break
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" data-testid="physiology-player" data-animation={animation.id}>
      <div className="space-y-3">
        <Card className="!p-3">{stage}</Card>
        <Card className="!p-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Animation controls">
            <button onClick={tl.toggle} aria-label={tl.playing ? 'Pause' : 'Play'} className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-brand text-ink-950">
              {tl.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={tl.restart} aria-label="Restart" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 hover:border-cyan-brand"><RotateCcw className="h-4 w-4" /></button>
            <button onClick={() => goStep(stepIndex - 1)} aria-label="Previous step" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 hover:border-cyan-brand"><SkipBack className="h-4 w-4" /></button>
            <button onClick={() => goStep(stepIndex + 1)} aria-label="Next step" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 hover:border-cyan-brand"><SkipForward className="h-4 w-4" /></button>
            <label className="ml-auto flex items-center gap-2 text-xs text-text-dim">Speed
              <select value={tl.speed} onChange={(e) => tl.setSpeed(Number(e.target.value))} className="rounded-lg border border-white/15 bg-ink-800 px-2 py-1.5 text-text-main" aria-label="Playback speed">
                {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
              </select>
            </label>
            {animation.kind === 'cardiac' && (
              <button onClick={() => setLabels((l) => !l)} aria-pressed={labels} aria-label="Toggle labels" className={`grid h-10 w-10 place-items-center rounded-xl border ${labels ? 'border-cyan-brand text-cyan-brand' : 'border-white/15'}`}><Tag className="h-4 w-4" /></button>
            )}
          </div>
          <div className="mt-3">
            <label htmlFor={`tl-${animation.id}`} className="sr-only">Timeline</label>
            <input
              id={`tl-${animation.id}`} type="range" min={0} max={1000} value={Math.round(t * 1000)} className="w-full accent-cyan-400"
              onChange={(e) => { tl.pause(); tl.seek(Number(e.target.value) / 1000) }}
              aria-valuetext={`${Math.round(t * 100)} percent through the loop, step: ${step.title}`}
            />
            <div className="relative mt-1 h-4 text-[10px] text-text-dim" aria-hidden>
              {animation.steps.map((s, i) => <span key={s.title} className={`absolute -translate-x-1/2 whitespace-nowrap ${i === stepIndex ? 'text-cyan-brand' : ''}`} style={{ left: `${s.at * 100}%` }}>▲</span>)}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <Card>
          <div className="mb-1 flex items-center justify-between gap-2">
            <Badge>{`Step ${stepIndex + 1} of ${animation.steps.length}`}</Badge>
            <span className="text-[11px] text-text-dim">{tl.playing ? 'Playing' : 'Paused'} · {tl.speed}×</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
          <p className="mt-1 text-sm text-text-main" aria-live="polite">{step.description}</p>
          <ol className="mt-3 space-y-1 text-xs">
            {animation.steps.map((s, i) => (
              <li key={s.title}>
                <button onClick={() => goStep(i)} className={`w-full rounded-lg px-2 py-1.5 text-left ${i === stepIndex ? 'bg-cyan-brand/15 text-cyan-brand' : 'text-text-dim hover:bg-white/5'}`}>{i + 1}. {s.title}</button>
              </li>
            ))}
          </ol>
        </Card>
        {animation.structure_ids.length > 0 && (
          <Card>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Related anatomical structures</h4>
            <div className="flex flex-wrap gap-1.5">
              {animation.structure_ids.map((id) => <Link key={id} to={`/structure/${id}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-cyan-brand hover:text-cyan-brand">{getStructure(id)?.anatomical_name ?? id}</Link>)}
            </div>
          </Card>
        )}
        <Notice tone="warn" title="Simplifications in this demonstration">
          <ul className="ml-4 list-disc space-y-0.5">{animation.simplifications.map((s) => <li key={s}>{s}</li>)}</ul>
        </Notice>
      </div>
    </div>
  )
}
