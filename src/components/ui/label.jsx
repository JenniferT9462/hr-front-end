export function Label({ className = '', ...props }) {
  return <label className={`form-label ${className}`} {...props} />
}
