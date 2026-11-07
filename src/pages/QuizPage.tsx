import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/ui'
import { QuizRunner } from '../components/quizzes/QuizRunner'
import type { QuizConfig } from '../lib/quiz'

export default function QuizPage() {
  const [p] = useSearchParams()
  const t = p.get('topic')
  const topic = (['cardiovascular', 'skeletal', 'histology'].includes(t ?? '') ? t : 'all') as QuizConfig['topic']
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Assessment centre" title="Quizzes" subtitle="Multiple choice, true or false, matching, identify a part, label a diagram and fill in the term. Every answer comes with an explanation." />
      <QuizRunner initialTopic={topic} key={topic} />
    </div>
  )
}
