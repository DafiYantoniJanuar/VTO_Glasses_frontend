import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './DashboardLayout.css'

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

const GlassesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="15" r="3" />
    <circle cx="18" cy="15" r="3" />
    <path d="M9 15h6" />
    <path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
  </svg>
)

function DashboardLayout() {
  const { user, loading } = useAuth()

  // Protect route
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="vto-dashboard-wrapper">
      {/* Top Navbar Header */}
      <header className="vto-navbar">
        <Link to="/" className="vto-nav-logo">VTO Glasses</Link>

        <nav className="vto-nav-links">
          <Link to="/" className="vto-nav-link">home</Link>
          <a href="#store" className="vto-nav-link">store</a>
          <a href="#discounts" className="vto-nav-link">discounts</a>
        </nav>

        <div className="vto-nav-actions">
          {/* Wishlist button */}
          <button className="vto-nav-wishlist">
            <HeartIcon />
          </button>

          {/* Pill-shaped Cart button */}
          <button className="vto-nav-cart-btn">
            <CartIcon />
          </button>

          {/* Profile avatar placeholder (no image) */}
          <div className="vto-profile-avatar-placeholder">
            {user.isGuest ? 'G' : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>
        </div>
      </header>

      {/* Main Layout containing Left Sidebar and Content */}
      <div className="vto-main-layout">

        {/* Left Vertical Sidebar */}
        <aside className="vto-sidebar">

          {/* Categories Navigation */}
          <div className="vto-sidebar-menu">
            <a href="#glasses" className="vto-sidebar-item active">
              <GlassesIcon />
            </a>
            <a href="#search" className="vto-sidebar-item">
              <SearchIcon />
            </a>
          </div>

        </aside>

        {/* Right Main Content Pane */}
        <main className="vto-content-pane">
          <Outlet />
        </main>

      </div>

      {/* Loading Overlay */}
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
    </div>
  )
}

export default DashboardLayout
