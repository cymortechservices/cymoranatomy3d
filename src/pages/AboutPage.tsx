import { Link } from 'react-router-dom'
import { Card, PageHeader, buttonGhost } from '../components/common/ui'
import { useIntro } from '../contexts/IntroContext'
import { isBackendConfigured } from '../lib/supabase'

export default function AboutPage() {
  const { replayIntro } = useIntro()
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="About" title="CYMOR ANATOMY 3D" subtitle="Explore the Human Body. Understand Every Structure." />
      <Card className="space-y-3 text-sm text-text-main">
        <p>CYMOR ANATOMY 3D is a free interactive anatomy and medical education platform for students of medicine, nursing, biomedical science and related health subjects. It combines an interactive 3D laboratory, structured notes, histology, physiology animations, assessments and an AI tutor.</p>
        <p><strong className="text-white">Developed by Legendary Smiley Cymor.</strong> Powered by CymorTechServices. © CymorTechServices 2026.</p>
        <p>The platform is free. There are no paid tiers and no locked content.</p>
      </Card>
      <Card className="space-y-3 text-sm">
        <h2 className="font-display text-lg font-semibold text-white">What is and is not included</h2>
        <ul className="ml-5 list-disc space-y-1.5 text-text-main">
          <li>The 3D models are original <strong>schematic</strong> models for learning names and relative positions. They are not scan-based or sculpted anatomical models. Real licensed GLB models can be added through the model manifest.</li>
          <li>Cardiovascular and skeletal systems have demonstration-level content. The other ten systems have introductory notes only and are labelled that way.</li>
          <li>Histology images are schematic drawings. They are not microscope slides.</li>
          <li>The AI tutor can make mistakes and is not medically authoritative. Always check against your course materials.</li>
          <li>Backend features (accounts, cloud sync, AI tutor) are {isBackendConfigured ? 'configured in this deployment.' : 'not configured in this deployment, so the app is running in demo mode: your data is stored only in this browser.'}</li>
        </ul>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Link to="/references" className={buttonGhost}>References and attribution</Link>
        <Link to="/" onClick={replayIntro} className={buttonGhost}>Replay the intro</Link>
      </div>
    </div>
  )
}
