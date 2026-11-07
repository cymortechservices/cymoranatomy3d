/**
 * Pure model of the schematic cardiac cycle used by the 3D animation (t in 0..1 loops).
 * Phases (proportional, simplified): atrial systole 0-0.12, isovolumetric contraction 0.12-0.17,
 * ejection 0.17-0.50, isovolumetric relaxation 0.50-0.57, ventricular filling 0.57-1.00.
 */
export type CardiacPhase = 'atrial-systole' | 'isovolumetric-contraction' | 'ejection' | 'isovolumetric-relaxation' | 'filling'

const ease = (x: number) => x * x * (3 - 2 * x)
const lerp = (a: number, b: number, x: number) => a + (b - a) * x
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export interface CardiacState {
  phase: CardiacPhase
  atrialScale: number
  ventricleScale: number
  vesselPulse: number
  avValvesOpen: boolean
  semilunarValvesOpen: boolean
}

export function cardiacState(tIn: number): CardiacState {
  const t = ((tIn % 1) + 1) % 1
  let phase: CardiacPhase
  let ventricleScale: number
  if (t < 0.12) { phase = 'atrial-systole'; ventricleScale = lerp(0.98, 1.02, t / 0.12) }
  else if (t < 0.17) { phase = 'isovolumetric-contraction'; ventricleScale = 1.02 }
  else if (t < 0.5) { phase = 'ejection'; ventricleScale = lerp(1.02, 0.8, ease((t - 0.17) / 0.33)) }
  else if (t < 0.57) { phase = 'isovolumetric-relaxation'; ventricleScale = 0.8 }
  else { phase = 'filling'; ventricleScale = lerp(0.8, 0.98, ease(clamp01((t - 0.57) / 0.43))) }

  let atrialScale: number
  if (t < 0.12) atrialScale = lerp(1.0, 0.86, ease(t / 0.12))
  else if (t < 0.57) atrialScale = lerp(0.86, 1.08, ease((t - 0.12) / 0.45))
  else atrialScale = lerp(1.08, 1.0, ease((t - 0.57) / 0.43))

  const vesselPulse = t >= 0.17 && t < 0.5 ? 1 + 0.06 * Math.sin(((t - 0.17) / 0.33) * Math.PI) : 1

  return {
    phase, atrialScale, ventricleScale, vesselPulse,
    avValvesOpen: t < 0.12 || t >= 0.57,
    semilunarValvesOpen: t >= 0.17 && t < 0.5,
  }
}

export const PHASE_LABEL: Record<CardiacPhase, string> = {
  'atrial-systole': 'Atrial systole',
  'isovolumetric-contraction': 'Isovolumetric contraction',
  ejection: 'Ventricular ejection',
  'isovolumetric-relaxation': 'Isovolumetric relaxation',
  filling: 'Ventricular filling',
}

const OPEN = '#34d399'
const CLOSED = '#ef4444'

/** Animator for the real heart mesh bundle (mesh ids from the Z-Anatomy heart: see PartAnimator). */
export function heartAnimator(partId: string, t: number): { scale?: number; color?: string } | undefined {
  const s = cardiacState(t)
  if (partId === 'right-atrium' || partId === 'left-atrium') return { scale: s.atrialScale }
  if (partId === 'right-ventricle' || partId === 'left-ventricle') return { scale: s.ventricleScale }
  if (/leaflet-of-(right|left)-atrioventricular-valve$/.test(partId)) return { color: s.avValvesOpen ? OPEN : CLOSED }
  if (/^(left|right|non)-coronary-leaflet$|semilunar-leaflet-of-pulmonary-valve$/.test(partId)) return { color: s.semilunarValvesOpen ? OPEN : CLOSED }
  return undefined
}
