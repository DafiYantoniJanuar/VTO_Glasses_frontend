import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import FilterTopBar from '../../components/catalog/FilterTopBar'
import ProductCard from '../../components/catalog/ProductCard'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import './CatalogPage.css'
import '../admin/AdminCatalogPage.css'

const API_PRODUCTS_URL = 'http://localhost:8000/api/products'

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', bestSeller: false, rating: 4.7, image: showcaseImg, description: 'Classic round silhouette' },
  { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', bestSeller: false, rating: 4.6, image: heroImg, description: 'Titanium square frame' },
  { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', bestSeller: true, rating: 4.9, image: showcaseImg, description: 'Teardrop gold frame' },
  { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear', price: 2235000, category: 'Blue Light', bestSeller: false, rating: 4.5, image: heroImg, description: 'Ultra-clear acetate' },
  { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading Glasses', bestSeller: false, rating: 4.4, image: showcaseImg, description: 'Vintage round silhouette' },
  { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Black', price: 2450000, category: 'Minus', bestSeller: false, rating: 4.8, image: heroImg, description: 'Ultra-thin titanium frame' },
]

const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rating']

function CatalogPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@vtogla.com'

  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [filters, setFilters] = useState({ categories: [], shapes: [], colors: [] })
  const [sort, setSort] = useState('Newest')
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  // Admin Modal & Action States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    shape: 'Round',
    color: 'Tortoise',
    price: '',
    category: 'Sunglasses',
    description: '',
    best_seller: false
  })

  // Fetch backend products on mount
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_PRODUCTS_URL)
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setProducts(json.data)
        }
      }
    } catch {
      // API fallback
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Admin Modal Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      shape: 'Round',
      color: 'Tortoise',
      price: '',
      category: 'Sunglasses',
      description: '',
      best_seller: false
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      shape: product.shape,
      color: product.color,
      price: product.price,
      category: product.category,
      description: product.description || '',
      best_seller: product.best_seller || false
    })
    setIsModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const payload = {
      ...formData,
      price: parseFloat(formData.price)
    }

    try {
      if (editingProduct) {
        const res = await fetch(`${API_PRODUCTS_URL}/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          showToast(`Kacamata "${formData.name}" berhasil diperbarui!`)
        } else {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p))
          showToast(`Kacamata "${formData.name}" diperbarui!`)
        }
      } else {
        const res = await fetch(API_PRODUCTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          showToast(`Kacamata baru "${formData.name}" berhasil ditambahkan!`)
        } else {
          const newProd = { id: Date.now(), image: showcaseImg, ...payload }
          setProducts([newProd, ...products])
          showToast(`Kacamata baru "${formData.name}" ditambahkan!`)
        }
      }
      await fetchProducts()
      setIsModalOpen(false)
    } catch {
      setIsModalOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await fetch(`${API_PRODUCTS_URL}/${deleteId}`, { method: 'DELETE' })
      setProducts(products.filter(p => p.id !== deleteId))
      showToast('Kacamata telah dihapus.')
    } catch {
      setProducts(products.filter(p => p.id !== deleteId))
      showToast('Kacamata telah dihapus.')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  // Filter & Search Logic
  const filtered = useMemo(() => {
    let result = [...products]

    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.color.toLowerCase().includes(search.toLowerCase()) ||
        p.shape.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category))
    }

    if (filters.shapes.length > 0) {
      result = result.filter(p => filters.shapes.includes(p.shape))
    }

    if (sort === 'Price: Low to High') result.sort((a, b) => a.price - b.price)
    else if (sort === 'Price: High to Low') result.sort((a, b) => b.price - a.price)
    else if (sort === 'Best Rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return result
  }, [products, filters, sort, search])

  return (
    <div className="cat-wrapper">
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '85px',
          right: '40px',
          backgroundColor: '#C5A880',
          color: '#1C1816',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '0.86rem',
          fontWeight: '600',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          zIndex: 10000
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="cat-main">
        {/* Header */}
        <div className="cat-header">
          <div className="cat-header-left">
            <h1 className="cat-title">Explore Frames {isAdmin && '(Admin Mode)'}</h1>
            <span className="cat-count">{filtered.length} produk ditemukan</span>
          </div>

          <div className="cat-header-right">
            {/* Search */}
            <div className="cat-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7F78" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search frames..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="cat-search"
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="cat-sort"
            >
              {SORT_OPTIONS.map(o => <option key={o} value={o}>Sort by: {o}</option>)}
            </select>

            {/* Admin Only: Create Product Form Button */}
            {isAdmin && (
              <button 
                onClick={handleOpenCreate} 
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#1C1816',
                  color: '#FAF8F5',
                  border: '1px solid #38312E',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Form Pembuatan Kacamata
              </button>
            )}
          </div>
        </div>

        {/* Top Bar Filter */}
        <FilterTopBar filters={filters} onChange={setFilters} />

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="cat-grid">
            {filtered.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isAdmin={isAdmin}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="cat-empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
              <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
              <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
            </svg>
            <p>Tidak ada produk yang ditemukan</p>
            <button onClick={() => { setFilters({ categories: [], shapes: [], colors: [] }); setSearch('') }} className="cat-reset-btn">
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Admin Form Modal Create & Edit */}
      {isAdmin && isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Kacamata' : 'Form Pembuatan Kacamata Baru'}
              </h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSave} className="modal-form-grid">
              <div className="form-group full">
                <label className="form-label">Nama Kacamata</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  required
                  placeholder="The Cambridge"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bentuk Frame</label>
                <select
                  name="shape"
                  className="form-input"
                  value={formData.shape}
                  onChange={handleInputChange}
                >
                  <option value="Round">Round</option>
                  <option value="Square">Square</option>
                  <option value="Aviator">Aviator</option>
                  <option value="Cat Eye">Cat Eye</option>
                  <option value="Oval">Oval</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Warna Bingkai</label>
                <input
                  type="text"
                  name="color"
                  className="form-input"
                  required
                  placeholder="Tortoise"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harga (IDR)</label>
                <input
                  type="number"
                  name="price"
                  className="form-input"
                  required
                  placeholder="2175000"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Sunglasses">Sunglasses</option>
                  <option value="Blue Light">Blue Light</option>
                  <option value="Reading Glasses">Reading Glasses</option>
                  <option value="Minus">Minus</option>
                </select>
              </div>

              <div className="form-group full">
                <label className="form-label">Deskripsi Produk</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="3"
                  placeholder="Deskripsi..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions full">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Batal
                </button>
                <button type="submit" className="btn-modal-save" disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {isAdmin && deleteId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h3 className="modal-title" style={{ marginBottom: '12px' }}>Konfirmasi Hapus</h3>
            <p style={{ color: '#7A6F68', fontSize: '0.88rem', marginBottom: '24px' }}>
              Apakah Anda yakin ingin menghapus kacamata ini?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn-modal-cancel" onClick={() => setDeleteId(null)} disabled={isDeleting}>
                Batal
              </button>
              <button className="btn-action-delete" style={{ padding: '10px 24px', opacity: isDeleting ? 0.7 : 1 }} onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogPage
