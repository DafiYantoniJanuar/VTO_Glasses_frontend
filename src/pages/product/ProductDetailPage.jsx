import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ProductDetailPage.css'

// Dummy data — akan diganti API di Fase 2
const DUMMY_PRODUCTS = {
  1: { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', rating: 4.7, reviews: 89, description: 'A timeless round silhouette crafted from premium Italian acetate. The Cambridge offers UV400 protection and ultra-lightweight comfort — perfect for everyday wear.' },
  2: { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', rating: 4.6, reviews: 120, description: 'Timeless design meets modern engineering. The Architect features aerospace-grade titanium frames and polarized lenses for uncompromising style and clarity.' },
  3: { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', rating: 4.9, reviews: 210, description: 'Bold, iconic, unmistakable. The Maverick aviator features a classic teardrop silhouette with a lustrous gold frame and premium gradient lenses.' },
  4: { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear', price: 2235000, category: 'Blue Light', rating: 4.5, reviews: 65, description: 'Barely-there sophistication. The Ghost features ultra-clear acetate for an almost invisible look that lets your face take center stage, with blue light blocking.' },
  5: { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading Glasses', rating: 4.4, reviews: 44, description: 'Refined and scholarly, the Classic Scholar combines a vintage-inspired round silhouette with modern lightweight materials for all-day reading comfort.' },
  6: { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Black', price: 2450000, category: 'Minus', rating: 4.8, reviews: 178, description: 'The ultimate in minimal elegance. Aero Slim\'s ultra-thin titanium frame practically disappears on your face, available with prescription lenses.' },
}

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

function StarRating({ rating, total }) {
  return (
    <div className="pdp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#C5A256' : 'none'}
          stroke={i <= Math.round(rating) ? '#C5A256' : '#C5B8AF'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="pdp-rating-num">{rating} ({total} reviews)</span>
    </div>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const product = DUMMY_PRODUCTS[id] || DUMMY_PRODUCTS[1]

  return (
    <div className="pdp-wrapper">
      {/* Left: Product Info */}
      <div className="pdp-left">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb">
          <span onClick={() => navigate('/catalog')} className="pdp-bc-link">Catalog</span>
          <span className="pdp-bc-sep">›</span>
          <span onClick={() => navigate('/catalog')} className="pdp-bc-link">{product.category}</span>
          <span className="pdp-bc-sep">›</span>
          <span className="pdp-bc-current">{product.name}</span>
        </nav>

        {/* Product Image */}
        <div className="pdp-image-card">
          <div className="pdp-img-main">
            <div className="pdp-img-placeholder">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1">
                <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
              </svg>
            </div>
          </div>
          {/* Thumbnails */}
          <div className="pdp-thumbnails">
            {[1, 2, 3].map(i => (
              <div key={i} className={`pdp-thumb ${i === 1 ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.5">
                  <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                  <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="pdp-info">
          <div className="pdp-name-row">
            <h1 className="pdp-name">{product.name}</h1>
            <button
              className={`pdp-fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title="Add to Wishlist"
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

          {/* Tabs */}
          <div className="pdp-tabs">
            {['description', 'specs'].map(tab => (
              <button
                key={tab}
                className={`pdp-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p className="pdp-desc">{product.description}</p>
          )}
          {activeTab === 'specs' && (
            <div className="pdp-specs">
              <div className="pdp-spec-row"><span>Frame Shape</span><span>{product.shape}</span></div>
              <div className="pdp-spec-row"><span>Color</span><span>{product.color}</span></div>
              <div className="pdp-spec-row"><span>Category</span><span>{product.category}</span></div>
              <div className="pdp-spec-row"><span>Material</span><span>Premium Acetate</span></div>
              <div className="pdp-spec-row"><span>Lens Width</span><span>52mm</span></div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="pdp-actions">
            <button className="pdp-btn-tryon" onClick={() => navigate(`/try-on/${id}`)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Coba Sekarang
            </button>
            <button className="pdp-btn-cart">
              + Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>

      {/* Right: Try-On Preview Placeholder */}
      <div className="pdp-right">
        <div className="pdp-tryon-placeholder">
          <div className="pdp-tryon-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8A7F78" strokeWidth="1">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="pdp-tryon-hint">Klik "Coba Sekarang" untuk mengaktifkan kamera AR</p>
          <button className="pdp-tryon-cta" onClick={() => navigate(`/try-on/${id}`)}>
            Aktifkan Kamera
          </button>

          {/* Bottom model switcher */}
          <div className="pdp-model-switcher">
            <span className="pdp-switch-label">GANTI MODEL</span>
            <div className="pdp-switch-pills">
              {Object.values(DUMMY_PRODUCTS).slice(0, 3).map(p => (
                <div
                  key={p.id}
                  className={`pdp-switch-item ${p.id === product.id ? 'active' : ''}`}
                  onClick={() => navigate(`/catalog/${p.id}`)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                    <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
