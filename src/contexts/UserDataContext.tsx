import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { KEYS, readJSON, writeJSON } from '../lib/storage'
import type { QuizAttempt } from '../types'
import { useAuth } from './AuthContext'

interface UserDataValue {
  bookmarks: string[]
  isBookmarked: (structureId: string) => boolean
  toggleBookmark: (structureId: string) => void
  recent: string[]
  addRecent: (structureId: string) => void
  completedLessons: string[]
  toggleLesson: (lessonId: string) => void
  attempts: QuizAttempt[]
  addAttempt: (attempt: QuizAttempt) => void
  /** 'cloud' when signed in with a configured backend, otherwise 'browser' (this device only). */
  storageMode: 'cloud' | 'browser'
}

const Ctx = createContext<UserDataValue | null>(null)

const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]))

/**
 * Guest/demo data always lives in this browser (localStorage). When a signed-in user exists and Supabase is
 * configured, the same data is mirrored to the user's rows (RLS restricts access to their own rows).
 * On sign-in cloud and local data are merged (union) so nothing is lost.
 */
export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<string[]>(() => readJSON(KEYS.bookmarks, []))
  const [recent, setRecent] = useState<string[]>(() => readJSON(KEYS.recent, []))
  const [completedLessons, setCompleted] = useState<string[]>(() => readJSON(KEYS.lessons, []))
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => readJSON(KEYS.attempts, []))
  const cloud = !!(supabase && user)
  const merged = useRef<string | null>(null)

  useEffect(() => writeJSON(KEYS.bookmarks, bookmarks), [bookmarks])
  useEffect(() => writeJSON(KEYS.recent, recent), [recent])
  useEffect(() => writeJSON(KEYS.lessons, completedLessons), [completedLessons])
  useEffect(() => writeJSON(KEYS.attempts, attempts), [attempts])

  // Merge cloud data once per signed-in user.
  useEffect(() => {
    if (!supabase || !user || merged.current === user.id) return
    merged.current = user.id
    const client = supabase
    void (async () => {
      try {
        const [b, p, q] = await Promise.all([
          client.from('bookmarks').select('structure_id').eq('user_id', user.id),
          client.from('study_progress').select('lesson_id, completed').eq('user_id', user.id),
          client.from('quiz_attempts').select('*').eq('user_id', user.id).order('taken_at', { ascending: false }).limit(50),
        ])
        const cloudB = (b.data ?? []).map((r) => r.structure_id as string)
        const cloudL = (p.data ?? []).filter((r) => r.completed).map((r) => r.lesson_id as string)
        const cloudQ: QuizAttempt[] = (q.data ?? []).map((r) => ({
          id: r.id, topic: r.topic, difficulty: r.difficulty, mode: r.mode, total: r.total, correct: r.correct,
          percent: r.percent, taken_at: r.taken_at, incorrect_question_ids: r.incorrect_question_ids ?? [],
        }))
        setBookmarks((cur) => {
          const next = union(cur, cloudB)
          const missing = next.filter((id) => !cloudB.includes(id))
          if (missing.length) void client.from('bookmarks').upsert(missing.map((structure_id) => ({ user_id: user.id, structure_id })))
          return next
        })
        setCompleted((cur) => {
          const next = union(cur, cloudL)
          const missing = next.filter((id) => !cloudL.includes(id))
          if (missing.length) void client.from('study_progress').upsert(missing.map((lesson_id) => ({ user_id: user.id, lesson_id, completed: true })))
          return next
        })
        setAttempts((cur) => {
          const ids = new Set(cur.map((a) => a.id))
          return [...cur, ...cloudQ.filter((a) => !ids.has(a.id))].sort((x, y) => y.taken_at.localeCompare(x.taken_at)).slice(0, 50)
        })
      } catch {
        /* cloud unreachable: keep working locally */
      }
    })()
  }, [user])

  useEffect(() => {
    if (!user) merged.current = null
  }, [user])

  const toggleBookmark = useCallback(
    (structureId: string) => {
      const exists = bookmarks.includes(structureId)
      setBookmarks((cur) => (exists ? cur.filter((x) => x !== structureId) : [structureId, ...cur]))
      if (supabase && user) {
        const op = exists
          ? supabase.from('bookmarks').delete().eq('user_id', user.id).eq('structure_id', structureId)
          : supabase.from('bookmarks').upsert({ user_id: user.id, structure_id: structureId })
        void Promise.resolve(op).catch(() => undefined)
      }
    },
    [bookmarks, user],
  )

  const addRecent = useCallback((id: string) => setRecent((cur) => [id, ...cur.filter((x) => x !== id)].slice(0, 12)), [])

  const toggleLesson = useCallback(
    (lessonId: string) => {
      const done = completedLessons.includes(lessonId)
      setCompleted((cur) => (done ? cur.filter((x) => x !== lessonId) : [...cur, lessonId]))
      if (supabase && user) {
        void Promise.resolve(
          supabase.from('study_progress').upsert({ user_id: user.id, lesson_id: lessonId, completed: !done, updated_at: new Date().toISOString() }),
        ).catch(() => undefined)
      }
    },
    [completedLessons, user],
  )

  const addAttempt = useCallback(
    (attempt: QuizAttempt) => {
      setAttempts((cur) => [attempt, ...cur].slice(0, 50))
      if (supabase && user) {
        void Promise.resolve(supabase.from('quiz_attempts').insert({ ...attempt, user_id: user.id })).catch(() => undefined)
      }
    },
    [user],
  )

  const value = useMemo<UserDataValue>(
    () => ({
      bookmarks, isBookmarked: (id) => bookmarks.includes(id), toggleBookmark, recent, addRecent,
      completedLessons, toggleLesson, attempts, addAttempt, storageMode: cloud ? 'cloud' : 'browser',
    }),
    [bookmarks, toggleBookmark, recent, addRecent, completedLessons, toggleLesson, attempts, addAttempt, cloud],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUserData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUserData must be used inside UserDataProvider')
  return v
}
