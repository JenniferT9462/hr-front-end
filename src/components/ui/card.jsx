export function Card({ className = '', ...props }) {
  return <div className={`card ${className}`} {...props} />
}
export function CardHeader({ className = '', ...props }) {
  return <div className={`card-header ${className}`} style={{ padding: '20px 20px 0' }} {...props} />
}
export function CardTitle({ className = '', ...props }) {
  return <h3 style={{ fontWeight: 700, color: 'var(--text)' }} className={className} {...props} />
}
export function CardContent({ className = '', ...props }) {
  return <div className={className} {...props} />
}
export function CardFooter({ className = '', ...props }) {
  return <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }} className={className} {...props} />
}
