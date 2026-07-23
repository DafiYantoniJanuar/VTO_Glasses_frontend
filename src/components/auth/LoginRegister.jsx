import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import showcaseImg from '../../assets/glasses_showcase.png'
import './LoginRegister.css'

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

function LoginRegister() {
  const navigate = useNavigate()
  const { user, login, register, googleLogin, guestLogin } = useAuth()
  
  const [activeTab, setActiveTab] = useState('login')
  const [toast, setToast] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Unify password visibility states (ponytail)
  const [showPass, setShowPass] = useState({ pwd: false, confirm: false })
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleEmailInput, setGoogleEmailInput] = useState('')
  
  const formRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.email === 'admin@vtogla.com') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, navigate])

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setToast(null)
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    setShowPass({ pwd: false, confirm: false })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setToast(null)
    setIsSubmitting(true)

    try {
      if (activeTab === 'register') {
        if (formData.password.length < 8) {
          setToast({ type: 'error', message: 'Kata sandi minimal harus 8 karakter!' })
          setIsSubmitting(false)
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setToast({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok!' })
          setIsSubmitting(false)
          return
        }

        const res = await register(
          formData.name.trim(),
          formData.email,
          formData.password,
          formData.confirmPassword
        )

        if (res.success) {
          setToast({ type: 'success', message: 'Registrasi berhasil! Silakan masuk.' })
          handleTabSwitch('login')
        } else {
          setToast({ type: 'error', message: res.error || 'Registrasi gagal.' })
        }
      } else {
        const res = await login(formData.email, formData.password)
        if (!res.success) {
          setToast({ type: 'error', message: res.error || 'Email atau kata sandi salah.' })
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Gagal menghubungkan ke server.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmGoogleLogin = async (e) => {
    e.preventDefault()
    if (!googleEmailInput.includes('@')) {
      setToast({ type: 'error', message: 'Format email Google tidak valid!' })
      return
    }

    setShowGoogleModal(false)
    setIsSubmitting(true)

    try {
      const prefix = googleEmailInput.split('@')[0]
      const nameFormatted = prefix.charAt(0).toUpperCase() + prefix.slice(1)
      
      const res = await googleLogin(googleEmailInput, nameFormatted)
      if (!res.success) {
        setToast({ type: 'error', message: res.error || 'Login Google gagal.' })
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Gagal login Google.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="vto-page-wrapper">
        <div className="vto-login-card">
          
          {/* Left side: Premium Brand Showcase */}
          <div className="vto-login-left">
            <div className="vto-left-header">
              <span className="vto-brand-logo">VTO Glasses</span>
            </div>

            <div className="vto-showcase-stage">
              <img src={showcaseImg} className="vto-showcase-img" alt="Luxury Frame" />
              <div className="vto-3d-badge">Showroom Premium</div>
            </div>

            <div className="vto-left-footer">
              <h1 className="vto-brand-title">AURA EYEWEAR</h1>
              <p className="vto-brand-tagline">Defining Clarity and Style</p>
            </div>
          </div>

          {/* Right side: Minimalist Silent Luxury Auth Form */}
          <div className="vto-login-right">
            <div className="vto-form-selector">
              <button 
                type="button" 
                className={`vto-selector-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('login')}
              >
                Log In
              </button>
              <span className="vto-selector-divider">/</span>
              <button 
                type="button" 
                className={`vto-selector-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('register')}
              >
                Register
              </button>
            </div>

            <form ref={formRef} className="vto-form-body" onSubmit={handleSubmit}>
              <div className="vto-form-header">
                <h2 className="vto-form-title">
                  {activeTab === 'login' ? 'Selamat Datang' : 'Buat Akun'}
                </h2>
                <p className="vto-form-desc">
                  {activeTab === 'login' 
                    ? 'Masuk untuk mengakses katalog kacamata dan fitting room.' 
                    : 'Daftar untuk menikmati uji kacamata AR secara real-time.'
                  }
                </p>
              </div>

              {toast && (
                <div className={`vto-toast-alert ${toast.type}`}>
                  <span>{toast.message}</span>
                  <button type="button" className="vto-toast-close" onClick={() => setToast(null)}>&times;</button>
                </div>
              )}

              <div className="vto-form-fields">
                {activeTab === 'register' && (
                  <div className="vto-input-group">
                    <label className="vto-input-label">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="name"
                      className="vto-input-field" 
                      placeholder="Jane Doe" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                )}

                <div className="vto-input-group">
                  <label className="vto-input-label">Alamat Email</label>
                  <input 
                    type="email" 
                    name="email"
                    className="vto-input-field" 
                    placeholder="name@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="vto-input-group">
                  <label className="vto-input-label">Kata Sandi</label>
                  <div className="vto-password-wrapper">
                    <input 
                      type={showPass.pwd ? 'text' : 'password'}
                      name="password"
                      className="vto-input-field" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                    />
                    <button 
                      type="button" 
                      className="vto-pwd-toggle" 
                      onClick={() => setShowPass(prev => ({ ...prev, pwd: !prev.pwd }))}
                    >
                      {showPass.pwd ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {activeTab === 'register' && (
                  <div className="vto-input-group">
                    <label className="vto-input-label">Konfirmasi Kata Sandi</label>
                    <div className="vto-password-wrapper">
                      <input 
                        type={showPass.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        className="vto-input-field" 
                        placeholder="••••••••" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                      />
                      <button 
                        type="button" 
                        className="vto-pwd-toggle" 
                        onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPass.confirm ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="vto-action-container">
                <button type="submit" className="vto-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="vto-btn-loading-content">
                      <span className="vto-spinner-dots" /> Memproses...
                    </span>
                  ) : (
                    activeTab === 'login' ? 'Sign In' : 'Sign Up'
                  )}
                </button>

                <button 
                  type="button" 
                  className="vto-btn-google" 
                  disabled={isSubmitting}
                  onClick={() => { setGoogleEmailInput(formData.email); setShowGoogleModal(true); }}
                >
                  <svg className="vto-google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <button 
                  type="button" 
                  className="vto-btn-guest" 
                  disabled={isSubmitting}
                  onClick={() => { guestLogin(); navigate('/dashboard'); }}
                >
                  Continue as Guest
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Google Login Simulation Modal */}
      {showGoogleModal && (
        <div className="vto-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="vto-google-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vto-modal-header">
              <h3 className="vto-modal-title">Simulasi Google Sign In</h3>
              <button className="btn-modal-close" onClick={() => setShowGoogleModal(false)}>&times;</button>
            </div>
            <p className="vto-modal-desc">
              Masukkan email Google untuk memicu simulasi login.
            </p>

            <div className="vto-input-group" style={{ marginBottom: '18px' }}>
              <label className="vto-input-label">Alamat Email Google</label>
              <input 
                type="email" 
                className="vto-input-field" 
                placeholder="user@gmail.com" 
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-modal-cancel" style={{ border: '1px solid #E5DBD0', padding: '8px 16px', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} onClick={() => setShowGoogleModal(false)}>
                Batal
              </button>
              <button type="button" className="vto-btn-primary" style={{ width: 'auto', padding: '8px 20px', margin: 0 }} onClick={handleConfirmGoogleLogin} disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LoginRegister
