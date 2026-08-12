import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './TryOnHistoryPage.css'

const API_BASE_URL = 'http://localhost:8000/api'

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0)

const formatDateLabel = (dateStr) => {
  if (!dateStr) return 'Baru saja'
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Baru saja' : `${diffMins} menit lalu`
    }
    if (diffHours < 24) {
      return `${diffHours} jam lalu`
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'Baru saja'
  }
}

function TryOnHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [historyList, setHistoryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState(null)

  const isLoggedIn = user && !user.isGuest && user.token

  const loadHistory = async () => {
    setLoading(true)
    try {
      if (isLoggedIn) {
        const res = await fetch(`${API_BASE_URL}/history`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        })
        if (res.ok) {
          const json = await res.json()
          
          // Map backend history format to match the frontend shape
          const mapped = (json.data || []).map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.product?.name || 'Kacamata',
            price: item.product?.price || 0,
            image: item.product?.image || '',
            dateLabel: formatDateLabel(item.created_at)
          }))
          setHistoryList(mapped)
          setLoading(false)
          return
        }
      }
      // Guest or API fail: fallback to localStorage
      const localData = JSON.parse(localStorage.getItem('vto_history') || '[]')
      setHistoryList(localData)
    } catch {
      const localData = JSON.parse(localStorage.getItem('vto_history') || '[]')
      setHistoryList(localData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [isLoggedIn])

  const handleAddToCart = (item) => {
    let cart = JSON.parse(localStorage.getItem('vto_cart') || '[]')
    const existingIndex = cart.findIndex(c => c.id === item.productId)
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1
    } else {
      cart.push({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: 1
      })
    }
    localStorage.setItem('vto_cart', JSON.stringify(cart))
    setToastMessage(`${item.name} ditambahkan ke keranjang!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="hist-wrapper">
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
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="hist-header">
        <h1 className="hist-title">Try-On History</h1>
        <p className="hist-subtitle">Tinjau kembali kacamata yang baru saja Anda coba di Fitting Room.</p>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p style={{ color: '#9C9086', padding: '20px' }}>Memuat riwayat try-on...</p>
      ) : historyList.length > 0 ? (
        <div className="hist-grid">
          {historyList.map(item => (
            <div key={item.id} className="hist-card">
              {/* Date Badge on Image */}
              <div className="hist-img-wrap" onClick={() => navigate(`/catalog/${item.productId}`)}>
                <span className="hist-date-badge">{item.dateLabel}</span>
                <div className="hist-img-placeholder">
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
                      <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                      <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="hist-info">
                <h3 className="hist-name">{item.name}</h3>
                <p className="hist-price">{formatPrice(item.price)}</p>
                <div className="hist-actions">
                  <button
                    className="hist-retry-btn"
                    onClick={() => navigate(`/catalog/${item.productId}`)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Re-try
                  </button>
                  <button
                    className="hist-cart-btn"
                    onClick={() => handleAddToCart(item)}
                    title="Tambah ke Keranjang"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="hist-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            <circle cx="12" cy="12" r="1" fill="#C5B8AF" /><polyline points="12 8 12 12 14 14" />
          </svg>
          <p>Belum ada riwayat try-on</p>
          <button onClick={() => navigate('/catalog')} className="hist-cta-btn">Mulai Try-On</button>
        </div>
      )}
    </div>
  )
}

export default TryOnHistoryPage
