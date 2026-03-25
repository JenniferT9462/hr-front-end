const VARIANT = {
  default:     'btn btn-primary',
  outline:     'btn btn-outline',
  ghost:       'btn btn-ghost',
  destructive: 'btn btn-danger',
  secondary:   'btn btn-outline',
  link:        'btn btn-ghost',
}
const SIZE = {
  sm:   'btn-sm',
  md:   '',
  lg:   '',
  icon: 'btn-icon',
}

export function Button({ className = '', variant = 'default', size = 'md', ...props }) {
  const cls = [VARIANT[variant] ?? 'btn btn-primary', SIZE[size] ?? '', className].filter(Boolean).join(' ')
  return <button className={cls} {...props} />
}

export function buttonVariants({ variant = 'default', size = 'md', className = '' } = {}) {
  return [VARIANT[variant] ?? 'btn btn-primary', SIZE[size] ?? '', className].filter(Boolean).join(' ')
}
