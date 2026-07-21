import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './DashboardHome.css'

function DashboardHome() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="dash-wrapper">
      <div className="dash-header">
        <h1 className="dash-title">My Account</h1>
        <p className="dash-subtitle">Manage your profile, preferences, and account settings.</p>
      </div>

      <div className="dash-content">
        {/* Sidebar Nav */}
        <div className="dash-sidebar">
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
          {activeTab === 'profile' && (
            <div className="dash-tab-content">
              <h2 className="dash-tab-title">Profile Details</h2>
              <div className="dash-form">
                <div className="dash-field">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user?.name || 'Guest'} disabled={user?.isGuest} />
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
              <p>Virtual Try-On and notification preferences will appear here.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="dash-tab-content">
              <h2 className="dash-tab-title">Security</h2>
              <p>Password and two-factor authentication settings will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
