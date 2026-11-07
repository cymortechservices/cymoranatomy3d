import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Copy, Check, History, MessageSquarePlus, RotateCcw, Send, Trash2, User as UserIcon, AlertTriangle } from 'lucide-react'
import { SafeMarkdown } from '../common/SafeMarkdown'
import { Notice } from '../common/ui'
import { askTutor, MAX_INPUT_CHARS, TutorSetupError } from '../../services/tutor'
import { saveConversationToCloud } from '../../services/tutorHistory'
import { offlineAnswer, OFFLINE_SUGGESTIONS } from '../../lib/offlineTutor'
import { isBackendConfigured } from '../../lib/supabase'
import { KEYS, readJSON, writeJSON } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import type { ChatMessage, TutorContext } from '../../types'

interface Conversation { id: string; title: string; updated_at: string; messages: ChatMessage[] }

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const newConversation = (): Conversation => ({ id: crypto.randomUUID?.() ?? uid(), title: 'New conversation', updated_at: new Date().toISOString(), messages: [] })

export function TutorChat({ context }: { context: TutorContext }) {
  const { user } = useAuth()
  const [convos, setConvos] = useState<Conversation[]>(() => {
    const saved = readJSON<Conversation[]>(KEYS.chat, [])
    return saved.length ? saved : [newConversation()]
  })
  const [activeId, setActiveId] = useState(() => convos[0].id)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiDown, setAiDown] = useState(!isBackendConfigured)
  const [setupMsg, setSetupMsg] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const lastSend = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)

  const active = convos.find((c) => c.id === activeId) ?? convos[0]
  useEffect(() => writeJSON(KEYS.chat, convos.slice(0, 20)), [convos])
  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }) }, [active.messages.length, busy])

  const update = useCallback((id: string, fn: (c: Conversation) => Conversation) => setConvos((cur) => cur.map((c) => (c.id === id ? fn(c) : c))), [])

  const ctxLine = [context.system && `System: ${context.system}`, context.region && `Region: ${context.region}`, context.organ && `Organ: ${context.organ}`, context.structure && `Structure: ${context.structure}`, context.lesson && `Lesson: ${context.lesson}`].filter(Boolean).join(' · ')

  const suggestions = useMemo(() => {
    const s = context.structure
    if (s) return [`Explain the ${s.toLowerCase()}`, `What are the structural adaptations of the ${s.toLowerCase()}?`, `Give me flashcards for the ${s.toLowerCase()}`, `Clinical relevance of the ${s.toLowerCase()}`]
    return OFFLINE_SUGGESTIONS
  }, [context.structure])

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, MAX_INPUT_CHARS)
    if (!text || busy) return
    if (Date.now() - lastSend.current < 1200) return // client-side throttle; the server also rate-limits
    lastSend.current = Date.now()
    const convoId = active.id
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, created_at: new Date().toISOString() }
    const history = [...active.messages, userMsg]
    update(convoId, (c) => ({ ...c, title: c.messages.length === 0 ? text.slice(0, 48) : c.title, updated_at: new Date().toISOString(), messages: history }))
    setInput(''); setBusy(true)

    let reply: ChatMessage
    try {
      if (aiDown) throw new TutorSetupError('offline')
      const content = await askTutor(history, context)
      reply = { id: uid(), role: 'assistant', content, created_at: new Date().toISOString() }
    } catch (e) {
      if (e instanceof TutorSetupError) {
        if (e.message !== 'offline') { setAiDown(true); setSetupMsg(e.message) }
        reply = { id: uid(), role: 'assistant', content: `*Offline study helper (not AI): answered from the built-in notes.*\n\n${offlineAnswer(text, context)}`, created_at: new Date().toISOString() }
      } else {
        reply = { id: uid(), role: 'assistant', content: (e as Error).message || 'Something went wrong. Please try again.', created_at: new Date().toISOString(), error: true }
      }
    }
    let finalMessages: ChatMessage[] = []
    update(convoId, (c) => { finalMessages = [...c.messages, reply]; return { ...c, updated_at: new Date().toISOString(), messages: finalMessages } })
    setBusy(false)
    if (user && !reply.error) void saveConversationToCloud(user.id, convoId, active.messages.length === 0 ? text : active.title, [...history, reply])
  }, [active, aiDown, busy, context, update, user])

  const retry = () => {
    const lastUser = [...active.messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    update(active.id, (c) => ({ ...c, messages: c.messages.filter((m, i) => !(m.error && i === c.messages.length - 1) && m.id !== lastUser.id) }))
    lastSend.current = 0
    void send(lastUser.content)
  }

  const copy = async (m: ChatMessage) => {
    try { await navigator.clipboard.writeText(m.content); setCopied(m.id); setTimeout(() => setCopied(null), 1500) } catch { /* clipboard unavailable */ }
  }

  const startNew = () => { const c = newConversation(); setConvos((cur) => [c, ...cur]); setActiveId(c.id); setHistoryOpen(false) }
  const clearActive = () => update(active.id, (c) => ({ ...c, title: 'New conversation', messages: [] }))

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]" data-testid="tutor">
      <aside className={`${historyOpen ? 'block' : 'hidden'} space-y-2 lg:block`} aria-label="Conversation history">
        <button onClick={startNew} className="flex w-full items-center gap-2 rounded-xl bg-cyan-brand px-3 py-2.5 text-sm font-semibold text-ink-950"><MessageSquarePlus className="h-4 w-4" aria-hidden />New conversation</button>
        <ul className="max-h-72 space-y-1 overflow-y-auto scroll-thin lg:max-h-[60vh]">
          {convos.map((c) => (
            <li key={c.id}>
              <button onClick={() => { setActiveId(c.id); setHistoryOpen(false) }} aria-current={c.id === active.id} className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm ${c.id === active.id ? 'bg-cyan-brand/15 text-cyan-brand' : 'text-text-dim hover:bg-white/5'}`}>{c.title}</button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-h-[60vh] flex-col gap-3" aria-label="Chat">
        {aiDown ? (
          <Notice tone="warn" title="AI tutor is not configured">
            {isBackendConfigured ? setupMsg || 'The tutor function is not available.' : 'This build has no Supabase project or Gemini key, so it is running in demo mode.'} Your questions are answered by the <strong>offline study helper</strong>, which uses the built-in verified notes (it is not AI and cannot answer free-form questions). To enable the AI tutor, follow docs/GEMINI_SETUP.md.
          </Notice>
        ) : (
          <Notice title="AI tutor enabled">Answers are generated by an AI model. It can be wrong and is not medically authoritative. Check important facts against your textbook.</Notice>
        )}
        {ctxLine && <p className="rounded-xl bg-ink-800/70 px-3 py-2 text-xs text-text-dim" data-testid="tutor-context"><span className="font-semibold text-cyan-brand">Context:</span> {ctxLine}</p>}

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-ink-950/40 p-3 scroll-thin sm:p-4" role="log" aria-live="polite" aria-label="Conversation" data-testid="chat-log">
          {active.messages.length === 0 && (
            <div className="space-y-3 py-4 text-center"><Bot className="mx-auto h-9 w-9 text-cyan-brand" aria-hidden /><p className="text-sm text-text-dim">Ask about any structure, function, adaptation or clinical point. Try one of these:</p>
              <div className="flex flex-wrap justify-center gap-2">{suggestions.map((s) => <button key={s} onClick={() => void send(s)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-text-main hover:border-cyan-brand hover:text-cyan-brand">{s}</button>)}</div></div>
          )}
          {active.messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${m.role === 'user' ? 'bg-violet-brand/30' : 'bg-cyan-brand/20'}`}>{m.role === 'user' ? <UserIcon className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}</span>
              <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${m.role === 'user' ? 'rounded-tr-sm bg-violet-brand/20' : m.error ? 'rounded-tl-sm border border-rose-400/40 bg-rose-400/10' : 'rounded-tl-sm bg-ink-700/70'}`}>
                {m.role === 'user' ? <p className="whitespace-pre-wrap text-sm">{m.content}</p> : m.error ? <p className="flex items-start gap-2 text-sm text-rose-100"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{m.content}</p> : <SafeMarkdown text={m.content} />}
                {m.role === 'assistant' && (
                  <div className="mt-2 flex gap-3 text-[11px] text-text-dim">
                    {!m.error && <button onClick={() => void copy(m)} className="inline-flex items-center gap-1 hover:text-cyan-brand" aria-label="Copy answer">{copied === m.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied === m.id ? 'Copied' : 'Copy'}</button>}
                    {m.error && <button onClick={retry} className="inline-flex items-center gap-1 hover:text-cyan-brand"><RotateCcw className="h-3 w-3" aria-hidden />Retry</button>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="flex items-center gap-2 text-xs text-text-dim" role="status" aria-label="The tutor is typing"><span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-brand/20"><Bot className="h-4 w-4" aria-hidden /></span><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void send(input) }} className="flex items-end gap-2">
          <button type="button" onClick={() => setHistoryOpen((o) => !o)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 lg:hidden" aria-label="Toggle conversation history"><History className="h-4 w-4" /></button>
          <label className="sr-only" htmlFor="tutor-input">Your question</label>
          <textarea
            id="tutor-input" value={input} rows={2} maxLength={MAX_INPUT_CHARS} placeholder="Ask the tutor… (Enter to send, Shift+Enter for a new line)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input) } }}
            className="max-h-40 min-h-11 flex-1 resize-y rounded-xl border border-white/15 bg-ink-800 px-3 py-2.5 text-sm text-white placeholder:text-text-dim focus:border-cyan-brand focus:outline-none"
          />
          <button type="submit" disabled={busy || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-brand text-ink-950 disabled:opacity-50" aria-label="Send message" data-testid="send"><Send className="h-4 w-4" /></button>
          <button type="button" onClick={clearActive} disabled={active.messages.length === 0} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 disabled:opacity-40" aria-label="Clear conversation"><Trash2 className="h-4 w-4" /></button>
        </form>
        <p className="text-[11px] text-text-dim">{input.length}/{MAX_INPUT_CHARS} · Educational use only, not medical advice. Chat history is saved in this browser{user ? ' and your account' : ''}.</p>
      </section>
    </div>
  )
}
