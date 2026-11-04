import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      getProfile()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.clear(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loginUser = (data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
  }

  const logoutUser = () => {
    localStorage.clear()
    setUser(null)
  }

  const updateUser = (userData) => setUser(prev => ({ ...prev, ...userData }))

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
