import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import './ProductDetailPage.css'

const DUMMY_PRODUCTS = {
  1: { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', rating: 4.7, reviews: 89, image: showcaseImg, description: 'A timeless round silhouette crafted from premium Italian acetate. The Cambridge offers UV400 protection and ultra-lightweight comfort — perfect for everyday wear.' },
  2: { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', rating: 4.6, reviews: 120, image: heroImg, description: 'Timeless design meets modern engineering. The Architect features aerospace-grade titanium frames and polarized lenses for uncompromising style and clarity.' },
  3: { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', rating: 4.9, reviews: 210, image: showcaseImg, description: 'Bold, iconic, unmistakable. The Maverick aviator features a classic teardrop silhouette with a lustrous gold frame and premium gradient lenses.' },
  4: { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear Crystal', price: 2235000, category: 'Blue Light', rating: 4.5, reviews: 65, image: heroImg, description: 'Barely-there sophistication. The Ghost features ultra-clear acetate for an almost invisible look that lets your face take center stage, with blue light blocking.' },
  5: { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading Glasses', rating: 4.4, reviews: 44, image: showcaseImg, description: 'Refined and scholarly, the Classic Scholar combines a vintage-inspired round silhouette with modern lightweight materials for all-day reading comfort.' },
  6: { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Midnight Black', price: 2450000, category: 'Minus', rating: 4.8, reviews: 178, image: heroImg, description: 'The ultimate in minimal elegance. Aero Slim\'s ultra-thin titanium frame practically disappears on your face, available with prescription lenses.' },
}

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

function StarRating({ rating, total }) {
  return (
    <div className="pdp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#C5A880' : 'none'}
          stroke={i <= Math.round(rating) ? '#C5A880' : '#D2C7BC'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="pdp-rating-num">{rating} ({total} ulasan)</span>
    </div>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [toastMessage, setToastMessage] = useState(null)

  // Camera State directly inside Fitting Room panel
  const videoRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const product = DUMMY_PRODUCTS[id] || DUMMY_PRODUCTS[1]

  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      setCameraActive(false)
    } else {
      try {
        setCameraError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraActive(true)
      } catch (err) {
        console.error(err)
        setCameraError('Kamera tidak ditemukan atau izin ditolak.')
        setCameraActive(false)
      }
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    const videoNode = videoRef.current
    return () => {
      if (videoNode && videoNode.srcObject) {
        const tracks = videoNode.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const handleAddToCart = () => {
    setToastMessage(`${product.name} ditambahkan ke keranjang!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="pdp-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '85px',
          right: '30px',
          backgroundColor: '#1C1816',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '0.84rem',
          fontWeight: '500',
          zIndex: 10000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          🛒 {toastMessage}
        </div>
      )}

      {/* Left Column: Image Showcase & Details */}
      <div className="pdp-left">
        {/* Breadcrumb Navigation */}
        <nav className="pdp-breadcrumb">
          <span onClick={() => navigate('/catalog')} className="pdp-bc-link">Catalog</span>
          <span className="pdp-bc-sep">›</span>
          <span onClick={() => navigate('/catalog')} className="pdp-bc-link">{product.category}</span>
          <span className="pdp-bc-sep">›</span>
          <span className="pdp-bc-current">{product.name}</span>
        </nav>

        {/* Product Image Card */}
        <div className="pdp-image-card">
          <div className="pdp-img-main">
            <img src={product.image} alt={product.name} className="pdp-img-display" />
          </div>

          <div className="pdp-thumbnails">
            {[1, 2, 3].map(i => (
              <div key={i} className={`pdp-thumb ${i === 1 ? 'active' : ''}`}>
                <img src={product.image} alt="Thumbnail" style={{ width: '40px', height: 'auto' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Information Card */}
        <div className="pdp-info">
          <div className="pdp-name-row">
            <h1 className="pdp-name">{product.name}</h1>
            <button
              className={`pdp-fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title={isFavorite ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={isFavorite ? '#E05C5C' : 'none'}
                stroke={isFavorite ? '#E05C5C' : '#8A7F78'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <StarRating rating={product.rating} total={product.reviews} />
          <p className="pdp-price">{formatPrice(product.price)}</p>
          <p className="pdp-meta">{product.shape} • {product.color} • {product.category}</p>

          {/* Description / Specifications Tabs */}
          <div className="pdp-tabs">
            <button
              className={`pdp-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Deskripsi
            </button>
            <button
              className={`pdp-tab ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Spesifikasi
            </button>
          </div>

          {activeTab === 'description' && (
            <p className="pdp-desc">{product.description}</p>
          )}

          {activeTab === 'specs' && (
            <div className="pdp-specs">
              <div className="pdp-spec-row"><span>Bentuk Frame</span><span>{product.shape}</span></div>
              <div className="pdp-spec-row"><span>Warna</span><span>{product.color}</span></div>
              <div className="pdp-spec-row"><span>Kategori</span><span>{product.category}</span></div>
              <div className="pdp-spec-row"><span>Bahan Material</span><span>Premium Italian Acetate</span></div>
              <div className="pdp-spec-row"><span>Perlindungan Lensa</span><span>UV400 Polarized</span></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pdp-actions">
            <button className="pdp-btn-cart" onClick={handleAddToCart} style={{ width: '100%' }}>
              + Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Virtual Fitting Room Preview Stage */}
      <div className="pdp-right">
        <div className="pdp-tryon-placeholder">
          <div className="pdp-ar-preview-stage">
            <span className="pdp-ar-pulse-dot" style={{ backgroundColor: cameraActive ? '#22C55E' : '#C5A880' }} />
            
            {/* Live Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{
                display: cameraActive ? 'block' : 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'
              }} 
            />

            {/* Simulated Frame overlay when camera active */}
            {cameraActive && (
              <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <svg width="180" height="70" viewBox="0 0 240 90" fill="none">
                  <rect x="15" y="15" width="85" height="60" rx="28" fill="rgba(255, 255, 255, 0.15)" stroke="#1C1816" strokeWidth="4" />
                  <rect x="140" y="15" width="85" height="60" rx="28" fill="rgba(255, 255, 255, 0.15)" stroke="#1C1816" strokeWidth="4" />
                  <path d="M100 35 C112 28, 128 28, 140 35" stroke="#1C1816" strokeWidth="4" fill="none" />
                </svg>
              </div>
            )}

            {/* Default Placeholder when camera is off */}
            {!cameraActive && (
              <>
                <div className="pdp-tryon-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1C1816" strokeWidth="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1C1816' }}>
                  VIRTUAL FITTING ROOM
                </span>
              </>
            )}
          </div>

          <p className="pdp-tryon-hint">
            {cameraError ? cameraError : <>Uji kesesuaian bingkai <b>{product.name}</b> di wajah Anda secara <i>real-time</i>.</>}
          </p>

          {/* Toggle Camera Button */}
          <button className="pdp-tryon-cta" onClick={toggleCamera}>
            {cameraActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
          </button>

          {/* Model Switcher Cards */}
          <div className="pdp-model-switcher">
            <span className="pdp-switch-label">Ganti Model Frame</span>
            <div className="pdp-switch-pills">
              {Object.values(DUMMY_PRODUCTS).map(p => (
                <div
                  key={p.id}
                  className={`pdp-switch-item ${p.id === product.id ? 'active' : ''}`}
                  onClick={() => navigate(`/catalog/${p.id}`)}
                  title={p.name}
                >
                  <img src={p.image} alt={p.name} className="pdp-switch-img" />
                  <span className="pdp-switch-name">{p.name}</span>
                  <span className="pdp-switch-shape">{p.shape}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Specification Badges */}
          <div className="pdp-feature-grid">
            <div className="pdp-feature-item">
              <span className="pdp-feature-val">120 Points</span>
              <span className="pdp-feature-lbl">Face Mesh</span>
            </div>
            <div className="pdp-feature-item">
              <span className="pdp-feature-val">UV400</span>
              <span className="pdp-feature-lbl">Protection</span>
            </div>
            <div className="pdp-feature-item">
              <span className="pdp-feature-val">22 gram</span>
              <span className="pdp-feature-lbl">Ultra Light</span>
            </div>
            <div className="pdp-feature-item">
              <span className="pdp-feature-val">98% Fit</span>
              <span className="pdp-feature-lbl">Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
