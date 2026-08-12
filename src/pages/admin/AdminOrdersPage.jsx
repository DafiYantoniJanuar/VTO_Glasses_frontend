import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminOrdersPage.css'

const API_ORDERS_URL = 'http://localhost:8000/api/orders'

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p || 0)

function AdminOrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Selected order details for modal popup
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Redirect non-admin users
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@vtogla.com')
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = { 'Accept': 'application/json' }
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }
      const res = await fetch(API_ORDERS_URL, { headers })
      if (res.ok) {
        const json = await res.json()
        setOrders(json.data || [])
      } else {
        setError('Gagal memuat daftar pesanan dari server.')
      }
    } catch {
      setError('Terjadi kesalahan koneksi jaringan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="ao-wrapper">
      <div className="ao-header">
        <div>
          <h1 className="ao-title">Order Management</h1>
          <p className="ao-subtitle">Pantau dan kelola seluruh transaksi pembelian kacamata masuk.</p>
        </div>
        <button onClick={fetchOrders} className="ao-refresh-btn" title="Refresh data pesanan">
          Refresh Data
        </button>
      </div>

      <div className="ao-divider" />

      {loading ? (
        <div style={{ color: '#7A6F68', padding: '24px 0' }}>Memuat data transaksi...</div>
      ) : error ? (
        <div className="ao-error-box">
          <p>{error}</p>
          <button onClick={fetchOrders} className="ao-retry-btn">Coba Lagi</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="ao-empty-box">
          <p>Belum ada transaksi pesanan yang masuk.</p>
        </div>
      ) : (
        <div className="ao-table-container">
          <table className="ao-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pelanggan</th>
                <th>Email</th>
                <th>Kota & Alamat</th>
                <th>Jumlah Item</th>
                <th>Total Pembayaran</th>
                <th>Tanggal Masuk</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const totalItems = (order.items || []).reduce((sum, item) => sum + (item.qty || 1), 0)
                const dateStr = new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <tr key={order.id}>
                    <td className="ao-td-bold">#ORD-{order.id}</td>
                    <td>{order.first_name} {order.last_name}</td>
                    <td>{order.email}</td>
                    <td className="ao-td-truncate" title={`${order.address}, ${order.city}`}>{order.city} - {order.address}</td>
                    <td>{totalItems} item</td>
                    <td className="ao-td-price">{formatPrice(order.total)}</td>
                    <td className="ao-td-date">{dateStr}</td>
                    <td>
                      <button 
                        onClick={() => setSelectedOrder(order)} 
                        className="ao-view-detail-btn"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="ao-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="ao-modal" onClick={e => e.stopPropagation()}>
            <div className="ao-modal-header">
              <h2 className="ao-modal-title">Detail Pesanan #ORD-{selectedOrder.id}</h2>
              <button className="ao-close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            
            <div className="ao-modal-body">
              <div className="ao-modal-info-grid">
                <div>
                  <h4 className="ao-info-label">Pelanggan</h4>
                  <p className="ao-info-val">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                </div>
                <div>
                  <h4 className="ao-info-label">Email</h4>
                  <p className="ao-info-val">{selectedOrder.email}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <h4 className="ao-info-label">Alamat Pengiriman</h4>
                  <p className="ao-info-val">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.zip}</p>
                </div>
              </div>

              <div className="ao-items-section">
                <h4 className="ao-info-label" style={{ marginBottom: '10px' }}>Item yang Dibeli</h4>
                <div className="ao-items-list">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="ao-item-row">
                      <div className="ao-item-name-col">
                        <span className="ao-item-name">{item.name}</span>
                      </div>
                      <div className="ao-item-details-col">
                        <span>{item.qty} x {formatPrice(item.price)}</span>
                        <span className="ao-item-row-total">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ao-summary-box">
                <div className="ao-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="ao-summary-row">
                  <span>Pajak (9%)</span>
                  <span>{formatPrice(selectedOrder.tax)}</span>
                </div>
                <div className="ao-summary-row ao-total-row">
                  <span>Total Pembayaran</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="ao-modal-footer">
              <button className="ao-btn-close-action" onClick={() => setSelectedOrder(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
