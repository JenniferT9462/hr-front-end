export function Table({ className = '', ...props }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className={`table ${className}`} {...props} />
    </div>
  )
}
export function TableHeader(props)                      { return <thead {...props} /> }
export function TableBody(props)                        { return <tbody {...props} /> }
export function TableRow({ className = '', ...props })  { return <tr className={className} {...props} /> }
export function TableHead({ className = '', ...props }) { return <th className={className} {...props} /> }
export function TableCell({ className = '', ...props }) { return <td className={className} {...props} /> }
