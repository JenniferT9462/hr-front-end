import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { SpinnerOverlay } from '@/components/ui/spinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerOverlay message="Checking session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
