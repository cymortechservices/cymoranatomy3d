import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { getBundle } from '../../data/atlas'
import { configureGltfLoader } from '../viewer3d/AtlasScene'
import type { MutableRefObject } from 'react'

export interface IntroClock {
  /** ms since the intro started. */
  now: MutableRefObject<number>
}

/** Timeline (ms): hold centred and turning, then glide to the side. Exported so the overlay and tests share it. */
export const INTRO_TIMING = { moveStart: 1300, moveEnd: 2600 }

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function Skeleton({ clock }: { clock: IntroClock }) {
  const group = useRef<THREE.Group>(null)
  const { viewport, gl } = useThree()
  const bundle = getBundle('skeleton')!
  const gltf = useLoader(GLTFLoader, bundle.url, configureGltfLoader(gl))
  // The real Z-Anatomy skeleton, drawn with one glowing material, scaled to ~3.6 units tall and centred.
  const { model, k } = useMemo(() => {
    const m = gltf.scene.clone(true)
    const mat = new THREE.MeshStandardMaterial({ color: '#cfeaf5', emissive: '#22d3ee', emissiveIntensity: 0.28, roughness: 0.45, metalness: 0.15 })
    m.traverse((o) => { const x = o as THREE.Mesh; if (x.isMesh) x.material = mat })
    const [lo, hi] = bundle.bbox
    const sc = 3.6 / (hi[1] - lo[1])
    m.scale.setScalar(sc)
    m.position.set(-((lo[0] + hi[0]) / 2) * sc, -((lo[1] + hi[1]) / 2) * sc, -((lo[2] + hi[2]) / 2) * sc)
    return { model: m, k: sc }
  }, [gltf, bundle])
  void k

  useFrame(() => {
    const g = group.current
    if (!g) return
    const ms = clock.now.current
    const p = ease(Math.min(1, Math.max(0, (ms - INTRO_TIMING.moveStart) / (INTRO_TIMING.moveEnd - INTRO_TIMING.moveStart))))
    const portrait = viewport.width < viewport.height
    // landscape: glide to the right third; portrait: shrink and rise above the title
    const targetX = portrait ? 0 : viewport.width * 0.24
    const targetY = portrait ? viewport.height * 0.2 : 0
    const targetScale = portrait ? 0.62 : 1
    g.position.x = THREE.MathUtils.lerp(0, targetX, p)
    g.position.y = THREE.MathUtils.lerp(0, targetY, p)
    g.scale.setScalar(THREE.MathUtils.lerp(1, targetScale, p))
    // slow turntable before the move, then settle to a three-quarter view that keeps gently turning
    g.rotation.y = ms * 0.0009 * (1 - p * 0.7) + p * -0.35
  })

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  )
}

function Dust() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const a = new Float32Array(90 * 3)
    for (let i = 0; i < 90; i++) { a[i * 3] = (Math.random() - 0.5) * 12; a[i * 3 + 1] = (Math.random() - 0.5) * 7; a[i * 3 + 2] = -2 - Math.random() * 3 }
    return a
  }, [])
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.03 })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.035} color="#67e8f9" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export default function IntroSkeleton({ clock }: { clock: IntroClock }) {
  return (
    <Canvas
      dpr={[1, 1.5]} camera={{ fov: 40, position: [0, 0, 6.6], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }} frameloop="always" aria-hidden data-testid="intro-canvas"
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#bfe9ff" />
      <pointLight position={[-4, 1, 2]} intensity={14} color="#8b5cf6" />
      <pointLight position={[4, -2, 3]} intensity={10} color="#22d3ee" />
      <Dust />
      <Suspense fallback={null}><Skeleton clock={clock} /></Suspense>
    </Canvas>
  )
}
