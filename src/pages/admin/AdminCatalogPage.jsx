import { useState, useEffect } from 'react'
import Glasses3DViewer from '../../components/3d/Glasses3DViewer'
import ProductCard from '../../components/catalog/ProductCard'
import showcaseImg from '../../assets/glasses_showcase.png'
import heroImg from '../../assets/hero.png'
import './AdminCatalogPage.css'
import '../catalog/CatalogPage.css'

const API_PRODUCTS_URL = 'http://localhost:8000/api/products'

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', best_seller: true, image: showcaseImg, description: 'Classic round silhouette' },
  { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', best_seller: false, image: heroImg, description: 'Titanium square frame' },
  { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', best_seller: true, image: showcaseImg, description: 'Teardrop gold frame' },
  { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear Crystal', price: 2235000, category: 'Blue Light', best_seller: false, image: heroImg, description: 'Ultra-clear acetate' },
  { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading Glasses', best_seller: false, image: showcaseImg, description: 'Vintage round silhouette' },
  { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Midnight Black', price: 2450000, category: 'Minus', best_seller: true, image: heroImg, description: 'Ultra-thin titanium frame' },
]

function AdminCatalogPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [show3dPreview, setShow3dPreview] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    shape: 'Round',
    color: 'Tortoise',
    price: '',
    category: 'Sunglasses',
    description: '',
    best_seller: false
  })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_PRODUCTS_URL)
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setProducts(json.data)
        }
      }
    } catch (err) {
      console.warn('Backend API fallback:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

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
    } catch (err) {
      console.error(err)
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
      showToast('Kacamata telah dihapus dari katalog.')
    } catch {
      setProducts(products.filter(p => p.id !== deleteId))
      showToast('Kacamata telah dihapus.')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0)

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.color.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="admin-catalog-wrapper">
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
          ✨ {toastMessage}
        </div>
      )}

      <div className="admin-catalog-header">
        <div>
          <h1 className="admin-page-title">Kelola Katalog Kacamata (Admin Mode)</h1>
          <p className="admin-page-sub">Kelola inventaris kacamata, tambah produk baru, edit, dan hapus langsung dari katalog.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setShow3dPreview(!show3dPreview)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(197, 168, 128, 0.3)',
              background: 'rgba(28, 24, 22, 0.8)',
              color: '#D4AF37',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {show3dPreview ? 'Sembunyikan 3D Preview' : 'Tampilkan 3D Preview'}
          </button>
        </div>
      </div>

      {/* Admin 3D Interactive Model Viewer */}
      {show3dPreview && (
        <div style={{ marginBottom: '24px' }}>
          <Glasses3DViewer modelUrl="/models/glasses_2.glb" height="320px" modelScale={6.8} showControls={true} />
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-val">{products.length}</span>
          <span className="stat-lbl">Total Kacamata</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-val">{products.filter(p => p.best_seller).length}</span>
          <span className="stat-lbl">Koleksi Best Seller</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-val">4 Kategori</span>
          <span className="stat-lbl">Sunglasses, Blue Light, Reading, Minus</span>
        </div>
      </div>

      {/* Toolbar: Search, Filter, View Mode Toggle & Create Button */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cari nama, bentuk, atau warna..."
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="admin-select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">Semua Kategori</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Blue Light">Blue Light</option>
            <option value="Reading Glasses">Reading Glasses</option>
            <option value="Minus">Minus</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1.5px solid #E5DBD0',
              background: '#FFFFFF',
              color: '#1C1816',
              fontWeight: '600',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            {viewMode === 'grid' ? 'Tampilan Tabel' : 'Tampilan Grid Cards'}
          </button>

          <button className="btn-add-product" onClick={handleOpenCreate}>
            + Form Pembuatan Kacamata
          </button>
        </div>
      </div>

      {/* Grid Cards View (Identical to User Catalog + Admin Edit/Delete Buttons) */}
      {viewMode === 'grid' && (
        <div style={{ marginTop: '20px' }}>
          {filteredProducts.length > 0 ? (
            <div className="cat-grid">
              {filteredProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  isAdmin={true} 
                  onEdit={handleOpenEdit} 
                  onDelete={(id) => setDeleteId(id)} 
                />
              ))}
            </div>
          ) : (
            <div className="cat-empty">
              <p>Tidak ada produk kacamata yang ditemukan.</p>
            </div>
          )}
        </div>
      )}

      {/* Table View (Alternative List View) */}
      {viewMode === 'table' && (
        <div className="admin-table-card" style={{ marginTop: '20px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Produk</th>
                <th>Bentuk & Warna</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600', color: '#9C9086' }}>#{p.id}</td>
                  <td>
                    <div className="table-prod-name">{p.name}</div>
                  </td>
                  <td>
                    <span className="table-meta-tag">{p.shape} • {p.color}</span>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ color: '#C5A880', fontWeight: '600' }}>{formatPrice(p.price)}</td>
                  <td>
                    {p.best_seller ? (
                      <span className="badge-bestseller">Best Seller</span>
                    ) : (
                      <span style={{ color: '#7A6F68', fontSize: '0.75rem' }}>Standar</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-action-edit" onClick={() => handleOpenEdit(p)}>
                      Edit
                    </button>
                    <button className="btn-action-delete" onClick={() => setDeleteId(p.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9C9086' }}>
                    {loading ? 'Memuat data kacamata...' : 'Tidak ada produk kacamata yang sesuai.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal Create & Edit */}
      {isModalOpen && (
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

              <div className="form-group full" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="best_seller"
                  id="best_seller_chk"
                  checked={formData.best_seller}
                  onChange={handleInputChange}
                />
                <label htmlFor="best_seller_chk" style={{ fontSize: '0.85rem', color: '#7A6F68', cursor: 'pointer' }}>
                  Tandai sebagai Koleksi Best Seller
                </label>
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
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

export default AdminCatalogPage
