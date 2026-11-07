import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ZoomStep {
  id: string
  level: string
  title: string
  explanation: string
  scale: string
  /** Bundles to have loaded for this step. */
  bundles: string[]
  /** Mesh ids to highlight and focus. */
  select?: string[]
  xray?: boolean
  /** Opens this histology topic (a separate schematic illustration, never part of the 3D data). */
  tissue?: string
}

/** Guided path from the whole body down to tissue, using the real atlas meshes. */
export const CARDIO_ZOOM_STEPS: ZoomStep[] = [
  { id: 'body', level: 'Whole body', title: 'The skeleton as context', explanation: 'Start with the skeleton to see the whole body and where the thorax sits.', scale: 'Body level', bundles: ['skeleton'] },
  { id: 'system', level: 'Body system', title: 'Cardiovascular system', explanation: 'The cardiovascular system is the heart plus the arteries and veins. The heart and every vessel of the atlas are loaded.', scale: 'Organ-system level', bundles: ['heart', 'vessels'] },
  { id: 'region', level: 'Region', title: 'Thoracic region', explanation: 'The heart lies in the mediastinum behind the sternum, between the lungs. X-ray mode shows the ribs and lungs as ghosts around the highlighted heart.', scale: 'Regional anatomy', bundles: ['skeleton', 'respiratory', 'heart'], xray: true, select: ['right-atrium', 'right-ventricle', 'left-atrium', 'left-ventricle'] },
  { id: 'organ', level: 'Organ', title: 'Heart', explanation: 'A four-chambered pump. Rotate the model, toggle labels, and hide structures to look at the coronary vessels and valve leaflets.', scale: 'Organ level', bundles: ['heart'] },
  { id: 'structure', level: 'Structure', title: 'Left ventricle', explanation: 'The thick-walled chamber that pumps blood into the aorta. Its papillary muscle is a separate mesh in the source atlas.', scale: 'Structure level', bundles: ['heart'], select: ['left-ventricle'] },
  { id: 'tissue', level: 'Tissue', title: 'Cardiac muscle', explanation: 'The ventricle wall is cardiac muscle. Microscopic detail is not part of the 3D data, so the next step opens a separate illustration.', scale: 'Tissue level (separate illustration)', bundles: ['heart'], select: ['left-ventricle'] },
  { id: 'histology', level: 'Histology view', title: 'Histology view', explanation: 'A schematic of muscle tissue types with zoom and pan. This is a drawing, not a microscope slide.', scale: 'Microscopic (schematic, no real magnification)', bundles: ['heart'], tissue: 'muscle' },
]

interface Props {
  steps: ZoomStep[]
  index: number
  onGo: (index: number) => void
}

export function GuidedZoom({ steps, index, onGo }: Props) {
  const step = steps[index]
  return (
    <section aria-label="Guided anatomical zoom" className="space-y-3">
      <ol className="flex flex-wrap gap-1">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => onGo(i)}
              aria-current={i === index ? 'step' : undefined}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${i === index ? 'bg-cyan-brand text-ink-950' : i < index ? 'bg-cyan-brand/20 text-cyan-brand' : 'bg-white/5 text-text-dim hover:bg-white/10'}`}
            >
              {i + 1}. {s.level}
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-xl bg-ink-800/70 p-3">
        <p className="font-display text-base font-semibold text-white">{step.title}</p>
        <p className="mt-1 text-sm text-text-main">{step.explanation}</p>
        <p className="mt-2 text-xs text-gold-brand">Scale: {step.scale}</p>
      </div>
      <div className="flex justify-between gap-2">
        <button disabled={index === 0} onClick={() => onGo(index - 1)} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden />Back</button>
        <button disabled={index === steps.length - 1} onClick={() => onGo(index + 1)} className="inline-flex items-center gap-1 rounded-lg bg-cyan-brand px-3 py-1.5 text-sm font-semibold text-ink-950 disabled:opacity-40">Zoom in<ChevronRight className="h-4 w-4" aria-hidden /></button>
      </div>
    </section>
  )
}
