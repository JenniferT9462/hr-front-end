export function Spinner() {
  return <div className="spinner" />
}

export function SpinnerOverlay({ message = 'Loading...' }) {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
      <p className="spinner-label">{message}</p>
    </div>
  )
}
