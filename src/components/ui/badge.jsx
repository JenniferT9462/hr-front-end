const STATUS_MAP = {
  active:     { cls: 'badge-active',     label: 'Active' },
  inactive:   { cls: 'badge-inactive',   label: 'Inactive' },
  terminated: { cls: 'badge-terminated', label: 'Terminated' },
  pending:    { cls: 'badge-pending',    label: 'Pending' },
  approved:   { cls: 'badge-approved',   label: 'Approved' },
  rejected:   { cls: 'badge-rejected',   label: 'Rejected' },
  open:       { cls: 'badge-open',       label: 'Open' },
  closed:     { cls: 'badge-closed',     label: 'Closed' },
  hired:      { cls: 'badge-hired',      label: 'Hired' },
  warning:    { cls: 'badge-warning',    label: 'Warning' },
  danger:     { cls: 'badge-danger',     label: 'Danger' },
  true:       { cls: 'badge-active',     label: 'Yes' },
  false:      { cls: 'badge-inactive',   label: 'No' },
}

const VARIANT_CLS = {
  default:    'badge-default',
  active:     'badge-active',
  inactive:   'badge-inactive',
  terminated: 'badge-terminated',
  pending:    'badge-pending',
  approved:   'badge-approved',
  rejected:   'badge-rejected',
  open:       'badge-open',
  closed:     'badge-closed',
  hired:      'badge-hired',
  warning:    'badge-warning',
  danger:     'badge-danger',
  outline:    'badge-inactive',
  success:    'badge-active',
}

export function Badge({ className = '', variant = 'default', ...props }) {
  return <span className={`badge ${VARIANT_CLS[variant] ?? 'badge-default'} ${className}`} {...props} />
}

export function StatusBadge({ status }) {
  const key = String(status).toLowerCase()
  const config = STATUS_MAP[key] ?? { cls: 'badge-default', label: status }
  return <span className={`badge ${config.cls}`}>{config.label}</span>
}
