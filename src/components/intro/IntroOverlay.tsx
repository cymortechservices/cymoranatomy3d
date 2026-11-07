import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useIntro } from '../../contexts/IntroContext'
import { isWebGLAvailable } from '../../lib/webgl'
import { LogoMark } from '../common/Logo'

const IntroSkeleton = lazy(() => import('./IntroSkeleton'))

export const INTRO_TITLE = 'CYMOR ANATOMY 3D'
const TAGLINE = 'Explore the Human Body. Understand Every Structure.'
/** ms since start */
const T = { typeStart: 1900, perChar: 85, taglineGap: 350, hold: 1500, fade: 1000 }

/**
 * Full-screen intro shown once per browser session on the home page:
 *  1. a 3D skeleton turns in the centre,
 *  2. it glides to the side while "CYMOR ANATOMY 3D" is typed out,
 *  3. the tagline fades in, then the whole overlay fades away to reveal the home page.
 * Skip with the button, Escape, Enter or Space. Reduced-motion users never see it (see IntroContext).
 */
export function IntroOverlay() {
  const { introActive, finishIntro } = useIntro()
  const clock = useRef(0)
  const [typed, setTyped] = useState(0)
  const [showTagline, setShowTagline] = useState(false)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(introActive)
  const webgl = useRef(isWebGLAvailable()).current

  // master clock + typewriter + phase changes, all from one rAF loop
  useEffect(() => {
    if (!introActive) return
    setMounted(true)
    const start = performance.now()
    const typeEnd = T.typeStart + INTRO_TITLE.length * T.perChar
    const fadeAt = typeEnd + T.taglineGap + T.hold
    let raf = 0
    let done = false
    const loop = (now: number) => {
      const ms = now - start
      clock.current = ms
      setTyped(Math.max(0, Math.min(INTRO_TITLE.length, Math.floor((ms - T.typeStart) / T.perChar) + 1)))
      if (ms > typeEnd + T.taglineGap) setShowTagline(true)
      if (ms > fadeAt && !done) {
        done = true
        setFading(true)
        // reveal the home page animations at the START of the fade so they cross-fade with the overlay
        finishIntro()
        window.setTimeout(() => setMounted(false), T.fade)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [introActive, finishIntro])

  useEffect(() => {
    if (!introActive) return
    const onKey = (e: KeyboardEvent) => { if (['Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); skip() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introActive])

  function skip() {
    setFading(true)
    finishIntro()
    window.setTimeout(() => setMounted(false), 450)
  }

  if (!mounted) return null
  const typing = typed < INTRO_TITLE.length
  const portraitLike = typeof window !== 'undefined' && window.innerWidth < window.innerHeight

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-ink-950 grid-bg"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${fading && !introActive ? 450 : T.fade}ms ease`, pointerEvents: fading ? 'none' : 'auto' }}
      role="dialog" aria-label="CYMOR ANATOMY 3D introduction" data-testid="intro" data-fading={fading}
    >
      {webgl && (
        <div className="absolute inset-0">
          <Suspense fallback={null}><IntroSkeleton clock={{ now: clock }} /></Suspense>
        </div>
      )}
      <div className={`pointer-events-none absolute inset-0 flex ${portraitLike ? 'items-end pb-[14vh]' : 'items-center pl-[7vw]'} justify-center ${portraitLike ? '' : 'sm:justify-start'}`}>
        <div className={`px-5 ${portraitLike ? 'text-center' : 'max-w-[48vw]'}`} style={{ opacity: typed > 0 ? 1 : 0, transition: 'opacity .3s' }}>
          <div className="mb-4 flex items-center gap-3" style={{ justifyContent: portraitLike ? 'center' : 'flex-start' }}><LogoMark className="h-10 w-10" /><span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-brand">CymorTechServices</span></div>
          <h1 className={`font-display text-[clamp(1.9rem,6.2vw,4.4rem)] font-bold leading-tight tracking-wide text-white ${typing ? 'caret' : ''}`} aria-label={INTRO_TITLE} data-testid="intro-title">
            <span aria-hidden>{INTRO_TITLE.slice(0, typed)}</span>
          </h1>
          <p className="mt-4 max-w-md text-[clamp(.9rem,1.8vw,1.15rem)] text-text-dim" style={{ opacity: showTagline ? 1 : 0, transform: showTagline ? 'none' : 'translateY(8px)', transition: 'opacity .8s ease, transform .8s ease' }} data-testid="intro-tagline">
            {TAGLINE}
          </p>
        </div>
      </div>
      <button onClick={skip} className="absolute bottom-5 right-5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-text-main backdrop-blur hover:border-cyan-brand hover:text-cyan-brand" data-testid="intro-skip">
        Skip intro
      </button>
    </div>
  )
}
