import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/positions': 'Positions',
  '/time-off': 'Time Off Requests',
  '/performance': 'Performance Reviews',
  '/jobs': 'Jobs',
  '/applicants': 'Applicants',
  '/job-applications': 'Job Applications',
  '/interviews': 'Interviews',
}

export default function TopBar({ onMenuToggle }) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const title = routeTitles[pathname] || 'HR Portal'

  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user.username
    : ''

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-brand-blue-pale transition-colors"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 text-lg font-semibold text-brand-dark">{title}</h1>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
          <div className="h-7 w-7 rounded-full bg-brand-blue-pale flex items-center justify-center text-brand-blue font-semibold text-xs uppercase">
            {displayName?.[0] || 'U'}
          </div>
          <span className="font-medium">{displayName}</span>
        </div>
      </div>
    </header>
  )
}
