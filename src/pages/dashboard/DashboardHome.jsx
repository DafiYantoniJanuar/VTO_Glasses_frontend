import { useAuth } from '../../context/AuthContext'
import './DashboardHome.css'

function DashboardHome() {
  const { user, logout } = useAuth()

  return (
    <div className="vto-dashboard-card">
      <h1 className="vto-dashboard-title">Dashboard</h1>
      
      <p className="vto-dashboard-subtitle">
        {user.isGuest 
          ? 'Access Mode: Guest Access' 
          : `Welcome back, ${user.name} (${user.email})`
        }
      </p>

      {/* Main Quote Box */}
      <h2 className="vto-dashboard-quote">
        "lanjutkan kawan buat fitur fitur lain"
      </h2>

      {/* Logout Button */}
      <button 
        onClick={logout}
        className="vto-btn-dashboard-logout"
      >
        Logout
      </button>
    </div>
  )
}

export default DashboardHome
