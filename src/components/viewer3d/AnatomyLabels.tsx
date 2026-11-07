import { Html } from '@react-three/drei'
import { toScene } from '../../data/atlas'
import { meshLabel } from '../../data/atlas'
import type { AtlasView } from './types'

interface Props {
  view: AtlasView
  selected: ReadonlySet<string>
  hidden: ReadonlySet<string>
  isolated: ReadonlySet<string> | null
  visibleBundles: ReadonlySet<string>
}

const MAX_LABELS = 40

/** Text labels anchored at the centre of each mesh's bounding box. Selected structures are always labelled; others
 *  only when the view is small enough to stay legible. */
export function AnatomyLabels({ view, selected, hidden, isolated, visibleBundles }: Props) {
  const visible = [...view.parts.values()].filter(({ row, bundle }) => visibleBundles.has(bundle) && !hidden.has(row.id) && (!isolated || isolated.has(row.id)) && row.bbox)
  const showAll = visible.length <= MAX_LABELS
  return (
    <>
      {visible.filter(({ row }) => showAll || selected.has(row.id)).map(({ row }) => {
        const [lo, hi] = row.bbox!
        const pos = toScene([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2])
        const sel = selected.has(row.id)
        return (
          <Html key={row.id} position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium shadow ${sel ? 'bg-cyan-300 text-ink-950' : 'bg-ink-950/80 text-text-main ring-1 ring-white/15'}`}>{meshLabel(row)}</span>
          </Html>
        )
      })}
    </>
  )
}
