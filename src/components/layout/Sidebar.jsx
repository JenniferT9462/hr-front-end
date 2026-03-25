import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Star,
  ClipboardList,
  UserSearch,
  FileText,
  Video,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import Swal from 'sweetalert2'

const navSections = [
  {
    title: null,
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'HR',
    items: [
      { label: 'Employees', to: '/employees', icon: Users },
      { label: 'Positions', to: '/positions', icon: Briefcase },
      { label: 'Time Off', to: '/time-off', icon: Calendar },
      { label: 'Performance Reviews', to: '/performance', icon: Star },
    ],
  },
  {
    title: 'Recruitment',
    items: [
      { label: 'Jobs', to: '/jobs', icon: ClipboardList },
      { label: 'Applicants', to: '/applicants', icon: UserSearch },
      { label: 'Job Applications', to: '/job-applications', icon: FileText },
      { label: 'Interviews', to: '/interviews', icon: Video },
    ],
  },
]

export default function Sidebar({ collapsed, onClose }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign out?',
      text: 'You will be redirected to the login page.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4E89BD',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sign out',
    })

    if (result.isConfirmed) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-30 flex h-full w-64 flex-col bg-brand-dark text-white transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto',
          collapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-brand-blue flex items-center justify-center font-bold text-white text-sm">
            HR
          </div>
          <span className="font-semibold text-lg tracking-tight">HR Portal</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section, i) => (
            <div key={i} className="mb-4">
              {section.title && (
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-blue text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center text-sm font-semibold uppercase">
                {(user.first_name?.[0] || user.username?.[0] || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                </p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
