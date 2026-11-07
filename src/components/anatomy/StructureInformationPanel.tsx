import { Link } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Bot, ExternalLink, Microscope } from 'lucide-react'
import type { Structure } from '../../types'
import { getStructure } from '../../data/structures'
import { Badge, buttonGhost } from '../common/ui'
import { useUserData } from '../../contexts/UserDataContext'
import { histologyTopicFor } from '../../lib/tissue'

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="font-display text-sm font-semibold text-cyan-brand">{title}</h3>
      {hint && <p className="text-[11px] italic text-text-dim">{hint}</p>}
      <div className="text-sm text-text-main">{children}</div>
    </section>
  )
}
const Bullets = ({ items }: { items: string[] }) => <ul className="ml-4 list-disc space-y-1">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>

interface Props {
  structure: Structure
  /** When set, related-structure chips call this instead of navigating (used inside the laboratory). */
  onSelectRelated?: (structureId: string) => void
  onOpenTissue?: (topicId: string) => void
  compact?: boolean
}

/** Shows only the fields that apply to the structure. Characteristics / adaptations / functions are kept distinct. */
export function StructureInformationPanel({ structure: s, onSelectRelated, onOpenTissue, compact }: Props) {
  const { isBookmarked, toggleBookmark } = useUserData()
  const marked = isBookmarked(s.id)
  const tissue = histologyTopicFor(s.id)
  const characteristics = [...(s.external_characteristics ?? []), ...(s.internal_characteristics ?? [])]

  return (
    <article className="space-y-4" data-testid="structure-panel" aria-label={`Information about ${s.anatomical_name}`}>
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-white">{s.anatomical_name}</h2>
            <p className="text-sm text-text-dim">{s.common_name}{s.synonyms.length > 0 && ` · also: ${s.synonyms.join(', ')}`}</p>
          </div>
          <button
            onClick={() => toggleBookmark(s.id)}
            aria-pressed={marked}
            aria-label={marked ? `Remove ${s.anatomical_name} from bookmarks` : `Bookmark ${s.anatomical_name}`}
            className="shrink-0 rounded-lg border border-white/15 p-2 text-cyan-brand hover:bg-cyan-brand/10"
          >
            {marked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="violet">{s.classification}</Badge>
          <Badge tone={s.difficulty_level === 'beginner' ? 'green' : s.difficulty_level === 'intermediate' ? 'gold' : 'red'}>{s.difficulty_level}</Badge>
        </div>
      </header>

      <Section title="Location">
        <p>{s.location}</p>
        {s.anatomical_position && <p className="mt-1 text-text-dim">{s.anatomical_position}</p>}
      </Section>

      {characteristics.length > 0 && <Section title="Characteristics" hint="What the structure is like."><Bullets items={characteristics} /></Section>}
      {s.structural_adaptations && s.structural_adaptations.length > 0 && <Section title="Adaptations" hint="How its structure supports its function."><Bullets items={s.structural_adaptations} /></Section>}
      <Section title="Functions" hint="What it does."><Bullets items={s.functions} /></Section>

      {s.blood_supply && <Section title="Blood supply"><p>{s.blood_supply}</p></Section>}
      {s.nerve_supply && <Section title="Nerve supply"><p>{s.nerve_supply}</p></Section>}
      {s.lymphatic_drainage && <Section title="Lymphatic drainage"><p>{s.lymphatic_drainage}</p></Section>}
      {s.articulations && <Section title="Articulations"><Bullets items={s.articulations} /></Section>}
      {s.attachments && <Section title="Attachments"><Bullets items={s.attachments} /></Section>}
      {s.anatomical_relations && <Section title="Anatomical relations"><Bullets items={s.anatomical_relations} /></Section>}
      {s.clinical_relevance && s.clinical_relevance.length > 0 && <Section title="Clinical relevance"><Bullets items={s.clinical_relevance} /></Section>}

      <Section title="Related structures">
        <div className="flex flex-wrap gap-1.5">
          {s.related_structures.map((id) => {
            const r = getStructure(id)
            if (!r) return null
            return onSelectRelated ? (
              <button key={id} onClick={() => onSelectRelated(id)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-cyan-brand hover:text-cyan-brand">{r.anatomical_name}</button>
            ) : (
              <Link key={id} to={`/structure/${id}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-cyan-brand hover:text-cyan-brand">{r.anatomical_name}</Link>
            )
          })}
        </div>
      </Section>

      {!compact && (
        <Section title="References">
          <ul className="space-y-1 text-xs text-text-dim">{s.references.map((r) => <li key={r.title}>{r.title}, {r.source}{r.note ? `. ${r.note}` : ''}</li>)}</ul>
        </Section>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {compact && <Link to={`/structure/${s.id}`} className={buttonGhost}><ExternalLink className="h-4 w-4" aria-hidden />Full page</Link>}
        <Link to={`/tutor?structure=${s.id}`} className={buttonGhost}><Bot className="h-4 w-4" aria-hidden />Ask the tutor</Link>
        {tissue && (onOpenTissue ? (
          <button onClick={() => onOpenTissue(tissue)} className={buttonGhost}><Microscope className="h-4 w-4" aria-hidden />Tissue level</button>
        ) : (
          <Link to={`/histology?topic=${tissue}`} className={buttonGhost}><Microscope className="h-4 w-4" aria-hidden />Tissue level</Link>
        ))}
      </div>
      <p className="text-[11px] text-text-dim">Educational summary for study. Not medical advice. Check your course textbook for exam content.</p>
    </article>
  )
}
