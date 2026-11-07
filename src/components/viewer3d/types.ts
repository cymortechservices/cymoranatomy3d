import type { AtlasBundle, MeshRow, Vec3 } from '../../data/atlas'

export type ViewName = 'anterior' | 'posterior' | 'left' | 'right' | 'superior' | 'inferior'

export type CameraCommand =
  | { id: number; type: 'view'; view: ViewName }
  | { id: number; type: 'reset' }
  | { id: number; type: 'fit' }
  | { id: number; type: 'focus'; position: [number, number, number]; distance?: number }
  | { id: number; type: 'orbit'; dAzimuth: number; dPolar: number }
  | { id: number; type: 'zoom'; factor: number }

/** Distributive Omit so each command variant keeps its own fields. */
export type CommandInput = CameraCommand extends infer C ? (C extends { id: number } ? Omit<C, 'id'> : never) : never

/** Per-frame part animation: returns a scale multiplier and/or colour for a part at time t (0..1). */
export type PartAnimator = (partId: string, t: number) => { scale?: number; color?: string } | undefined

export const VIEW_LABELS: Record<ViewName, string> = {
  anterior: 'Anterior',
  posterior: 'Posterior',
  left: 'Left lateral',
  right: 'Right lateral',
  superior: 'Superior',
  inferior: 'Inferior',
}

/** One mesh of the atlas together with the bundle it belongs to. */
export interface AtlasPart { row: MeshRow; bundle: string }

/** The set of bundles currently on screen, with every mesh row loaded from their manifests. */
export interface AtlasView {
  id: string
  name: string
  bundles: AtlasBundle[]
  parts: Map<string, AtlasPart>
  /** Camera home pose in scene coordinates. */
  camera: { distance: number; target: Vec3 }
}
