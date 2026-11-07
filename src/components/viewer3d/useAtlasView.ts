import { useEffect, useState } from 'react'
import { allBundles, loadManifest, markLoadStart, subscribeBundles, SCENE_SCALE, toScene, type Vec3 } from '../../data/atlas'
import type { AtlasPart, AtlasView } from './types'

interface State { view: AtlasView | null; loading: boolean; error: Error | null }
const FOV_HALF = Math.tan((20 * Math.PI) / 180)

/** Loads the manifests (mesh lists) for the requested bundles and assembles the view: parts + home camera pose. */
export function useAtlasView(bundleIds: readonly string[], retryKey = 0): State {
  const key = bundleIds.join(',')
  const [state, setState] = useState<State>({ view: null, loading: true, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => subscribeBundles(() => setTick((n) => n + 1)), [])

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    const bundles = bundleIds.map((id) => allBundles().find((b) => b.id === id)).filter((b): b is NonNullable<typeof b> => !!b)
    if (bundles.length === 0) { setState({ view: null, loading: false, error: null }); return () => { alive = false } }
    bundles.forEach((b) => markLoadStart(b.id))
    Promise.all(bundles.map(loadManifest)).then((manifests) => {
      if (!alive) return
      const parts = new Map<string, AtlasPart>()
      manifests.forEach((m, i) => m.meshes.forEach((row) => parts.set(row.id, { row, bundle: bundles[i].id })))
      const lo: Vec3 = [Infinity, Infinity, Infinity]; const hi: Vec3 = [-Infinity, -Infinity, -Infinity]
      for (const b of bundles) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], b.bbox[0][i]); hi[i] = Math.max(hi[i], b.bbox[1][i]) }
      const centre = toScene([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2])
      const extent = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) * SCENE_SCALE
      const view: AtlasView = {
        id: `atlas:${key}`, name: bundles.map((b) => b.title).join(' + '), bundles, parts,
        camera: { target: centre, distance: Math.max(0.35, (extent / 2 / FOV_HALF) * 1.25) },
      }
      setState({ view, loading: false, error: null })
    }).catch((e: Error) => { if (alive) setState({ view: null, loading: false, error: e }) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retryKey, tick])

  return state
}
