import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserDataProvider } from './contexts/UserDataContext'
import { IntroProvider } from './contexts/IntroContext'
import { IntroOverlay } from './components/intro/IntroOverlay'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Spinner } from './components/common/ui'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'

const page = <T extends { default: React.ComponentType }>(f: () => Promise<T>) => lazy(f)
const Explore = page(() => import('./pages/ExplorePage'))
const Laboratory = page(() => import('./pages/LaboratoryPage'))
const Systems = page(() => import('./pages/SystemsPage'))
const SystemDetail = page(() => import('./pages/SystemDetailPage'))
const Organ = page(() => import('./pages/OrganPage'))
const Structure = page(() => import('./pages/StructurePage'))
const Study = page(() => import('./pages/StudyPage'))
const Lesson = page(() => import('./pages/LessonPage'))
const Histology = page(() => import('./pages/HistologyPage'))
const Physiology = page(() => import('./pages/PhysiologyPage'))
const Embryology = page(() => import('./pages/EmbryologyPage'))
const Quiz = page(() => import('./pages/QuizPage'))
const Tutor = page(() => import('./pages/TutorPage'))
const About = page(() => import('./pages/AboutPage'))
const References = page(() => import('./pages/ReferencesPage'))
const Dashboard = page(() => import('./pages/DashboardPage'))
const Bookmarks = page(() => import('./pages/BookmarksPage'))
const Progress = page(() => import('./pages/ProgressPage'))
const Profile = page(() => import('./pages/ProfilePage'))
const Auth = page(() => import('./pages/AuthPage'))
const Admin = page(() => import('./pages/AdminPage'))
const NotFound = page(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <UserDataProvider>
            <IntroProvider>
              <BrowserRouter>
                <IntroOverlay />
                <Suspense fallback={<div className="grid min-h-screen place-items-center"><Spinner /></div>}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route element={<AppLayout />}>
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/laboratory" element={<Laboratory />} />
                      <Route path="/systems" element={<Systems />} />
                      <Route path="/systems/:systemId" element={<SystemDetail />} />
                      <Route path="/organ/:organId" element={<Organ />} />
                      <Route path="/structure/:structureId" element={<Structure />} />
                      <Route path="/study" element={<Study />} />
                      <Route path="/study/:lessonId" element={<Lesson />} />
                      <Route path="/histology" element={<Histology />} />
                      <Route path="/physiology" element={<Physiology />} />
                      <Route path="/embryology" element={<Embryology />} />
                      <Route path="/quiz" element={<Quiz />} />
                      <Route path="/tutor" element={<Tutor />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/references" element={<References />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/bookmarks" element={<Bookmarks />} />
                      <Route path="/progress" element={<Progress />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </IntroProvider>
          </UserDataProvider>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}
