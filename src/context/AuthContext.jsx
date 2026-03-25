import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('hr_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('hr_token')
    if (storedToken) {
      api.get('/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('hr_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/api-token-auth/', { username, password })
    const { token: newToken } = res.data
    localStorage.setItem('hr_token', newToken)
    setToken(newToken)
    const meRes = await api.get('/me/')
    setUser(meRes.data)
    return meRes.data
  }

  const logout = async () => {
    try {
      await api.post('/logout/')
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem('hr_token')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
