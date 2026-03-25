import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Briefcase, FileText, Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import employeeService from '@/services/employeeService'
import jobService from '@/services/jobService'
import jobApplicationService from '@/services/jobApplicationService'
import interviewService from '@/services/interviewService'

function StatCard({ icon: Icon, label, value, color, to, loading }) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              {loading ? (
                <div className="h-7 w-12 bg-slate-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-brand-dark">{value ?? '—'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    Promise.allSettled([
      employeeService.getAll({ page_size: 1 }),
      jobService.getAll({ status: 'open', page_size: 1 }),
      jobApplicationService.getAll({ page_size: 1 }),
      interviewService.getAll({ scheduled_date: today, page_size: 1 }),
    ]).then(([employees, jobs, applications, interviews]) => {
      setStats({
        employees: employees.status === 'fulfilled' ? employees.value.data.count ?? employees.value.data.length : '?',
        openJobs: jobs.status === 'fulfilled' ? jobs.value.data.count ?? jobs.value.data.length : '?',
        activeApplications: applications.status === 'fulfilled' ? applications.value.data.count ?? applications.value.data.length : '?',
        interviewsToday: interviews.status === 'fulfilled' ? interviews.value.data.count ?? interviews.value.data.length : '?',
      })
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-dark">Overview</h2>
        <p className="text-slate-500 text-sm mt-0.5">Welcome back — here&apos;s a quick snapshot.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Employees"
          value={stats.employees}
          color="bg-brand-blue"
          to="/employees"
          loading={loading}
        />
        <StatCard
          icon={Briefcase}
          label="Open Jobs"
          value={stats.openJobs}
          color="bg-emerald-600"
          to="/jobs"
          loading={loading}
        />
        <StatCard
          icon={FileText}
          label="Active Applications"
          value={stats.activeApplications}
          color="bg-brand-blue-light"
          to="/job-applications"
          loading={loading}
        />
        <StatCard
          icon={Video}
          label="Interviews Today"
          value={stats.interviewsToday}
          color="bg-brand-red"
          to="/interviews"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-brand-dark mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Add New Employee', to: '/employees' },
                { label: 'Post a Job', to: '/jobs' },
                { label: 'Review Applications', to: '/job-applications' },
                { label: 'Schedule Interview', to: '/interviews' },
                { label: 'Manage Time Off Requests', to: '/time-off' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-brand-blue hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-brand-dark mb-3">HR Modules</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue inline-block" />
                Employee Management
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Position &amp; Salary Bands
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue-light inline-block" />
                Recruitment Pipeline
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
                Time Off Tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-red inline-block" />
                Performance Reviews
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
