import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import showcaseImg from '../../assets/glasses_showcase.png'
import './FavoritesPage.css'

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0)

function FavoritesPage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('Terbaru')
  const [category, setCategory] = useState('Semua Kategori')

  const loadFavorites = () => {
    setLoading(true)
    try {
      const data = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
      setFavorites(data)
    } catch {
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const removeFavorite = (product) => {
    let localFavs = JSON.parse(localStorage.getItem('vto_favorites') || '[]')
    const updated = localFavs.filter(p => p.id !== product.id)
    localStorage.setItem('vto_favorites', JSON.stringify(updated))
    setFavorites(updated)
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
      {loading ? (
        <p style={{ color: '#9C9086', padding: '20px' }}>Memuat favorit Anda...</p>
      ) : filtered.length > 0 ? (
        <div className="fav-grid">
          {filtered.map(item => (
            <div key={item.id} className="fav-card">
              {/* Image */}
              <div className="fav-img-wrap" onClick={() => navigate(`/catalog/${item.id}`)}>
                <button
                  className="fav-heart-btn active"
                  onClick={(e) => { e.stopPropagation(); removeFavorite(item) }}
                  title="Hapus dari Favorit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E05C5C" stroke="#E05C5C" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <div className="fav-img-placeholder">
                  <img src={item.image || showcaseImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Info */}
              <div className="fav-info">
                <div className="fav-name-row">
                  <span className="fav-name">{item.name}</span>
                  <span className="fav-rating">★ {item.rating || '4.8'}</span>
                </div>
                <p className="fav-desc">{item.shape} • {item.color}</p>
                <div className="fav-bottom">
                  <span className="fav-price">{formatPrice(item.price)}</span>
                  <button className="fav-cart-btn" onClick={() => navigate(`/tryon/${item.id}`)} title="Coba Try-On">
                    Try-On
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
          <p>Belum ada favorit yang disimpan.</p>
          <button onClick={() => navigate('/catalog')} className="fav-browse-btn">Browse Catalog</button>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
