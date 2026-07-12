import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import showcaseImg from '../../assets/glasses_showcase.png'
import './LoginRegister.css'

function LoginRegister() {
  const navigate = useNavigate()
  const { user, loading, login, register, googleLogin, guestLogin } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation to prevent basic bypassing
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Format email tidak valid!')
      return
    }

    if (formData.password.length < 8) {
      alert('Kata sandi minimal harus 8 karakter!')
      return
    }

    if (activeTab === 'register') {
      if (!formData.name.trim()) {
        alert('Nama lengkap tidak boleh kosong!')
        return
      }

      const res = await register(formData.name.trim(), formData.email, formData.password)
      if (res.success) {
        setTimeout(() => {
          alert('Pemberitahuan: Registrasi berhasil! Silakan masuk.')
          setActiveTab('login')
          setFormData(prev => ({ ...prev, password: '' })) // Clear password field
        }, 100)
      } else {
        setTimeout(() => {
          alert(res.error)
        }, 100)
      }
    } else if (activeTab === 'login') {
      const res = await login(formData.email, formData.password)
      if (res.success) {
        setTimeout(() => {
          alert(`Selamat datang, ${res.userName}!`)
          navigate('/')
        }, 100)
      } else {
        setTimeout(() => {
          alert(res.error)
        }, 100)
      }
    }
  }

  const handleGoogleClick = async () => {
    const res = await googleLogin('googleuser@gmail.com', 'Google User')
    if (res.success) {
      setTimeout(() => {
        alert(`Selamat datang, ${res.userName}!`)
        navigate('/')
      }, 100)
    } else {
      setTimeout(() => {
        alert(res.error)
      }, 100)
    }
  }

  const handleGuestClick = () => {
    guestLogin()
    setTimeout(() => {
      alert('Selamat datang, Guest!')
      navigate('/')
    }, 100)
  }

  return (
    <>
      <div className="vto-page-wrapper">
        {/* Centered Main Layout Card */}
        <div className="vto-login-card">
          
          {/* Left side: Premium Image Showcase */}
          <div className="vto-login-left">
            <div className="vto-left-header">
              <span className="vto-brand-logo">VTO Glasses</span>
            </div>

            <div className="vto-showcase-stage">
              <div className="vto-stage-circle"></div>
              <div className="vto-3d-placeholder">
                <img src={showcaseImg} className="vto-showcase-img" alt="Luxury Tortoise Glasses Showcase" />
                <div className="vto-stage-shadow"></div>
                <div className="vto-3d-badge">3D Showcase Model</div>
                <p className="vto-3d-caption">Try before you buy — virtually.</p>
              </div>
            </div>

            <div className="vto-left-footer">
              <h1 className="vto-brand-title">Aura Eyewear</h1>
              <p className="vto-brand-tagline">Defining Clarity and Style</p>
            </div>
          </div>

          {/* Right side: Form container card */}
          <div className="vto-login-right">
            {/* Typographic Tab Switcher */}
            <div className="vto-form-selector">
              <button 
                type="button" 
                className={`vto-selector-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Log In
              </button>
              <span className="vto-selector-divider">/</span>
              <button 
                type="button" 
                className={`vto-selector-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            {/* Form with scrollable body */}
            <form className="vto-form-body" onSubmit={handleSubmit}>
              <div className="vto-form-header">
                <h2 className="vto-form-title">
                  {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="vto-form-desc">
                  {activeTab === 'login' 
                    ? 'Sign in to access your wishlist, custom fits, and checkout.' 
                    : 'Create your account'
                  }
                </p>
              </div>

              {/* Form Fields Area */}
              <div className="vto-form-fields">
                {/* Registration Fields */}
                {activeTab === 'register' && (
                  <div className="vto-input-group">
                    <label className="vto-input-label">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      className="vto-input-field" 
                      placeholder="Full Name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                )}

                <div className="vto-input-group">
                  <label className="vto-input-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    className="vto-input-field" 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="vto-input-group">
                  <label className="vto-input-label">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    className="vto-input-field" 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              {/* Action Buttons (Always visible at the bottom) */}
              <div className="vto-action-container">
                <button type="submit" className="vto-btn-primary">
                  {activeTab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>

                <button type="button" className="vto-btn-google" onClick={handleGoogleClick}>
                  <svg className="vto-google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <button type="button" className="vto-btn-guest" onClick={handleGuestClick}>
                  Continue as Guest
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(245, 239, 230, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100000,
          fontFamily: 'Outfit, sans-serif'
        }}>
          <div className="vto-loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '2px solid #D2C7BC',
            borderTop: '2px solid #C5A880',
            borderRadius: '50%',
            animation: 'vto-spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#1C1816'
          }}>
            Processing...
          </span>
          <style>{`
            @keyframes vto-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default LoginRegister
