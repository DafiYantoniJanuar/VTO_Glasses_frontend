import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import './TryOnPage.css'

const PRODUCTS_DATA = {
  1: { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', rating: 4.7, image: showcaseImg },
  2: { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', rating: 4.6, image: heroImg },
  3: { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', rating: 4.9, image: showcaseImg },
  4: { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear Crystal', price: 2235000, category: 'Blue Light', rating: 4.5, image: heroImg },
  5: { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading', rating: 4.4, image: showcaseImg },
  6: { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Midnight Black', price: 2450000, category: 'Minus', rating: 4.8, image: heroImg },
}

const COLOR_VARIANTS = [
  { name: 'Tortoise', hex: '#8B4513' },
  { name: 'Matte Black', hex: '#1C1816' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Clear Crystal', hex: '#E2E8F0' },
]

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  )
}

function TryOnPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentId = id ? parseInt(id) : 1
  const [product, setProduct] = useState(PRODUCTS_DATA[currentId] || PRODUCTS_DATA[1])

  // Camera & AR state
  const videoRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Glasses Controls State
  const [scale, setScale] = useState(100)
  const [offsetY, setOffsetY] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.color)
  const [showMesh, setShowMesh] = useState(true)

  // Sync selected product when URL parameter changes
  useEffect(() => {
    const found = PRODUCTS_DATA[currentId] || PRODUCTS_DATA[1]
    setProduct(found)
    setSelectedColor(found.color)
  }, [currentId])

  // Toggle Live Webcam Stream
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
          video: { width: 1280, height: 720, facingMode: 'user' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraActive(true)
      } catch (err) {
        console.error('Camera access denied or unavailable:', err)
        setCameraError('Kamera tidak ditemukan atau izin ditolak. Menggunakan mode simulasi studio.')
        setCameraActive(false)
      }
    }
  }

  // Cleanup camera stream on unmount
  useEffect(() => {
    const videoNode = videoRef.current
    return () => {
      if (videoNode && videoNode.srcObject) {
        const tracks = videoNode.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  // Capture Snapshot & Save to TryOn History
  const handleTakeSnapshot = () => {
    const existingHistory = JSON.parse(localStorage.getItem('vto_history') || '[]')
    const newEntry = {
      id: Date.now(),
      productId: product.id,
      name: product.name,
      shape: product.shape,
      color: selectedColor,
      price: product.price,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      fitScore: '98% Fit'
    }

    localStorage.setItem('vto_history', JSON.stringify([newEntry, ...existingHistory]))

    setToastMessage(`Snapshot ${product.name} disimpan ke Riwayat Try-On!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

  return (
    <div className="vto-studio-wrapper">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="vto-studio-toast">
          ✨ {toastMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="vto-studio-header">
        <button className="vto-btn-back" onClick={() => navigate('/catalog')}>
          &larr; Kembali ke Katalog
        </button>

        <div className="vto-studio-title-area">
          <h2 className="vto-studio-product-name">{product.name}</h2>
          <span className="vto-studio-badge">AR Live Studio</span>
        </div>

        <div className="vto-studio-header-actions">
          <span className="vto-studio-price">{formatPrice(product.price)}</span>
          <button className="vto-btn-checkout-quick" onClick={() => navigate('/checkout')}>
            Beli Sekarang
          </button>
        </div>
      </div>

      {/* Studio Body: Camera Stage + Control Panel */}
      <div className="vto-studio-body">
        
        {/* Left Live Camera / AR Stage */}
        <div className="vto-camera-stage">
          <div className="vto-video-container">
            {/* Live Camera Stream */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="vto-webcam-feed" 
              style={{ display: cameraActive ? 'block' : 'none' }} 
            />

            {/* Demo Studio Avatar Stage when camera is off */}
            {!cameraActive && (
              <div className="vto-demo-avatar-stage">
                <div className="vto-face-wireframe"></div>
                <p style={{ color: '#9C9086', fontSize: '0.82rem', marginTop: '200px', textAlign: 'center' }}>
                  {cameraError ? cameraError : 'Klik "Aktifkan Kamera" di bawah untuk mencoba dengan webcam Anda.'}
                </p>
              </div>
            )}

            {/* Simulated 120-Point Facial Landmark Mesh */}
            {showMesh && (
              <svg className="vto-ar-landmarks" viewBox="0 0 400 400">
                <circle cx="200" cy="180" r="140" fill="none" stroke="rgba(197, 168, 128, 0.25)" strokeDasharray="4 4" />
                <circle cx="150" cy="170" r="18" fill="none" stroke="rgba(197, 168, 128, 0.4)" />
                <circle cx="250" cy="170" r="18" fill="none" stroke="rgba(197, 168, 128, 0.4)" />
                <line x1="200" y1="130" x2="200" y2="230" stroke="rgba(197, 168, 128, 0.3)" strokeDasharray="2 2" />
                <line x1="120" y1="170" x2="280" y2="170" stroke="rgba(197, 168, 128, 0.3)" strokeDasharray="2 2" />
              </svg>
            )}

            {/* Overlaid Glasses Frame */}
            <div 
              className="vto-glasses-overlay" 
              style={{ 
                transform: `translate(-50%, -50%) translateY(${offsetY}px) scale(${scale / 100})`,
                top: '42%',
                left: '50%'
              }}
            >
              <svg width="240" height="90" viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Frame Lens */}
                <rect x="15" y="15" width="85" height="60" rx="28" fill="rgba(255, 255, 255, 0.15)" stroke={selectedColor === 'Gold' ? '#D4AF37' : (selectedColor === 'Tortoise' ? '#8B4513' : '#1C1816')} strokeWidth="4" />
                {/* Right Frame Lens */}
                <rect x="140" y="15" width="85" height="60" rx="28" fill="rgba(255, 255, 255, 0.15)" stroke={selectedColor === 'Gold' ? '#D4AF37' : (selectedColor === 'Tortoise' ? '#8B4513' : '#1C1816')} strokeWidth="4" />
                {/* Bridge */}
                <path d="M100 35 C112 28, 128 28, 140 35" stroke={selectedColor === 'Gold' ? '#D4AF37' : (selectedColor === 'Tortoise' ? '#8B4513' : '#1C1816')} strokeWidth="4" fill="none" />
                {/* Left Temple Bar */}
                <line x1="15" y1="35" x2="2" y2="30" stroke={selectedColor === 'Gold' ? '#D4AF37' : (selectedColor === 'Tortoise' ? '#8B4513' : '#1C1816')} strokeWidth="3" />
                {/* Right Temple Bar */}
                <line x1="225" y1="35" x2="238" y2="30" stroke={selectedColor === 'Gold' ? '#D4AF37' : (selectedColor === 'Tortoise' ? '#8B4513' : '#1C1816')} strokeWidth="3" />
              </svg>
            </div>

            {/* HUD Status Bar */}
            <div className="vto-stage-hud">
              <div className="vto-hud-badge">
                <span className="vto-hud-dot" style={{ backgroundColor: cameraActive ? '#22C55E' : '#EAB308' }}></span>
                <span>{cameraActive ? 'Kamera AR Aktif (120 Points Tracking)' : 'Mode Simulasi Studio'}</span>
              </div>
            </div>
          </div>

          {/* Studio Control Toolbar */}
          <div className="vto-stage-bottom-controls">
            <button className="vto-ctrl-btn" onClick={toggleCamera} title={cameraActive ? "Matikan Kamera" : "Aktifkan Kamera"}>
              <CameraIcon />
            </button>

            <button className="vto-btn-snapshot" onClick={handleTakeSnapshot} title="Ambil Foto Snapshot">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
              </svg>
            </button>

            <button 
              className="vto-ctrl-btn" 
              onClick={() => setShowMesh(!showMesh)}
              style={{ color: showMesh ? '#C5A880' : '#D2C7BC' }}
              title="Toggle Facial Mesh Points"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 3v18M3 12h18"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Right Studio Settings & Product Selector Panel */}
        <div className="vto-studio-panel">
          <div>
            {/* Color Variant Selector */}
            <div className="vto-panel-section">
              <span className="vto-panel-label">Warna Bingkai ({selectedColor})</span>
              <div className="vto-color-options">
                {COLOR_VARIANTS.map(c => (
                  <div 
                    key={c.name}
                    className={`vto-color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Position & Scale Fine-tuning */}
            <div className="vto-panel-section">
              <span className="vto-panel-label">Penyesuaian Posisi Kacamata</span>
              
              <div className="vto-slider-group">
                <div className="vto-slider-row">
                  <span>Ukuran (Scale)</span>
                  <span>{scale}%</span>
                </div>
                <input 
                  type="range" 
                  min="70" 
                  max="140" 
                  value={scale} 
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="vto-range-slider" 
                />
              </div>

              <div className="vto-slider-group">
                <div className="vto-slider-row">
                  <span>Posisi Tinggi (Height)</span>
                  <span>{offsetY}px</span>
                </div>
                <input 
                  type="range" 
                  min="-60" 
                  max="60" 
                  value={offsetY} 
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="vto-range-slider" 
                />
              </div>
            </div>

            {/* Quick Switch Frame Carousel */}
            <div className="vto-panel-section">
              <span className="vto-panel-label">Coba Model Lainnya</span>
              <div className="vto-models-carousel">
                {Object.values(PRODUCTS_DATA).map(p => (
                  <div 
                    key={p.id}
                    className={`vto-model-card ${p.id === product.id ? 'active' : ''}`}
                    onClick={() => navigate(`/try-on/${p.id}`)}
                  >
                    <span className="vto-model-name">{p.name}</span>
                    <span style={{ fontSize: '0.65rem', color: '#C5A880' }}>{p.shape}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="vto-btn-checkout-quick" style={{ width: '100%', padding: '12px' }} onClick={() => navigate('/checkout')}>
              + Tambah ke Keranjang
            </button>
            <button 
              className="vto-btn-back" 
              style={{ width: '100%', justifyContent: 'center', padding: '10px', border: '1px solid rgba(229, 219, 208, 0.2)' }}
              onClick={() => navigate('/catalog')}
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TryOnPage
