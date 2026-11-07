/** localStorage wrapper that never throws (private mode, blocked storage, SSR). */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: app keeps working with in-memory state */
  }
}

export function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export const KEYS = {
  bookmarks: 'cymor.bookmarks.v1',
  recent: 'cymor.recent.v1',
  lessons: 'cymor.lessons.v1',
  attempts: 'cymor.attempts.v1',
  chat: 'cymor.chat.v1',
  settings: 'cymor.settings.v1',
  demoProfile: 'cymor.demoProfile.v1',
  introSeen: 'cymor.introSeen',
} as const
