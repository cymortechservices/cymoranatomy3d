import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box } from 'lucide-react'
import NotFoundPage from './NotFoundPage'
import { Card, buttonPrimary } from '../components/common/ui'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { StructureInformationPanel } from '../components/anatomy/StructureInformationPanel'
import { getStructure } from '../data/structures'
import { LESSONS } from '../data/lessons'
import { QUESTIONS } from '../data/questions'
import { atlasLinkFor } from '../lib/atlasLinks'
import { crumbsForStructure } from '../lib/breadcrumbs'
import { useUserData } from '../contexts/UserDataContext'

export default function StructurePage() {
  const { structureId = '' } = useParams()
  const s = getStructure(structureId)
  const { addRecent } = useUserData()
  useEffect(() => { if (s) addRecent(s.id) }, [s, addRecent])
  if (!s) return <NotFoundPage what="structure" />
  const lessons = LESSONS.filter((l) => l.related_structure_ids.includes(s.id))
  const questions = QUESTIONS.filter((q) => q.structure_id === s.id).length
  const has3D = !!atlasLinkFor(s.id)

  return (
    <div className="space-y-5">
      <Breadcrumb items={crumbsForStructure(s.id)} />
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card><StructureInformationPanel structure={s} /></Card>
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-base font-semibold text-white">Explore further</h2>
            {has3D ? <Link to={`/laboratory?structure=${s.id}`} className={`${buttonPrimary} w-full`}><Box className="h-4 w-4" aria-hidden />View in the 3D laboratory</Link> : <p className="text-sm text-text-dim">No 3D model of this structure is available yet.</p>}
            {questions > 0 && <p className="text-sm text-text-dim">{questions} quiz question{questions === 1 ? '' : 's'} cover this structure. <Link className="text-cyan-brand hover:underline" to={`/quiz?topic=${s.system_id}`}>Practise</Link></p>}
          </Card>
          {lessons.length > 0 && <Card className="space-y-2"><h2 className="font-display text-base font-semibold text-white">Related lessons</h2><ul className="space-y-1.5">{lessons.map((l) => <li key={l.id}><Link to={`/study/${l.id}`} className="block rounded-lg bg-ink-800/60 px-3 py-2 text-sm hover:bg-ink-700/70">{l.title}</Link></li>)}</ul></Card>}
        </div>
      </div>
    </div>
  )
}
