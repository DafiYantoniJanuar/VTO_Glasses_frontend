import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

function ProductCard({ product }) {
  const navigate = useNavigate()
  const {
    id,
    name,
    shape,
    color,
    price,
    image,
    bestSeller = false,
    rating,
  } = product

  const formatPrice = (p) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

  return (
    <div className="pc-card" onClick={() => navigate(`/catalog/${id}`)}>
      {/* Image Area */}
      <div className="pc-image-wrap">
        {bestSeller && <span className="pc-badge">Best Seller</span>}
        {image ? (
          <img src={image} alt={name} className="pc-img" />
        ) : (
          <div className="pc-img-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
              <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
              <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="pc-hover-overlay">
          <button className="pc-try-btn" onClick={(e) => { e.stopPropagation(); navigate(`/catalog/${id}`) }}>
            Try On
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pc-info">
        <div className="pc-name-row">
          <span className="pc-name">{name}</span>
          {rating && <span className="pc-rating">★ {rating}</span>}
        </div>
        <span className="pc-meta">{shape} • {color}</span>
        <div className="pc-bottom">
          <span className="pc-price">{formatPrice(price)}</span>
          <button
            className="pc-cart-btn"
            onClick={(e) => { e.stopPropagation(); alert(`${name} ditambahkan ke keranjang!`) }}
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
