import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Glasses3DViewer from '../../components/3d/Glasses3DViewer'
import showcaseImg from '../../assets/glasses_showcase.png'
import './HomePage.css'

const FEATURED_FRAMES = [
  { id: 1, name: 'The Cambridge', shape: 'Round Classic', price: 'Rp 2.175.000', image: showcaseImg },
  { id: 2, name: 'The Architect', shape: 'Square Modern', price: 'Rp 2.460.000', image: showcaseImg },
  { id: 3, name: 'The Maverick', shape: 'Aviator Premium', price: 'Rp 2.760.000', image: showcaseImg },
]

function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="home-wrapper">
      {/* Top Welcome & Stats Header */}
      <div className="home-header-row">
        <div>
          <h1 className="home-greeting">Selamat Datang, {user?.name || 'Guest'}</h1>
          <p className="home-subtext">Temukan bingkai kacamata terbaik yang disesuaikan secara presisi dengan bentuk wajah Anda.</p>
        </div>
        
        <div className="home-mini-stats">
          <div className="home-stat-badge">
            <span className="stat-num">120+</span>
            <span className="stat-lbl">Model Frame</span>
          </div>
          <div className="home-stat-badge">
            <span className="stat-num">98%</span>
            <span className="stat-lbl">Fit Akurasi</span>
          </div>
        </div>
      </div>

      {/* Main Luxury Hero Banner with 3D Interactive Model Stage */}
      <div className="home-hero-card">
        <div className="hero-card-left">
          <span className="hero-badge">Studio Fitting AR & 3D</span>
          <h2 className="hero-card-title">Precision Optics, Virtually Perfect</h2>
          <p className="hero-card-desc">
            Nikmati simulasi kacamata 3D interaktif real-time. Putar bingkai kacamata 360°, pilih varian warna bahan, dan uji kecocokan secara presisi sebelum Anda membeli.
          </p>
          <div className="hero-action-group">
            <button className="hero-btn-action" onClick={() => navigate('/catalog')}>
              Buka Catalog & Fitting &rarr;
            </button>
          </div>
        </div>

        <div className="hero-card-right">
          {/* Interactive 3D Three.js Glasses Showcase */}
          <Glasses3DViewer modelUrl="/models/glasses_2.glb" height="320px" modelScale={6.8} showControls={true} />
        </div>
      </div>

      {/* Featured Collection Grid */}
      <div className="home-collection-section">
        <div className="section-header">
          <h3 className="section-title">Koleksi Terpopuler</h3>
          <button className="btn-link-all" onClick={() => navigate('/catalog')}>
            Lihat Semua Katalog &rarr;
          </button>
        </div>

        <div className="home-featured-grid">
          {FEATURED_FRAMES.map(f => (
            <div key={f.id} className="featured-frame-card" onClick={() => navigate(`/catalog/${f.id}`)}>
              <div className="frame-card-img-wrap">
                <img src={f.image} alt={f.name} className="frame-card-img" />
              </div>
              <div className="frame-card-info">
                <div>
                  <h4 className="frame-card-name">{f.name}</h4>
                  <span className="frame-card-shape">{f.shape}</span>
                </div>
                <span className="frame-card-price">{f.price}</span>
              </div>
              <button className="frame-card-btn" onClick={(e) => { e.stopPropagation(); navigate(`/catalog/${f.id}`); }}>
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
