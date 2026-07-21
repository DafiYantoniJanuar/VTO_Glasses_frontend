import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CheckoutPage.css'

const DUMMY_CART = [
  { id: 1, name: 'The Architect - Matte Black', variant: 'Prescription Lenses', price: 2460000, qty: 1 },
  { id: 2, name: 'The Ghost - Clear Grey', variant: 'Blue Light Filter', price: 1420000, qty: 1 },
]

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p)

function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(DUMMY_CART)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    address: '', city: '', zip: '', province: ''
  })
  const [ordered, setOrdered] = useState(false)

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item =>
      item.id === id
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item
    ))
  }

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const tax = Math.round(subtotal * 0.09)
  const total = subtotal + tax

  const handleOrder = (e) => {
    e.preventDefault()
    setOrdered(true)
  }

  if (ordered) {
    return (
      <div className="co-wrapper">
        <div className="co-success">
          <div className="co-success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="co-success-title">Pesanan Berhasil!</h2>
          <p className="co-success-msg">Terima kasih telah berbelanja di VTO Glasses. Pesanan kamu sedang diproses.</p>
          <div className="co-success-actions">
            <button onClick={() => navigate('/catalog')} className="co-btn-primary">Lanjut Belanja</button>
            <button onClick={() => { setOrdered(false); setCart(DUMMY_CART) }} className="co-btn-secondary">Lihat Pesanan</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="co-wrapper">
      {/* Left: Cart + Shipping */}
      <div className="co-left">
        <button onClick={() => navigate('/catalog')} className="co-back-btn">
          ← Back to Catalog
        </button>
        <h1 className="co-title">Checkout</h1>
        <p className="co-subtitle">Review your items and complete your order.</p>

        {/* Cart Items */}
        <section className="co-section">
          <h2 className="co-section-title">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="co-empty-cart">
              <p>Keranjang kosong</p>
              <button onClick={() => navigate('/catalog')} className="co-btn-primary" style={{ marginTop: 12 }}>Browse Catalog</button>
            </div>
          ) : (
            <div className="co-cart-items">
              {cart.map(item => (
                <div key={item.id} className="co-cart-item">
                  <div className="co-item-img">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
                      <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
                      <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
                    </svg>
                  </div>
                  <div className="co-item-info">
                    <span className="co-item-name">{item.name}</span>
                    <span className="co-item-variant">{item.variant}</span>
                    <div className="co-item-qty">
                      <button onClick={() => updateQty(item.id, -1)} className="co-qty-btn">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, +1)} className="co-qty-btn">+</button>
                    </div>
                  </div>
                  <div className="co-item-right">
                    <button onClick={() => removeItem(item.id)} className="co-remove-btn">Remove</button>
                    <span className="co-item-price">{formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shipping Form */}
        <section className="co-section">
          <h2 className="co-section-title">Shipping Details</h2>
          <form className="co-form" id="checkout-form" onSubmit={handleOrder}>
            <div className="co-form-row">
              <div className="co-field-group">
                <label className="co-label">FIRST NAME</label>
                <input className="co-input" placeholder="Jane" value={form.firstName}
                  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} required />
              </div>
              <div className="co-field-group">
                <label className="co-label">LAST NAME</label>
                <input className="co-input" placeholder="Doe" value={form.lastName}
                  onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))} required />
              </div>
            </div>
            <div className="co-field-group">
              <label className="co-label">EMAIL ADDRESS</label>
              <input type="email" className="co-input" placeholder="jane@example.com" value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} required />
            </div>
            <div className="co-field-group">
              <label className="co-label">SHIPPING ADDRESS</label>
              <input className="co-input" placeholder="Jl. Sudirman No. 123" value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} required />
            </div>
            <div className="co-form-row">
              <div className="co-field-group">
                <label className="co-label">CITY</label>
                <input className="co-input" placeholder="Jakarta" value={form.city}
                  onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} required />
              </div>
              <div className="co-field-group">
                <label className="co-label">ZIP CODE</label>
                <input className="co-input" placeholder="10110" value={form.zip}
                  onChange={e => setForm(prev => ({ ...prev, zip: e.target.value }))} required />
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* Right: Order Summary */}
      <div className="co-right">
        <div className="co-summary-card">
          <h2 className="co-summary-title">Order Summary</h2>

          <div className="co-summary-rows">
            <div className="co-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="co-summary-row">
              <span>Shipping</span>
              <span className="co-free">Gratis</span>
            </div>
            <div className="co-summary-row">
              <span>Tax (9%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
          </div>

          <div className="co-summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            className="co-place-order-btn"
            disabled={cart.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Place Order
          </button>
          <p className="co-secure-text">Secure encrypted checkout.</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
