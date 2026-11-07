import { Link } from 'react-router-dom'
import { Box, Trash2 } from 'lucide-react'
import { Card, EmptyState, PageHeader } from '../components/common/ui'
import { DataModeBanner } from '../components/common/DataModeBanner'
import { useUserData } from '../contexts/UserDataContext'
import { getStructure } from '../data/structures'
import { atlasLinkFor } from '../lib/atlasLinks'

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useUserData()
  const items = bookmarks.map(getStructure).filter(Boolean)
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Saved" title="Bookmarks" subtitle="Structures you have saved for revision." />
      <DataModeBanner />
      {items.length === 0 ? <EmptyState title="No bookmarks yet" body="Open any structure and press the bookmark button to save it here." action={{ to: '/explore', label: 'Explore structures' }} /> : (
        <ul className="grid gap-3 md:grid-cols-2">{items.map((s) => s && (
          <li key={s.id}><Card className="flex items-center justify-between gap-3 !p-4">
            <Link to={`/structure/${s.id}`} className="min-w-0"><span className="block truncate font-semibold text-white hover:text-cyan-brand">{s.anatomical_name}</span><span className="text-xs text-text-dim">{s.common_name}</span></Link>
            <div className="flex shrink-0 gap-1.5">
              {atlasLinkFor(s.id) && <Link to={`/laboratory?structure=${s.id}`} aria-label={`View ${s.anatomical_name} in 3D`} className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 hover:border-cyan-brand"><Box className="h-4 w-4" /></Link>}
              <button onClick={() => toggleBookmark(s.id)} aria-label={`Remove ${s.anatomical_name} from bookmarks`} className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 hover:border-rose-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card></li>))}</ul>
      )}
    </div>
  )
}
