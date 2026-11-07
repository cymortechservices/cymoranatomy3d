import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { KEYS, readSession, writeSession } from '../lib/storage'

interface IntroValue {
  /** True while the intro overlay is covering the home page. Heavy home-page 3D waits for this to become false. */
  introActive: boolean
  finishIntro: () => void
  replayIntro: () => void
}

const Ctx = createContext<IntroValue | null>(null)

const shouldPlay = () => {
  if (typeof window === 'undefined') return false
  if (readSession(KEYS.introSeen)) return false
  if (new URLSearchParams(window.location.search).has('nointro')) return false
  if (window.location.pathname !== '/') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  return true
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introActive, setActive] = useState(shouldPlay)
  const value = useMemo<IntroValue>(() => ({
    introActive,
    finishIntro: () => { writeSession(KEYS.introSeen, '1'); setActive(false) },
    replayIntro: () => { try { sessionStorage.removeItem(KEYS.introSeen) } catch { /* ignore */ } setActive(true) },
  }), [introActive])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useIntro() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useIntro must be used inside IntroProvider')
  return v
}
