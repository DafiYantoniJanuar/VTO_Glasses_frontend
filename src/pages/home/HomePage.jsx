import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import heroImg from '../../assets/hero.png'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="home-wrapper">
      {/* Left: Text Content */}
      <div className="home-left">
        <div className="home-content">
          <span className="home-label">Next-Gen Eyewear</span>
          <h1 className="home-title">
            Precision Optics,<br />Virtually Perfect
          </h1>
          <p className="home-desc">
            Experience flawless fit before you buy. Our advanced AR engine maps
            120 facial points to match you with frames crafted for your exact
            bone structure.
          </p>
          <div className="home-cta-group">
            <button className="home-btn-primary" onClick={() => navigate('/catalog')}>
              Start Your Try-On &rarr;
            </button>
            <button className="home-btn-secondary" onClick={() => navigate('/catalog')}>
              Browse Catalog
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">120+</span>
            <span className="home-stat-label">Frame Styles</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-num">468</span>
            <span className="home-stat-label">Facial Points</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-num">98%</span>
            <span className="home-stat-label">Fit Accuracy</span>
          </div>
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="home-right">
        <img src={heroImg} alt="AR Virtual Try-On Demo" className="home-hero-img" />
        <div className="home-ar-badge">
          <span className="home-ar-dot" />
          Live AR Preview
        </div>
        {user && (
          <div className="home-welcome-chip">
            Welcome, {user.isGuest ? 'Guest' : user.name} 👋
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
