import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { KEYS, readJSON, writeJSON } from '../lib/storage'

export type Quality = 'auto' | 'low' | 'medium' | 'high'

interface Settings {
  quality: Quality
  reducedMotion: boolean
  force2D: boolean
}

interface SettingsValue extends Settings {
  setQuality: (q: Quality) => void
  setReducedMotion: (v: boolean) => void
  setForce2D: (v: boolean) => void
  /** Device-pixel-ratio cap resolved from the quality setting. */
  dprMax: number
  /** Number of anti-aliasing / shadow features to allow. */
  antialias: boolean
}

const defaults: Settings = { quality: 'auto', reducedMotion: false, force2D: false }
const Ctx = createContext<SettingsValue | null>(null)

function autoQuality(): Exclude<Quality, 'auto'> {
  const cores = navigator.hardwareConcurrency ?? 4
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (cores <= 4 || mem <= 2) return 'low'
  if (mobile) return 'medium'
  return 'high'
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({ ...defaults, ...readJSON<Partial<Settings>>(KEYS.settings, {}) }))

  useEffect(() => {
    writeJSON(KEYS.settings, settings)
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion)
  }, [settings])

  const setQuality = useCallback((quality: Quality) => setSettings((s) => ({ ...s, quality })), [])
  const setReducedMotion = useCallback((reducedMotion: boolean) => setSettings((s) => ({ ...s, reducedMotion })), [])
  const setForce2D = useCallback((force2D: boolean) => setSettings((s) => ({ ...s, force2D })), [])

  const value = useMemo<SettingsValue>(() => {
    const q = settings.quality === 'auto' ? autoQuality() : settings.quality
    const dprMax = q === 'low' ? 1 : q === 'medium' ? 1.5 : 2
    return { ...settings, setQuality, setReducedMotion, setForce2D, dprMax, antialias: q !== 'low' }
  }, [settings, setQuality, setReducedMotion, setForce2D])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSettings must be used inside SettingsProvider')
  return v
}

/** True when the OS or the app setting asks for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const { reducedMotion } = useSettings()
  const [os, setOs] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const fn = () => setOs(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reducedMotion || os
}
