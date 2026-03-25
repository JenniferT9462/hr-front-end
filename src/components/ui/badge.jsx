import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-blue-pale text-brand-blue',
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-slate-100 text-slate-600',
        terminated: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        open: 'bg-brand-blue-pale text-brand-blue',
        closed: 'bg-slate-100 text-slate-600',
        hired: 'bg-green-100 text-green-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        outline: 'border border-slate-200 text-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export function StatusBadge({ status }) {
  const statusMap = {
    active: { variant: 'active', label: 'Active' },
    inactive: { variant: 'inactive', label: 'Inactive' },
    terminated: { variant: 'terminated', label: 'Terminated' },
    pending: { variant: 'pending', label: 'Pending' },
    approved: { variant: 'approved', label: 'Approved' },
    rejected: { variant: 'rejected', label: 'Rejected' },
    open: { variant: 'open', label: 'Open' },
    closed: { variant: 'closed', label: 'Closed' },
    hired: { variant: 'hired', label: 'Hired' },
    true: { variant: 'active', label: 'Yes' },
    false: { variant: 'inactive', label: 'No' },
  }

  const key = String(status).toLowerCase()
  const config = statusMap[key] || { variant: 'default', label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
