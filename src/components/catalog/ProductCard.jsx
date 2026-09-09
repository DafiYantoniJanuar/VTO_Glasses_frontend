import { useNavigate } from 'react-router-dom'
import FaceShapeBadge from '../faceShape/FaceShapeBadge'
import './ProductCard.css'

function ProductCard({ product, isAdmin = false, onEdit, onDelete, faceShape }) {
  const navigate = useNavigate()
  const {
    id,
    name,
    shape,
    color,
    price,
    image,
    best_seller,
    bestSeller = false,
    rating,
  } = product

  const isBestSeller = best_seller || bestSeller

  const formatPrice = (p) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0)

  return (
    <div className="pc-card" onClick={() => navigate(`/catalog/${id}`)}>
      {/* Image Area */}
      <div className="pc-image-wrap">
        {isBestSeller && <span className="pc-badge">Best Seller</span>}
        {faceShape && <FaceShapeBadge productShape={shape} faceShape={faceShape} />}
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
          {rating && <span className="pc-rating">{rating}</span>}
        </div>
        <span className="pc-meta">{shape} • {color}</span>
        <div className="pc-bottom">
          <span className="pc-price">{formatPrice(price)}</span>

          {isAdmin ? (
            <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
              <button
                className="pc-edit-btn"
                onClick={() => onEdit && onEdit(product)}
                style={{ padding: '4px 10px', borderRadius: '4px', background: '#C5A880', color: '#1C1816', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Edit
              </button>
              <button
                className="pc-del-btn"
                onClick={() => onDelete && onDelete(id)}
                style={{ padding: '4px 10px', borderRadius: '4px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Hapus
              </button>
            </div>
          ) : (
            <button
              className="pc-cart-btn"
              onClick={(e) => { e.stopPropagation(); alert(`${name} ditambahkan ke keranjang!`) }}
            >
              + Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
