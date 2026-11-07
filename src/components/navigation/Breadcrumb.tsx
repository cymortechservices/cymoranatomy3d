import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb { label: string; to?: string }

/** Human Body > System > Region > Organ > Structure. Every ancestor is a link so learners can navigate back. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Anatomical breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-text-dim">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />}
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="rounded px-1 py-0.5 hover:bg-white/10 hover:text-cyan-brand">{c.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className={i === items.length - 1 ? 'font-semibold text-white' : ''}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
