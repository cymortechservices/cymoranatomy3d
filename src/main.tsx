import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { loadRemoteContent } from './services/content'

// Merge optional database content over bundled data (bounded wait, never blocks demo mode), then render.
loadRemoteContent().catch(() => undefined).finally(() => {
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
})
