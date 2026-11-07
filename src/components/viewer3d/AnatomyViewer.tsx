import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useProgress } from '@react-three/drei'
import { AlertTriangle } from 'lucide-react'
import { useSettings, usePrefersReducedMotion } from '../../contexts/SettingsContext'
import { isWebGLAvailable } from '../../lib/webgl'
import { resetLoad } from '../../data/atlas'
import { AnatomyLabels } from './AnatomyLabels'
import { AtlasScene } from './AtlasScene'
import { CameraController } from './CameraController'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { ViewerFallback2D } from './ViewerFallback2D'
import type { AtlasView, CameraCommand, PartAnimator } from './types'

export interface AnatomyViewerProps {
  view: AtlasView | null
  loading?: boolean
  error?: Error | null
  onRetryManifest?: () => void
  selected?: ReadonlySet<string>
  onSelectPart?: (partId: string | null, bundle?: string) => void
  hidden?: ReadonlySet<string>
  isolated?: ReadonlySet<string> | null
  visibleBundles?: ReadonlySet<string>
  xray?: boolean
  showLabels?: boolean
  command?: CameraCommand | null
  animator?: PartAnimator
  tRef?: React.MutableRefObject<number>
  autoRotate?: boolean
  className?: string
  /** Disable pointer interaction (decorative previews). */
  static?: boolean
  /** Called with the number of meshes drawn once all bundles have finished loading (used by automated checks). */
  onReady?: () => void
}

let commandCounter = 1000
export const nextCommandId = () => ++commandCounter

const EMPTY: ReadonlySet<string> = new Set()

function LoadingOverlay({ onDone }: { onDone: () => void }) {
  const { active, progress, total } = useProgress()
  useEffect(() => { if (!active && total > 0) onDone() }, [active, total, onDone])
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink-950/50" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-2"><div className="spinner" /><span className="text-xs text-text-dim">Loading anatomy… {Math.round(progress)}%</span></div>
    </div>
  )
}

export default function AnatomyViewer(props: AnatomyViewerProps) {
  const { view, loading = false, error = null, selected = EMPTY, onSelectPart = () => undefined, hidden = EMPTY, isolated = null, xray = false, showLabels = false, command = null, animator, tRef, autoRotate = false, className = '', static: isStatic = false, onReady } = props
  const settings = useSettings()
  const reduced = usePrefersReducedMotion()
  const [attempt, setAttempt] = useState(0)
  const [contextLost, setContextLost] = useState(false)
  const [keyCommand, setKeyCommand] = useState<CameraCommand | null>(null)
  const [ready, setReady] = useState(false)

  const visibleBundles = useMemo(() => props.visibleBundles ?? new Set(view?.bundles.map((b) => b.id) ?? []), [props.visibleBundles, view])
  const activeCommand = useMemo(() => (command && keyCommand ? (command.id > keyCommand.id ? command : keyCommand) : command ?? keyCommand), [command, keyCommand])

  const retry = useCallback(() => {
    view?.bundles.forEach((b) => { resetLoad(b.id) })
    props.onRetryManifest?.()
    setContextLost(false); setReady(false); setAttempt((n) => n + 1)
  }, [view, props])

  useEffect(() => { setContextLost(false); setReady(false) }, [view?.id])
  const done = useCallback(() => { setReady(true); onReady?.() }, [onReady])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isStatic) return
    const step = 0.2
    const map: Record<string, CameraCommand | undefined> = {
      ArrowLeft: { id: nextCommandId(), type: 'orbit', dAzimuth: -step, dPolar: 0 }, ArrowRight: { id: nextCommandId(), type: 'orbit', dAzimuth: step, dPolar: 0 },
      ArrowUp: { id: nextCommandId(), type: 'orbit', dAzimuth: 0, dPolar: -step }, ArrowDown: { id: nextCommandId(), type: 'orbit', dAzimuth: 0, dPolar: step },
      '+': { id: nextCommandId(), type: 'zoom', factor: 0.8 }, '=': { id: nextCommandId(), type: 'zoom', factor: 0.8 },
      '-': { id: nextCommandId(), type: 'zoom', factor: 1.25 }, '0': { id: nextCommandId(), type: 'reset' },
    }
    const c = map[e.key]
    if (c) { e.preventDefault(); setKeyCommand(c) }
  }

  const fallback = (reason: 'no-webgl' | 'forced' | 'error' | 'context-lost', detail?: string, onRetry?: () => void) => (
    <ViewerFallback2D view={view} reason={reason} detail={detail} selected={selected} onSelectPart={onSelectPart} onRetry={onRetry} onTry3D={() => settings.setForce2D(false)} />
  )

  let body: React.ReactNode
  if (error) body = fallback('error', error.message, retry)
  else if (settings.force2D) body = fallback('forced')
  else if (!isWebGLAvailable()) body = fallback('no-webgl')
  else if (!view || loading) body = <div className="grid h-full place-items-center"><div className="flex flex-col items-center gap-2"><div className="spinner" /><span className="text-xs text-text-dim">Preparing the atlas…</span></div></div>
  else if (contextLost) body = fallback('context-lost', undefined, retry)
  else {
    body = (
      <ModelErrorBoundary resetKey={`${view.id}-${attempt}`} fallback={(err, reset) => fallback('error', err.message, () => { retry(); reset() })}>
        <Canvas
          key={`${view.id}-${attempt}`}
          dpr={[1, settings.dprMax]}
          frameloop={autoRotate || animator ? 'always' : 'demand'}
          camera={{ fov: 40, near: 0.01, far: 100, position: [0, 0, view.camera.distance] }}
          gl={{ antialias: settings.antialias, alpha: true, powerPreference: 'default' }}
          onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); setContextLost(true) }) }}
          style={{ touchAction: 'none' }}
          aria-label={`3D view of ${view.name}`}
        >
          <ambientLight intensity={0.75} />
          <hemisphereLight args={['#bcd7ff', '#1a2a4a', 0.55]} />
          <directionalLight position={[3, 5, 4]} intensity={1.25} />
          <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#8b5cf6" />
          <Suspense fallback={null}>
            <AtlasScene view={view} selected={selected} hidden={hidden} isolated={isolated} visibleBundles={visibleBundles} xray={xray} onSelect={onSelectPart} animator={animator} tRef={tRef} />
            {showLabels && <AnatomyLabels view={view} selected={selected} hidden={hidden} isolated={isolated} visibleBundles={visibleBundles} />}
          </Suspense>
          <OrbitControls makeDefault enableDamping dampingFactor={0.09} rotateSpeed={0.85} zoomSpeed={0.9} enablePan={!isStatic} enableRotate={!isStatic} enableZoom={!isStatic} autoRotate={autoRotate && !reduced} autoRotateSpeed={1.2} />
          <CameraController model={view} command={activeCommand} durationS={reduced ? 0 : 0.7} />
        </Canvas>
        <LoadingOverlay onDone={done} />
      </ModelErrorBoundary>
    )
  }

  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      tabIndex={isStatic ? -1 : 0}
      onKeyDown={onKeyDown}
      data-testid="anatomy-viewer"
      data-view={view?.id ?? ''}
      data-ready={ready ? 'true' : 'false'}
      aria-label={`${view?.name ?? 'Anatomy'}. Use arrow keys to rotate, plus and minus to zoom, 0 to reset.`}
    >
      {body}
    </div>
  )
}

export function ViewerWarning({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gold-brand/10 px-3 py-2 text-xs text-gold-brand" role="note">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />{message}
    </div>
  )
}
