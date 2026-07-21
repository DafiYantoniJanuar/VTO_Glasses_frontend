import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './DashboardLayout.css'

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
)

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"></path>
    <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
    <polyline points="12 8 12 12 14 14"></polyline>
  </svg>
)

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="vto-dashboard-wrapper">
      {/* Top Navbar */}
      <header className="vto-navbar">
        <Link to="/" className="vto-nav-logo">VTO Glasses</Link>

        <nav className="vto-nav-links">
          <NavLink to="/" end className={({ isActive }) => `vto-nav-link ${isActive ? 'active' : ''}`}>
            home
          </NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `vto-nav-link ${isActive ? 'active' : ''}`}>
            catalog
          </NavLink>
          <NavLink to="/checkout" className={({ isActive }) => `vto-nav-link ${isActive ? 'active' : ''}`}>
            sale
          </NavLink>
        </nav>

        <div className="vto-nav-actions">
          <button className="vto-nav-icon-btn" onClick={() => navigate('/catalog')}>
            <SearchIcon />
          </button>

          <button className="vto-nav-icon-btn" onClick={() => navigate('/checkout')}>
            <CartIcon />
          </button>

          <div
            className="vto-profile-avatar-placeholder"
            title={user.isGuest ? 'Guest' : user.name}
            onClick={handleLogout}
          >
            {user.isGuest ? 'G' : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="vto-main-layout">
        {/* Left Sidebar */}
        <aside className="vto-sidebar">
          <div className="vto-sidebar-menu">
            <NavLink
              to="/favorites"
              className={({ isActive }) => `vto-sidebar-item ${isActive ? 'active' : ''}`}
              title="Wishlist"
            >
              <HeartIcon />
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) => `vto-sidebar-item ${isActive ? 'active' : ''}`}
              title="Try-On History"
            >
              <HistoryIcon />
            </NavLink>
          </div>
        </aside>

        {/* Content */}
        <main className="vto-content-pane">
          <Outlet />
        </main>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(245, 239, 230, 0.8)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 100000, fontFamily: 'Outfit, sans-serif'
        }}>
          <div style={{
            width: '40px', height: '40px',
            border: '2px solid #D2C7BC',
            borderTop: '2px solid #1C1816',
            borderRadius: '50%',
            animation: 'vto-spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          <style>{`@keyframes vto-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        </div>
      )}
    </div>
  )
}

export default DashboardLayout
