import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/ui'
import { TutorChat } from '../components/tutor/TutorChat'
import { getStructure } from '../data/structures'
import { getLesson } from '../data/lessons'
import { getOrgan } from '../data/organs'
import { getRegion } from '../data/regions'
import { getSystem } from '../data/systems'
import type { TutorContext } from '../types'

export default function TutorPage() {
  const [p] = useSearchParams()
  const context = useMemo<TutorContext>(() => {
    const s = p.get('structure') ? getStructure(p.get('structure')!) : undefined
    const l = p.get('lesson') ? getLesson(p.get('lesson')!) : undefined
    if (s) return { system: getSystem(s.system_id)?.name, region: getRegion(s.region_id)?.name, organ: getOrgan(s.organ_id)?.name, structure: s.anatomical_name, topic: 'Structural characteristics, adaptations and functions' }
    if (l) return { system: getSystem(l.system_id)?.name, region: l.region_id ? getRegion(l.region_id)?.name : undefined, organ: l.organ_id ? getOrgan(l.organ_id)?.name : undefined, lesson: l.title, topic: l.summary }
    return {}
  }, [p])
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="AI anatomy tutor" title="Your anatomy tutor" subtitle="Explanations, comparisons, revision notes, flashcards and practice questions, aware of the structure or lesson you came from." />
      <TutorChat context={context} key={JSON.stringify(context)} />
    </div>
  )
}
