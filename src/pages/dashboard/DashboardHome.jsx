import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Glasses3DViewer from '../../components/3d/Glasses3DViewer'
import './DashboardHome.css'

function DashboardHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('3d-showcase')
  const [favoritesList, setFavoritesList] = useState([])
  const [loadingFavs, setLoadingFavs] = useState(false)

  const loadUserFavorites = async () => {
    setLoadingFavs(true)
    try {
      if (user?.token) {
        const res = await fetch('http://localhost:8000/api/favorites', {
          headers: { 'Authorization': `Bearer ${user.token}`, 'Accept': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          setFavoritesList(json.data || [])
          return
        }
      }
      setFavoritesList(JSON.parse(localStorage.getItem('vto_favorites') || '[]'))
    } catch {
      setFavoritesList(JSON.parse(localStorage.getItem('vto_favorites') || '[]'))
    } finally {
      setLoadingFavs(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'wishlist') {
      loadUserFavorites()
    }
  }, [activeTab])

  const handleRemoveFavorite = async (product) => {
    if (user?.token && product.id) {
      try {
        await fetch('http://localhost:8000/api/favorites/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
          body: JSON.stringify({ product_id: product.id })
        })
      } catch (e) { console.error(e) }
    }
    let localFavs = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
    localStorage.setItem('vto_favorites', JSON.stringify(localFavs.filter(p => p.id !== product.id)))
    loadUserFavorites()
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0)

  return (
    <div className="dash-wrapper">
      <div className="dash-header">
        <h1 className="dash-title">My Account & Studio</h1>
        <p className="dash-subtitle">Manage your profile, interactive 3D glasses preview, and wishlist.</p>
      </div>

      <div className="dash-content">
        {/* Sidebar Nav */}
        <div className="dash-sidebar">
          <button 
            className={`dash-nav-item ${activeTab === '3d-showcase' ? 'active' : ''}`}
            onClick={() => setActiveTab('3d-showcase')}
          >
            3D Model Showcase
          </button>
          <button 
            className={`dash-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist / Favorit ({favoritesList.length})
          </button>
          <button 
            className={`dash-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`dash-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`dash-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <div className="dash-nav-divider"></div>
          <button onClick={logout} className="dash-nav-item text-danger">
            Logout
          </button>
        </div>

        {/* Main Panel */}
        <div className="dash-panel">
          {activeTab === '3d-showcase' && (
            <div className="dash-tab-content">
              
              <Glasses3DViewer modelUrl="/models/glasses_2.glb" height="340px" modelScale={4.0} showControls={true} />
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="dash-tab-content">
              <h2 className="dash-tab-title">Daftar Kacamata Favorit Anda</h2>
              <p style={{ color: '#D4C5B9', marginBottom: '20px', fontSize: '0.88rem' }}>
                Koleksi kacamata pilihan Anda yang tersimpan aman di akun ini.
              </p>

              {loadingFavs ? (
                <p style={{ color: '#9C9086' }}>Memuat daftar favorit...</p>
              ) : favoritesList.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'rgba(28,24,22,0.4)', borderRadius: '10px', border: '1px dashed #38312E' }}>
                  <p style={{ color: '#D4C5B9', marginBottom: '12px' }}>Belum ada kacamata yang difavoritkan.</p>
                  <button 
                    onClick={() => navigate('/catalog')}
                    style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: '#C5A880', color: '#1C1816', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                  >
                    Jelajahi Katalog Kacamata
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {favoritesList.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        backgroundColor: '#1C1816', 
                        borderRadius: '10px', 
                        padding: '16px', 
                        border: '1px solid #38312E',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <h4 style={{ color: '#FFF', margin: '0 0 6px 0' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#C5A880', background: 'rgba(197, 168, 128, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.shape} • {item.color}
                        </span>
                        <p style={{ color: '#D4C5B9', fontWeight: '600', margin: '12px 0 6px 0', fontSize: '0.95rem' }}>
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <button
                          onClick={() => navigate(`/tryon/${item.id}`)}
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', backgroundColor: '#C5A880', color: '#1C1816', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Try-On
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(item)}
                          style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', cursor: 'pointer', fontSize: '0.8rem' }}
                          title="Hapus dari Favorit"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="dash-tab-content">
              <h2 className="dash-tab-title">Profile Details</h2>
              <div className="dash-form">
                <div className="dash-field">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user?.name || 'Guest User'} disabled={user?.isGuest} />
                </div>
                <div className="dash-field">
                  <label>Email Address</label>
                  <input type="email" defaultValue={user?.email || 'guest@example.com'} disabled={user?.isGuest} />
                </div>
                <div className="dash-field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+62 8..." disabled={user?.isGuest} />
                </div>
                {!user?.isGuest && (
                  <button className="dash-btn-save">Save Changes</button>
                )}
                {user?.isGuest && (
                  <p className="dash-guest-note">You are currently logged in as a Guest. Register an account to save your details.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="dash-tab-content">
              <h2 className="dash-tab-title">Preferences</h2>
              <p style={{ color: '#D4C5B9' }}>Virtual Try-On, camera calibration, and notification preferences will appear here.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="dash-tab-content">
              <h2 className="dash-tab-title">Security</h2>
              <p style={{ color: '#D4C5B9' }}>Password and two-factor authentication settings will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
