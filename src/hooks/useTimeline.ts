import { useCallback, useEffect, useRef, useState } from 'react'

export interface TimelineApi {
  /** Normalised position 0..1 within the loop (state: re-renders every frame). */
  t: number
  /** Same value as a ref: read inside useFrame / rAF loops without re-rendering. */
  tRef: React.MutableRefObject<number>
  playing: boolean
  speed: number
  play: () => void
  pause: () => void
  toggle: () => void
  restart: () => void
  seek: (t: number) => void
  setSpeed: (s: number) => void
}

/** A looping 0..1 timeline driven by requestAnimationFrame. `durationS` is the loop length at 1x. */
export function useTimeline(durationS: number, autoplay = true): TimelineApi {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(autoplay)
  const [speed, setSpeed] = useState(1)
  const tRef = useRef(0)
  const last = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) {
      last.current = null
      return
    }
    let raf = 0
    const loop = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / 1000
        tRef.current = (tRef.current + (dt * speed) / durationS) % 1
        setT(tRef.current)
      }
      last.current = now
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, durationS])

  const seek = useCallback((v: number) => {
    const c = Math.min(0.9999, Math.max(0, v))
    tRef.current = c
    setT(c)
  }, [])

  return {
    t, tRef, playing, speed, setSpeed,
    play: useCallback(() => setPlaying(true), []),
    pause: useCallback(() => setPlaying(false), []),
    toggle: useCallback(() => setPlaying((p) => !p), []),
    restart: useCallback(() => { seek(0); setPlaying(true) }, [seek]),
    seek,
  }
}

/** Index of the step whose `at` is the latest one not after t. */
export function currentStepIndex(steps: { at: number }[], t: number): number {
  let idx = 0
  steps.forEach((s, i) => { if (t >= s.at) idx = i })
  return idx
}
