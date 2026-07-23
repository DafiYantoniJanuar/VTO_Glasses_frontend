import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css'

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Protect admin routes: Must be logged in as admin
  if (!user || (user.role !== 'admin' && user.email !== 'admin@vtogla.com')) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      {/* Top Admin Navbar */}
      <header className="admin-navbar">
        <div className="admin-brand">
          <span className="admin-logo-text">VTO GLASSES</span>
          <span className="admin-badge">ADMIN PORTAL</span>
        </div>

        <nav className="admin-nav-links">
          <span className={`admin-nav-item ${location.pathname.includes('/admin/catalog') ? 'active' : ''}`}>
            Kelola Katalog
          </span>
        </nav>

        <div className="admin-user-menu">
          <div className="admin-user-info">
            <div className="admin-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'M'}</div>
            <span className="admin-username">{user.name || 'Mizuki Admin'}</span>
          </div>
          <button className="btn-admin-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Content View */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
