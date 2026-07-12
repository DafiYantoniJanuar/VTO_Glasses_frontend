import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vto_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(false)

  // Verify stored token on app load to prevent fake sessions (localStorage hijacking)
  useEffect(() => {
    const verifyToken = async () => {
      if (user && !user.isGuest && user.token) {
        try {
          const response = await fetch('http://localhost:8000/api/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Accept': 'application/json'
            }
          })
          if (!response.ok) {
            // Token is invalid/expired, log out
            setUser(null)
            localStorage.removeItem('vto_user')
          }
        } catch (error) {
          console.error('Session validation failed:', error)
        }
      }
    }
    verifyToken()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }

      const sessionData = {
        name: data.user.name,
        email: data.user.email,
        token: data.access_token,
        isGuest: false
      }

      setUser(sessionData)
      localStorage.setItem('vto_user', JSON.stringify(sessionData))
      return { success: true, userName: data.user.name }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      // Do NOT log the user in immediately per workflow requirements
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async (email, name) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, name })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed.')
      }

      const sessionData = {
        name: data.user.name,
        email: data.user.email,
        token: data.access_token,
        isGuest: false
      }

      setUser(sessionData)
      localStorage.setItem('vto_user', JSON.stringify(sessionData))
      return { success: true, userName: data.user.name }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const guestLogin = () => {
    const guestData = {
      isGuest: true
    }
    setUser(guestData)
    localStorage.setItem('vto_user', JSON.stringify(guestData))
  }

  const logout = async () => {
    setLoading(true)
    if (user && !user.isGuest && user.token) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        })
      } catch (error) {
        console.error('Logout error on backend:', error)
      }
    }
    setUser(null)
    localStorage.removeItem('vto_user')
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
