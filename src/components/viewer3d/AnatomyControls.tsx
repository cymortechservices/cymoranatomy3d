import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, Focus, Maximize, Maximize2, Minimize2, RotateCcw, Tag, ZoomIn, ZoomOut, Box, ScanEye } from 'lucide-react'
import { nextCommandId } from './AnatomyViewer'
import { VIEW_LABELS, type CameraCommand, type CommandInput, type ViewName } from './types'
import { useSettings, type Quality } from '../../contexts/SettingsContext'

interface Props {
  onCommand: (c: CameraCommand) => void
  showLabels: boolean
  onToggleLabels: () => void
  hasSelection: boolean
  isolated: boolean
  onHideSelected: () => void
  onToggleIsolate: () => void
  onShowAll: () => void
  fullscreen: boolean
  onToggleFullscreen: () => void
  fullscreenSupported: boolean
  xray: boolean
  onToggleXray: () => void
}

function Btn({ label, onClick, children, pressed, disabled }: { label: string; onClick: () => void; children: React.ReactNode; pressed?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} aria-pressed={pressed}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${pressed ? 'border-cyan-brand bg-cyan-brand/20 text-cyan-brand' : 'border-white/15 bg-ink-800/80 text-text-main hover:border-cyan-brand/60 hover:text-cyan-brand'}`}
    >
      {children}
    </button>
  )
}

const VIEWS: ViewName[] = ['anterior', 'posterior', 'left', 'right', 'superior', 'inferior']

/** Toolbar for the 3D laboratory. Every control either issues a camera command or changes visibility state. */
export function AnatomyControls(p: Props) {
  const { quality, setQuality, force2D, setForce2D } = useSettings()
  const send = (c: CommandInput) => p.onCommand({ ...c, id: nextCommandId() } as CameraCommand)
  return (
    <div className="flex flex-col gap-2" role="toolbar" aria-label="3D viewer controls">
      <div className="flex flex-wrap items-center gap-1.5">
        <Btn label="Rotate left" onClick={() => send({ type: 'orbit', dAzimuth: -0.3, dPolar: 0 })}><ArrowLeft className="h-4 w-4" /></Btn>
        <Btn label="Rotate right" onClick={() => send({ type: 'orbit', dAzimuth: 0.3, dPolar: 0 })}><ArrowRight className="h-4 w-4" /></Btn>
        <Btn label="Rotate up" onClick={() => send({ type: 'orbit', dAzimuth: 0, dPolar: -0.3 })}><ArrowUp className="h-4 w-4" /></Btn>
        <Btn label="Rotate down" onClick={() => send({ type: 'orbit', dAzimuth: 0, dPolar: 0.3 })}><ArrowDown className="h-4 w-4" /></Btn>
        <span className="mx-1 h-6 w-px bg-white/15" aria-hidden />
        <Btn label="Zoom in" onClick={() => send({ type: 'zoom', factor: 0.78 })}><ZoomIn className="h-4 w-4" /></Btn>
        <Btn label="Zoom out" onClick={() => send({ type: 'zoom', factor: 1.28 })}><ZoomOut className="h-4 w-4" /></Btn>
        <Btn label="Reset camera" onClick={() => send({ type: 'reset' })}><RotateCcw className="h-4 w-4" /></Btn>
        <Btn label="Fit model to viewport" onClick={() => send({ type: 'fit' })}><Maximize className="h-4 w-4" /></Btn>
        <Btn label={p.fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={p.onToggleFullscreen} disabled={!p.fullscreenSupported} pressed={p.fullscreen}>
          {p.fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Btn>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Btn label={p.showLabels ? 'Hide labels' : 'Show labels'} onClick={p.onToggleLabels} pressed={p.showLabels}><Tag className="h-4 w-4" /></Btn>
        <Btn label={p.xray ? 'Turn X-ray off' : 'X-ray mode (see through to internal structures)'} onClick={p.onToggleXray} pressed={p.xray}><ScanEye className="h-4 w-4" /></Btn>
        <Btn label="Hide selected structure" onClick={p.onHideSelected} disabled={!p.hasSelection}><EyeOff className="h-4 w-4" /></Btn>
        <Btn label={p.isolated ? 'Stop isolating' : 'Isolate selected structure'} onClick={p.onToggleIsolate} disabled={!p.hasSelection && !p.isolated} pressed={p.isolated}><Focus className="h-4 w-4" /></Btn>
        <Btn label="Reset anatomical visibility (show all)" onClick={p.onShowAll}><Eye className="h-4 w-4" /></Btn>
        <span className="mx-1 h-6 w-px bg-white/15" aria-hidden />
        <label className="sr-only" htmlFor="view-select">Camera view</label>
        <select
          id="view-select" defaultValue=""
          onChange={(e) => { if (e.target.value) send({ type: 'view', view: e.target.value as ViewName }); e.target.value = '' }}
          className="h-9 rounded-lg border border-white/15 bg-ink-800/80 px-2 text-xs text-text-main"
        >
          <option value="" disabled>View…</option>
          {VIEWS.map((v) => <option key={v} value={v}>{VIEW_LABELS[v]}</option>)}
        </select>
        <label className="sr-only" htmlFor="quality-select">Graphics quality</label>
        <select id="quality-select" value={quality} onChange={(e) => setQuality(e.target.value as Quality)} className="h-9 rounded-lg border border-white/15 bg-ink-800/80 px-2 text-xs text-text-main">
          <option value="auto">Quality: Auto</option>
          <option value="low">Quality: Low</option>
          <option value="medium">Quality: Medium</option>
          <option value="high">Quality: High</option>
        </select>
        <Btn label={force2D ? 'Switch to 3D view' : 'Switch to lightweight 2D view'} onClick={() => setForce2D(!force2D)} pressed={force2D}><Box className="h-4 w-4" /></Btn>
      </div>
    </div>
  )
}
