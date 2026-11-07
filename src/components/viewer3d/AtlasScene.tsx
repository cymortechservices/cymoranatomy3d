import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { markLoadEnd, MODEL_BASE, SCENE_OFFSET, SCENE_SCALE, type AtlasBundle } from '../../data/atlas'
import type { AtlasView, PartAnimator } from './types'

const BASE = MODEL_BASE.replace(/models\/zanatomy\/$/, '')
let draco: DRACOLoader | null = null
export const configureGltfLoader = (gl: THREE.WebGLRenderer) => (loader: GLTFLoader) => {
  draco ??= new DRACOLoader().setDecoderPath(`${BASE}draco/`).setWorkerLimit(2)
  loader.setDRACOLoader(draco)
  loader.setMeshoptDecoder(MeshoptDecoder)
  loader.setKTX2Loader(new KTX2Loader().setTranscoderPath(`${BASE}basis/`).detectSupport(gl))
}

interface SceneProps {
  view: AtlasView
  selected: ReadonlySet<string>
  hidden: ReadonlySet<string>
  isolated: ReadonlySet<string> | null
  visibleBundles: ReadonlySet<string>
  xray: boolean
  onSelect: (id: string | null, bundle?: string) => void
  animator?: PartAnimator
  tRef?: React.MutableRefObject<number>
}

/** Scene-level registry used to free GPU memory when a bundle is removed from the view. */
const loaded = new Map<string, THREE.Object3D>()
export function releaseBundle(bundle: AtlasBundle) {
  const root = loaded.get(bundle.id)
  if (root) {
    root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()) } })
    loaded.delete(bundle.id)
  }
  useLoader.clear(GLTFLoader, bundle.url)
}

export function AtlasScene(props: SceneProps) {
  const { view } = props
  const previous = useRef<AtlasBundle[]>([])
  useEffect(() => {
    const now = new Set(view.bundles.map((b) => b.id))
    previous.current.filter((b) => !now.has(b.id)).forEach(releaseBundle)
    previous.current = view.bundles
  }, [view.bundles])
  return (
    <group scale={SCENE_SCALE} position={SCENE_OFFSET}>
      {view.bundles.map((b) => <BundleMeshes key={b.id} bundle={b} {...props} />)}
    </group>
  )
}

function BundleMeshes({ bundle, view, selected, hidden, isolated, visibleBundles, xray, onSelect, animator, tRef }: SceneProps & { bundle: AtlasBundle }) {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const gltf = useLoader(GLTFLoader, bundle.url, configureGltfLoader(gl))

  const { root, meshes } = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const list: THREE.Mesh[] = []
    clone.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.geometry.computeBoundingBox()
      m.userData.centre = m.geometry.boundingBox!.getCenter(new THREE.Vector3())
      m.userData.base = m.material
      list.push(m)
    })
    return { root: clone, meshes: list }
  }, [gltf])

  useEffect(() => {
    loaded.set(bundle.id, root); markLoadEnd(bundle.id)
    // Read by the automated verification script (tests/e2e/verify-models.mjs).
    const w = window as unknown as { __cymorAtlas?: Record<string, { meshes: number; tris: number }> }
    w.__cymorAtlas = { ...w.__cymorAtlas, [bundle.id]: { meshes: meshes.length, tris: meshes.reduce((n, m) => n + (m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3), 0) } }
    invalidate()
  }, [bundle.id, root, meshes, invalidate])

  // Highlight / ghost materials are created lazily and cached per source material.
  const cache = useRef(new Map<string, THREE.Material>())
  const styled = (m: THREE.Material, kind: 'hi' | 'ghost' | string): THREE.Material => {
    const k = `${m.uuid}:${kind}`
    let c = cache.current.get(k)
    if (!c) {
      const x = (m as THREE.MeshStandardMaterial).clone()
      if (kind === 'hi') { x.emissive = new THREE.Color('#22d3ee'); x.emissiveIntensity = 0.65 }
      else if (kind === 'ghost') { x.transparent = true; x.opacity = 0.18; x.depthWrite = false }
      else { x.color = new THREE.Color(kind) }
      cache.current.set(k, x); c = x
    }
    return c
  }
  useEffect(() => () => { cache.current.forEach((m) => m.dispose()); cache.current.clear() }, [])

  useEffect(() => {
    const bundleOn = visibleBundles.has(bundle.id)
    const anySel = selected.size > 0
    for (const m of meshes) {
      const id = m.name
      m.visible = bundleOn && !hidden.has(id) && (isolated === null || isolated.has(id))
      const base = m.userData.base as THREE.Material
      if (selected.has(id)) m.material = styled(base, 'hi')
      else if (xray) { const g = styled(base, 'ghost') as THREE.MeshStandardMaterial; g.opacity = anySel ? 0.16 : 0.35; m.material = g }
      else m.material = base
    }
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meshes, selected, hidden, isolated, visibleBundles, xray, bundle.id])

  // Physiology animation: scale parts about their own centre and tint valves.
  useFrame(() => {
    if (!animator || !tRef) return
    for (const m of meshes) {
      const r = animator(m.name, tRef.current)
      const s = r?.scale ?? 1
      const c = m.userData.centre as THREE.Vector3
      m.scale.setScalar(s); m.position.copy(c).multiplyScalar(1 - s)
      if (r?.color) m.material = styled(m.userData.base as THREE.Material, r.color)
      else if (!selected.has(m.name) && !xray) m.material = m.userData.base as THREE.Material
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return // it was a drag, not a click
    e.stopPropagation()
    const id = e.object.name
    if (view.parts.has(id)) onSelect(id, bundle.id)
  }
  return <primitive object={root} onClick={onClick} onPointerMissed={undefined} />
}
