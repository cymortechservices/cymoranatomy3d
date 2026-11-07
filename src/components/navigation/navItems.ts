import { BookOpen, Bookmark, Bot, Boxes, FlaskConical, GraduationCap, Home, LayoutDashboard, Microscope, Activity, Baby, Compass, ListChecks, Info, Library, User, type LucideIcon } from 'lucide-react'

export interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/laboratory', label: '3D Laboratory', icon: FlaskConical },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/systems', label: 'Body systems', icon: Boxes },
  { to: '/study', label: 'Study centre', icon: BookOpen },
  { to: '/histology', label: 'Histology', icon: Microscope },
  { to: '/physiology', label: 'Physiology', icon: Activity },
  { to: '/embryology', label: 'Embryology', icon: Baby },
  { to: '/quiz', label: 'Quizzes', icon: GraduationCap },
  { to: '/tutor', label: 'AI tutor', icon: Bot },
]

export const PERSONAL_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/progress', label: 'Progress', icon: ListChecks },
  { to: '/profile', label: 'Profile', icon: User },
]

export const INFO_NAV: NavItem[] = [
  { to: '/about', label: 'About', icon: Info },
  { to: '/references', label: 'References', icon: Library },
]

export const BOTTOM_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/laboratory', label: 'Lab', icon: FlaskConical },
  { to: '/study', label: 'Study', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', icon: GraduationCap },
  { to: '/tutor', label: 'Tutor', icon: Bot },
]
