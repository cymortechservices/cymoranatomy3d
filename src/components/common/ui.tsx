import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AlertCircle, Info } from 'lucide-react'

export function Badge({ children, tone = 'cyan' }: { children: ReactNode; tone?: 'cyan' | 'violet' | 'gold' | 'slate' | 'green' | 'red' }) {
  const tones = {
    cyan: 'bg-cyan-brand/15 text-cyan-brand ring-cyan-brand/30',
    violet: 'bg-violet-brand/15 text-violet-300 ring-violet-brand/30',
    gold: 'bg-gold-brand/15 text-gold-brand ring-gold-brand/30',
    slate: 'bg-white/5 text-text-dim ring-white/10',
    green: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
    red: 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${tones[tone]}`}>{children}</span>
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-brand">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-text-dim">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-4 sm:p-5 ${className}`}>{children}</div>
}

export function Notice({ tone = 'info', children, title }: { tone?: 'info' | 'warn' | 'error'; children: ReactNode; title?: string }) {
  const c = tone === 'error' ? 'border-rose-400/40 bg-rose-400/10 text-rose-100' : tone === 'warn' ? 'border-gold-brand/40 bg-gold-brand/10 text-amber-100' : 'border-cyan-brand/30 bg-cyan-brand/10 text-cyan-50'
  const Icon = tone === 'info' ? Info : AlertCircle
  return (
    <div className={`flex gap-3 rounded-xl border p-3 text-sm ${c}`} role={tone === 'error' ? 'alert' : 'note'}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{title && <p className="font-semibold">{title}</p>}<div className="text-[0.92em] opacity-90">{children}</div></div>
    </div>
  )
}

export const buttonPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-brand px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'
export const buttonGhost = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-text-main transition hover:border-cyan-brand/60 hover:bg-cyan-brand/10 disabled:cursor-not-allowed disabled:opacity-50'

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { to: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
      <p className="font-display text-lg text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-dim">{body}</p>
      {action && <Link to={action.to} className={`${buttonPrimary} mt-4`}>{action.label}</Link>}
    </div>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-2 p-10" role="status" aria-live="polite">
      <div className="spinner" />
      <span className="text-xs text-text-dim">{label}…</span>
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-cyan-brand to-violet-brand" style={{ width: `${v}%` }} />
    </div>
  )
}
