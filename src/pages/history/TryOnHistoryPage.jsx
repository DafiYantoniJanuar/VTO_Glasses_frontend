import { useNavigate } from 'react-router-dom'
import './TryOnHistoryPage.css'

const DUMMY_HISTORY = [
  { id: 1, productId: 6, name: 'Geometric Aviator', price: 2145000, date: 'Today', dateLabel: 'Hari ini' },
  { id: 2, productId: 4, name: 'Clear Acetate Round', price: 2685000, date: 'Yesterday', dateLabel: 'Kemarin' },
  { id: 3, productId: 3, name: 'Classic Tortoiseshell', price: 2460000, date: 'Oct 12, 2023', dateLabel: '12 Okt 2023' },
]

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

function TryOnHistoryPage() {
  const navigate = useNavigate()

  return (
    <div className="hist-wrapper">
      {/* Header */}
      <div className="hist-header">
        <h1 className="hist-title">Try-On History</h1>
        <p className="hist-subtitle">Review the frames you've recently explored in AR.</p>
      </div>

      {/* Cards Grid */}
      {DUMMY_HISTORY.length > 0 ? (
        <>
          <div className="hist-grid">
            {DUMMY_HISTORY.map(item => (
              <div key={item.id} className="hist-card">
                {/* Date Badge on Image */}
                <div className="hist-img-wrap">
                  <span className="hist-date-badge">{item.dateLabel}</span>
                  <div className="hist-img-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
                      <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                      <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
                    </svg>
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
                      onClick={() => alert(`${item.name} ditambahkan ke keranjang!`)}
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

          <div className="hist-load-more">
            <button className="hist-load-btn">Load More History</button>
          </div>
        </>
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
