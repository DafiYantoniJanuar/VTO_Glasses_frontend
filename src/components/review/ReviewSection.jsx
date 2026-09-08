import { useState, useEffect, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './ReviewSection.css'

const API_BASE_URL = 'http://localhost:8000/api'

// Helper for relative time in Indonesian
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Baru saja'
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 30) return `${diffDays} hari lalu`
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'Baru saja'
  }
}

// Gold Luxury Star Icon
function StarIcon({ filled, size = 18, half = false }) {
  const gradientId = useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={half ? `url(#${gradientId})` : (filled ? '#C5A880' : 'none')}
      stroke={filled || half ? '#C5A880' : '#D2C7BC'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="review-star-svg"
    >
      {half && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#C5A880" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function ReviewSection({ productId, productName, onRatingUpdated }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoggedIn = Boolean(user && !user.isGuest && user.token)

  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({
    average_rating: 5.0,
    total_reviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    fit_stats: { 'Sangat Pas': 0, 'Sedikit Sempit': 0, 'Sedikit Longgar': 0 }
  })
  const [eligibility, setEligibility] = useState({
    is_authenticated: false,
    has_purchased: false,
    has_reviewed: false,
    can_review: false,
    is_admin: false,
    my_review: null
  })

  const [loadingReviews, setLoadingReviews] = useState(true)
  const [loadingEligibility, setLoadingEligibility] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [starFilter, setStarFilter] = useState('All')

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)

  // Form State
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [fitFeedback, setFitFeedback] = useState('Sangat Pas')
  const [vtoAccuracy, setVtoAccuracy] = useState('Sesuai AR')
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  // 1. Fetch Reviews & Summary (Independent & Fast)
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`)
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setReviews(json.data.reviews || [])
          setSummary(json.data.summary || summary)
          if (onRatingUpdated && json.data.summary) {
            onRatingUpdated(json.data.summary.average_rating, json.data.summary.total_reviews)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch reviews:', e)
    } finally {
      setLoadingReviews(false)
    }
  }

  // 2. Check User Eligibility (Verified Buyer status)
  const checkEligibility = async () => {
    if (!isLoggedIn) {
      setEligibility({
        is_authenticated: false,
        has_purchased: false,
        has_reviewed: false,
        can_review: false,
        is_admin: false,
        my_review: null
      })
      return
    }

    setLoadingEligibility(true)
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/review-eligibility`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      })
      if (res.ok) {
        const json = await res.json()
        setEligibility(json)
      }
    } catch (e) {
      console.warn('Failed to check review eligibility:', e)
    } finally {
      setLoadingEligibility(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    checkEligibility()
  }, [productId, isLoggedIn, user?.token])

  // 3. Start Edit Mode
  const handleStartEdit = (rev) => {
    const targetRev = rev || eligibility.my_review
    if (!targetRev) return

    setIsEditMode(true)
    setEditingReviewId(targetRev.id)
    setRating(Number(targetRev.rating) || 5)
    setComment(targetRev.comment || '')
    setFitFeedback(targetRev.fit_feedback || 'Sangat Pas')
    setVtoAccuracy(targetRev.vto_accuracy || 'Sesuai AR')
    setFormError(null)
    setFormSuccess(null)

    // Smooth scroll to form
    const container = document.getElementById('vto-review-action-box')
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditingReviewId(null)
    setComment('')
    setRating(5)
    setFormError(null)
    setFormSuccess(null)
  }

  // 4. Handle Submit Review (Create or Update)
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      setFormError('Silakan masuk ke akun Anda terlebih dahulu.')
      return
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setFormError('Silakan tulis ulasan minimal 3 karakter.')
      return
    }

    setSubmitting(true)
    setFormError(null)

    const isUpdating = isEditMode && editingReviewId
    const url = isUpdating ? `${API_BASE_URL}/reviews/${editingReviewId}` : `${API_BASE_URL}/reviews`
    const method = isUpdating ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          comment: comment.trim(),
          fit_feedback: fitFeedback,
          vto_accuracy: vtoAccuracy
        })
      })

      const data = await res.json()

      if (res.ok) {
        setFormSuccess(isUpdating ? 'Ulasan Anda berhasil diperbarui!' : 'Ulasan Anda berhasil dipublikasikan!')
        setIsEditMode(false)
        setEditingReviewId(null)
        setComment('')
        // Refresh reviews and eligibility concurrently
        await Promise.all([fetchReviews(), checkEligibility()])
      } else {
        setFormError(data.message || 'Gagal menyimpan ulasan.')
      }
    } catch {
      setFormError('Terjadi kesalahan jaringan saat mengirim ulasan.')
    } finally {
      setSubmitting(false)
    }
  }

  // 5. Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return

    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      })
      if (res.ok) {
        setIsEditMode(false)
        setEditingReviewId(null)
        await Promise.all([fetchReviews(), checkEligibility()])
      } else {
        const errJson = await res.json()
        alert(errJson.message || 'Gagal menghapus ulasan.')
      }
    } catch {
      alert('Terjadi kesalahan koneksi.')
    }
  }

  // Filter reviews by star
  const filteredReviews = reviews.filter(rev => {
    if (starFilter === 'All') return true
    return (parseInt(rev.rating) === parseInt(starFilter))
  })

  // Calculate percentage helper
  const getStarPercentage = (count) => {
    if (!summary.total_reviews || summary.total_reviews === 0) return 0
    return Math.round((count / summary.total_reviews) * 100)
  }

  const dominantFit = Object.entries(summary.fit_stats || {}).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0])

  return (
    <div className="vto-review-section">
      {/* ─── 1. RATING SUMMARY HEADER ─── */}
      <div className="vto-review-overview-card">
        {/* Left: Big Score */}
        <div className="vto-review-score-box">
          <div className="vto-review-big-score">{Number(summary.average_rating || 5.0).toFixed(1)}</div>
          <div className="vto-review-stars-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} filled={s <= Math.round(summary.average_rating)} size={20} />
            ))}
          </div>
          <div className="vto-review-total-label">
            Berdasarkan {summary.total_reviews} ulasan pembeli
          </div>
          {dominantFit[1] > 0 && (
            <div className="vto-review-highlight-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Mayoritas: Ukuran <strong>{dominantFit[0]}</strong></span>
            </div>
          )}
        </div>

        {/* Center: Rating Bar Distribution */}
        <div className="vto-review-breakdown-box">
          <h4 className="vto-breakdown-title">Distribusi Rating</h4>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.breakdown ? (summary.breakdown[star] || 0) : 0
            const pct = getStarPercentage(count)
            return (
              <div
                key={star}
                className={`vto-breakdown-row ${starFilter === star ? 'active-filter' : ''}`}
                onClick={() => setStarFilter(starFilter === star ? 'All' : star)}
                title={`Filter bintang ${star}`}
              >
                <span className="vto-breakdown-star-label">{star} ★</span>
                <div className="vto-breakdown-bar-bg">
                  <div
                    className="vto-breakdown-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="vto-breakdown-count">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Right: AR Precision Info Badge */}
        <div className="vto-review-vto-box">
          <div className="vto-vto-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h4 className="vto-vto-title">Akurasi Fitting AR</h4>
          <p className="vto-vto-desc">
            98% pembeli menyatakan bentuk dan ukuran fisik kacamata sangat presisi dengan hasil uji coba kamera Virtual Try-On.
          </p>
        </div>
      </div>

      {/* ─── 2. STATE-AWARE REVIEW FORM / LOCKED CARD ─── */}
      <div className="vto-review-action-container" id="vto-review-action-box">
        {loadingEligibility ? (
          /* Smooth Skeleton Loader */
          <div className="vto-review-skeleton-box">
            <div className="vto-skeleton-line title" />
            <div className="vto-skeleton-line desc" />
          </div>
        ) : !isLoggedIn ? (
          /* GUEST / NOT LOGGED IN */
          <div className="vto-review-locked-card">
            <div className="vto-locked-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C827A" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="vto-locked-text">
              <h4>Ingin Membagikan Ulasan?</h4>
              <p>Masuk ke akun Anda untuk melihat status pesanan dan memberikan ulasan kacamata.</p>
            </div>
            <button className="vto-btn-gold-outline" onClick={() => navigate('/login')}>
              Masuk / Login
            </button>
          </div>
        ) : eligibility.has_reviewed && !isEditMode ? (
          /* ALREADY REVIEWED: SHOW USER'S PUBLISHED REVIEW WITH EDIT & DELETE */
          <div className="vto-review-success-card">
            <div className="vto-success-header">
              <div className="vto-success-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Ulasan Anda Telah Dipublikasikan</span>
              </div>
              
              {/* Edit & Delete Action Buttons */}
              <div className="vto-my-review-actions-group">
                <button
                  type="button"
                  className="vto-btn-edit-review"
                  onClick={() => handleStartEdit(eligibility.my_review)}
                  title="Edit ulasan saya"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Edit Ulasan</span>
                </button>
                <button
                  type="button"
                  className="vto-btn-delete-review"
                  onClick={() => handleDeleteReview(eligibility.my_review.id)}
                  title="Hapus ulasan saya"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {eligibility.my_review && (
              <div className="vto-my-review-content">
                <div className="vto-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} filled={s <= eligibility.my_review.rating} size={16} />
                  ))}
                  <span className="vto-my-review-fit">{eligibility.my_review.fit_feedback}</span>
                  {eligibility.my_review.vto_accuracy && (
                    <span className="vto-my-review-ar">{eligibility.my_review.vto_accuracy}</span>
                  )}
                </div>
                <p className="vto-my-review-text">&ldquo;{eligibility.my_review.comment}&rdquo;</p>
              </div>
            )}
          </div>
        ) : !eligibility.has_purchased && !eligibility.is_admin ? (
          /* LOGGED IN BUT NOT PURCHASED (LOCKED STATE) */
          <div className="vto-review-locked-card verified-notice">
            <div className="vto-locked-icon verified">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C5A880" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="vto-locked-text">
              <h4>Khusus Pembeli Terverifikasi (Verified Buyer Only)</h4>
              <p>
                Untuk menjaga keaslian ulasan, fitur ulasan hanya terbuka untuk pembeli yang telah melakukan transaksi checkout produk <strong>{productName}</strong>.
              </p>
            </div>
            <button className="vto-btn-gold-solid" onClick={() => navigate('/checkout')}>
              Beli Kacamata Ini
            </button>
          </div>
        ) : (
          /* ELIGIBLE OR EDITING: SHOW INTERACTIVE REVIEW FORM */
          <form className="vto-review-form" onSubmit={handleSubmitReview}>
            <div className="vto-form-header">
              <div>
                <div className="vto-form-badge-row">
                  <div className="vto-verified-buyer-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Pembeli Terverifikasi</span>
                  </div>
                  {isEditMode && (
                    <span className="vto-editing-badge">Mode Edit</span>
                  )}
                </div>
                <h3 className="vto-form-title">
                  {isEditMode ? `Edit Ulasan untuk ${productName}` : `Tulis Ulasan untuk ${productName}`}
                </h3>
              </div>
            </div>

            {formSuccess && (
              <div className="vto-form-alert success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="vto-form-alert error">
                <span>{formError}</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="vto-form-group">
              <label className="vto-form-label">Skor Kepuasan Anda</label>
              <div className="vto-interactive-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="vto-star-pick-btn"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <StarIcon
                      filled={star <= (hoverRating || rating)}
                      size={28}
                    />
                  </button>
                ))}
                <span className="vto-star-rating-hint">
                  {['', 'Sangat Buruk', 'Kurang Memuaskan', 'Cukup Baik', 'Sangat Bagus', 'Luar Biasa Sempurna!'][hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Fit Feedback Radio Chips */}
            <div className="vto-form-group">
              <label className="vto-form-label">Kenyamanan & Ukuran di Wajah</label>
              <div className="vto-fit-chips">
                {['Sangat Pas', 'Sedikit Sempit', 'Sedikit Longgar'].map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    className={`vto-fit-chip ${fitFeedback === fit ? 'selected' : ''}`}
                    onClick={() => setFitFeedback(fit)}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="vto-form-group">
              <label className="vto-form-label">Pengalaman & Ulasan Anda</label>
              <textarea
                className="vto-review-textarea"
                rows="4"
                placeholder={`Ceritakan bagaimana kualitas bahan, kenyamanan pemakaian, dan kemiripannya dengan hasil coba kamera AR ${productName}...`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                required
              />
              <span className="vto-char-counter">{comment.length} / 1000 karakter</span>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="vto-form-footer">
              <button
                type="submit"
                className="vto-btn-gold-solid"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Kirim Ulasan Terverifikasi')}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  className="vto-btn-cancel-edit"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* ─── 3. REVIEWS LIST & FILTER ─── */}
      <div className="vto-review-list-header">
        <h3 className="vto-list-title">
          Ulasan Pengguna ({filteredReviews.length})
        </h3>
        
        {/* Star Filter Chips */}
        <div className="vto-star-filter-chips">
          <button
            className={`vto-star-filter-chip ${starFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStarFilter('All')}
          >
            Semua Bintang
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              className={`vto-star-filter-chip ${starFilter === s ? 'active' : ''}`}
              onClick={() => setStarFilter(s)}
            >
              {s} ★ ({summary.breakdown ? summary.breakdown[s] || 0 : 0})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards */}
      {loadingReviews ? (
        <div className="vto-review-empty">
          <p>Memuat daftar ulasan...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="vto-review-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D2C7BC" strokeWidth="1.2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p>Belum ada ulasan dengan {starFilter === 'All' ? 'kriteria ini' : `rating ${starFilter} bintang`}.</p>
        </div>
      ) : (
        <div className="vto-review-cards-list">
          {filteredReviews.map((rev) => {
            const authorName = rev.user?.name || 'Pelanggan VTO'
            const authorInitial = authorName.charAt(0).toUpperCase()
            
            // Strict authorization check: Only the review owner or admin can edit/delete
            const isMyReview = isLoggedIn && (
              (user.id && rev.user_id === user.id) ||
              (user.email && rev.user?.email === user.email) ||
              (eligibility.my_review && rev.id === eligibility.my_review.id)
            )
            const canManage = isMyReview || (user?.role === 'admin' || user?.email === 'admin@vtogla.com')

            return (
              <div key={rev.id} className={`vto-review-card ${isMyReview ? 'is-my-own' : ''}`}>
                {/* Author row */}
                <div className="vto-review-card-header">
                  <div className="vto-review-author-info">
                    <div className="vto-review-avatar">{authorInitial}</div>
                    <div>
                      <div className="vto-author-name-row">
                        <span className="vto-author-name">{authorName}</span>
                        {isMyReview && <span className="vto-my-own-pill">Ulasan Anda</span>}
                        <span className="vto-verified-buyer-tag">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Verified Buyer
                        </span>
                      </div>
                      <span className="vto-review-date">{formatRelativeTime(rev.created_at)}</span>
                    </div>
                  </div>

                  {/* Stars & Owner Action Buttons */}
                  <div className="vto-review-header-actions">
                    <div className="vto-stars-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} filled={s <= rev.rating} size={15} />
                      ))}
                    </div>

                    {/* ONLY RENDER EDIT & DELETE BUTTONS IF USER OWNS THIS REVIEW (OR IS ADMIN) */}
                    {canManage && (
                      <div className="vto-card-owner-actions">
                        <button
                          type="button"
                          className="vto-review-action-icon-btn edit"
                          onClick={() => handleStartEdit(rev)}
                          title="Edit ulasan saya"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="vto-review-action-icon-btn delete"
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Hapus ulasan saya"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges (Fit & AR accuracy) */}
                <div className="vto-review-meta-tags">
                  {rev.fit_feedback && (
                    <span className="vto-meta-tag fit">
                      Fit: {rev.fit_feedback}
                    </span>
                  )}
                  {rev.vto_accuracy && (
                    <span className="vto-meta-tag ar">
                      AR: {rev.vto_accuracy}
                    </span>
                  )}
                </div>

                {/* Comment text */}
                <p className="vto-review-comment">{rev.comment}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReviewSection
