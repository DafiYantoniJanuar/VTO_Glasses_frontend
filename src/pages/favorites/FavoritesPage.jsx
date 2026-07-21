import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FavoritesPage.css'

const DUMMY_FAVORITES = [
  { id: 6, name: 'Aero Matte Black', desc: 'Titanium frame, ultra-lightweight.', price: 2450000, category: 'Minus', rating: 4.8 },
  { id: 4, name: 'Geometric Silver', desc: 'Modern angular design, blue-light blocking.', price: 1890000, category: 'Blue Light', rating: 4.5 },
  { id: 3, name: 'Clear Honey Acetate', desc: 'Hand-polished premium acetate.', price: 3100000, category: 'Sunglasses', rating: 4.9 },
]

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

function FavoritesPage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(DUMMY_FAVORITES)
  const [sort, setSort] = useState('Terbaru')
  const [category, setCategory] = useState('Semua Kategori')

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  const filtered = favorites.filter(f =>
    category === 'Semua Kategori' ? true : f.category === category
  )

  return (
    <div className="fav-wrapper">
      {/* Header */}
      <div className="fav-header">
        <div>
          <h1 className="fav-title">Favorit Saya</h1>
          <p className="fav-subtitle">{favorites.length} item disimpan untuk nanti</p>
        </div>
        <div className="fav-controls">
          <select value={sort} onChange={e => setSort(e.target.value)} className="fav-select">
            <option>Terbaru</option>
            <option>Harga: Murah ke Mahal</option>
            <option>Rating Tertinggi</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="fav-select">
            <option>Semua Kategori</option>
            <option>Sunglasses</option>
            <option>Blue Light</option>
            <option>Minus</option>
            <option>Reading Glasses</option>
          </select>
        </div>
      </div>

      <div className="fav-divider" />

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="fav-grid">
          {filtered.map(item => (
            <div key={item.id} className="fav-card">
              {/* Image */}
              <div className="fav-img-wrap" onClick={() => navigate(`/catalog/${item.id}`)}>
                <button
                  className="fav-heart-btn active"
                  onClick={(e) => { e.stopPropagation(); removeFavorite(item.id) }}
                  title="Hapus dari Favorit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E05C5C" stroke="#E05C5C" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <div className="fav-img-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
                    <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                    <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
                  </svg>
                </div>
              </div>

              {/* Info */}
              <div className="fav-info">
                <div className="fav-name-row">
                  <span className="fav-name">{item.name}</span>
                  <span className="fav-rating">★ {item.rating}</span>
                </div>
                <p className="fav-desc">{item.desc}</p>
                <div className="fav-bottom">
                  <span className="fav-price">{formatPrice(item.price)}</span>
                  <button className="fav-cart-btn" onClick={() => alert(`${item.name} ditambahkan ke keranjang!`)}>
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
        <div className="fav-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p>Belum ada favorit</p>
          <button onClick={() => navigate('/catalog')} className="fav-browse-btn">Browse Catalog</button>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
