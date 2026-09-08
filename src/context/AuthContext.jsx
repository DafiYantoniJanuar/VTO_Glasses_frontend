/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vto_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Verify stored token on app load to prevent fake sessions
  useEffect(() => {
    const verifyToken = async () => {
      if (user && !user.isGuest && user.token) {
        try {
          const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Accept': 'application/json'
            }
          })
          if (response.ok) {
            const userData = await response.json()
            if (userData && userData.id) {
              const updatedSession = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role || user.role || 'user',
                token: user.token,
                isGuest: false
              }
              setUser(updatedSession)
              localStorage.setItem('vto_user', JSON.stringify(updatedSession))
              localStorage.setItem('auth_token', user.token)
            }
          } else {
            // Token is invalid/expired, log out
            setUser(null)
            localStorage.removeItem('vto_user')
            localStorage.removeItem('auth_token')
          }
        } catch (error) {
          console.error('Session validation failed:', error)
        }
      }
      setInitializing(false)
    }
    verifyToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        let errMsg = data.message || 'Login failed.'
        if (data.errors) {
          const firstErrKey = Object.keys(data.errors)[0]
          if (firstErrKey && data.errors[firstErrKey][0]) {
            errMsg = data.errors[firstErrKey][0]
          }
        }
        throw new Error(errMsg)
      }

      const sessionData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'user',
        token: data.access_token,
        isGuest: false
      }

      setUser(sessionData)
      localStorage.setItem('vto_user', JSON.stringify(sessionData))
      localStorage.setItem('auth_token', sessionData.token)
      return { success: true, userName: data.user.name }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, passwordConfirmation) => {
    setLoading(true)
    try {
      const payload = { name, email, password }
      if (passwordConfirmation) {
        payload.password_confirmation = passwordConfirmation
      }
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        let errMsg = data.message || 'Registration failed.'
        if (data.errors) {
          const firstErrKey = Object.keys(data.errors)[0]
          if (firstErrKey && data.errors[firstErrKey][0]) {
            errMsg = data.errors[firstErrKey][0]
          }
        }
        throw new Error(errMsg)
      }

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
      const response = await fetch(`${API_BASE_URL}/google-login`, {
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
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'user',
        token: data.access_token,
        isGuest: false
      }

      setUser(sessionData)
      localStorage.setItem('vto_user', JSON.stringify(sessionData))
      localStorage.setItem('auth_token', sessionData.token)
      return { success: true, userName: data.user.name }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const guestLogin = () => {
    const guestData = {
      isGuest: true,
      name: 'Guest'
    }
    setUser(guestData)
    localStorage.setItem('vto_user', JSON.stringify(guestData))
    localStorage.removeItem('auth_token')
    return { success: true }
  }

  const logout = async () => {
    setLoading(true)
    if (user && !user.isGuest && user.token) {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
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
    localStorage.removeItem('auth_token')
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, initializing, login, register, googleLogin, guestLogin, logout }}>
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

