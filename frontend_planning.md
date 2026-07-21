# 🎨 Frontend Planning — VTO Glasses

> **Stack:** React 19 + Vite + React Router v7 + Vanilla CSS
> **AR Engine:** MediaPipe FaceMesh + Canvas API (2D overlay)
> **State:** React Context API
> **API:** Laravel Backend (http://localhost:8000)

---

## 📁 Struktur Folder Target

```
src/
├── assets/ 
│   ├── glasses_showcase.png
│   └── hero.png
│
├── components/
│   ├── auth/
│   │   └── LoginRegister.jsx       ✅ DONE
│   ├── catalog/
│   │   ├── ProductCard.jsx         ← Card produk di katalog
│   │   ├── FilterSidebar.jsx       ← Sidebar filter & search
│   │   └── SortDropdown.jsx        ← Dropdown sort
│   ├── tryon/
│   │   ├── CameraView.jsx          ← WebRTC + Canvas overlay
│   │   ├── GlassesCarousel.jsx     ← Pilih model kacamata
│   │   ├── ActionBar.jsx           ← Tombol capture/share/compare
│   │   └── FaceShapeDetector.jsx   ← Deteksi bentuk wajah
│   ├── review/
│   │   ├── ReviewList.jsx          ← Daftar review
│   │   └── ReviewForm.jsx          ← Form submit review
│   ├── cart/
│   │   └── CartDrawer.jsx          ← Slide-in panel keranjang
│   └── common/
│       └── LoadingSpinner.jsx      ← Komponen loading
│
├── context/
│   ├── AuthContext.jsx             ✅ DONE
│   ├── CartContext.jsx             ← State keranjang belanja
│   ├── FavoriteContext.jsx         ← State wishlist
│   └── TryOnContext.jsx            ← State sesi try-on
│
├── hooks/
│   ├── useCamera.js                ← Hook WebRTC getUserMedia
│   ├── useMediaPipe.js             ← Hook face detection
│   ├── useFavorite.js              ← Hook tambah/hapus favorit
│   └── useCart.js                  ← Hook kelola keranjang
│
├── layouts/
│   ├── DashboardLayout.jsx         ✅ DONE
│   └── AdminLayout.jsx             ← Layout khusus admin
│
├── pages/
│   ├── dashboard/
│   │   └── DashboardHome.jsx       ✅ DONE (perlu diupgrade)
│   ├── home/
│   │   └── HomePage.jsx            ← Halaman utama hero
│   ├── catalog/
│   │   └── CatalogPage.jsx         ← Daftar produk + filter
│   ├── product/
│   │   └── ProductDetailPage.jsx   ← Detail + try-on
│   ├── tryon/
│   │   └── TryOnPage.jsx           ← Halaman kamera AR
│   ├── favorites/
│   │   └── FavoritesPage.jsx       ← Wishlist user
│   ├── history/
│   │   └── TryOnHistoryPage.jsx    ← Riwayat try-on
│   ├── checkout/
│   │   └── CheckoutPage.jsx        ← Checkout dummy
│   └── admin/
│       ├── AdminDashboard.jsx      ← Dashboard admin
│       ├── AdminProducts.jsx       ← CRUD produk
│       └── AdminProductForm.jsx    ← Form tambah/edit produk
│
├── services/
│   ├── api.js                      ← Base axios/fetch config
│   ├── productService.js           ← CRUD produk
│   ├── favoriteService.js          ← Tambah/hapus favorit
│   ├── historyService.js           ← Simpan & ambil riwayat
│   ├── reviewService.js            ← Submit & ambil review
│   └── cartService.js              ← Kelola keranjang
│
├── utils/
│   ├── faceShapeAnalyzer.js        ← Logika analisis bentuk wajah
│   ├── glassesOverlay.js           ← Logika posisi overlay kacamata
│   └── imageCapture.js             ← Fungsi screenshot & share
│
├── App.jsx                         ✅ (perlu update routing)
└── main.jsx                        ✅ DONE
```

---

## 🗺️ Routing Plan (App.jsx)

```jsx
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginRegister />} />

  {/* User Routes - perlu login */}
  <Route path="/" element={<DashboardLayout />}>
    <Route index element={<HomePage />} />
    <Route path="catalog" element={<CatalogPage />} />
    <Route path="catalog/:id" element={<ProductDetailPage />} />
    <Route path="try-on" element={<TryOnPage />} />
    <Route path="try-on/:id" element={<TryOnPage />} />
    <Route path="favorites" element={<FavoritesPage />} />
    <Route path="history" element={<TryOnHistoryPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
  </Route>

  {/* Admin Routes - perlu role admin */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="products" element={<AdminProducts />} />
    <Route path="products/new" element={<AdminProductForm />} />
    <Route path="products/:id/edit" element={<AdminProductForm />} />
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 📦 Library yang Perlu Diinstall

```bash
# AR & Face Detection
npm install @mediapipe/face_mesh @mediapipe/camera_utils

# HTTP Client
npm install axios

# Icons (mempercepat dev)
npm install lucide-react

# Opsional - jika upgrade ke 3D
npm install three @react-three/fiber @react-three/drei
```

---

## 🔢 8 Fase Pengerjaan

### FASE 1 — Halaman Statis (Minggu 1-2)
> Target: Semua halaman tampil dengan data dummy/hardcode

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| ✅ 1.1 | Update routing lengkap | `App.jsx` | 1 jam |
| ✅ 1.2 | Buat HomePage — hero + CTA | `pages/home/HomePage.jsx` | 3 jam |
| ✅ 1.3 | Buat CatalogPage — grid + filter | `pages/catalog/CatalogPage.jsx` | 4 jam |
| ✅ 1.4 | Buat ProductCard component | `components/catalog/ProductCard.jsx` | 2 jam |
| ✅ 1.5 | Buat FilterTopBar component | `components/catalog/FilterTopBar.jsx` | 2 jam |
| ✅ 1.6 | Buat ProductDetailPage | `pages/product/ProductDetailPage.jsx` | 3 jam |
| ✅ 1.7 | Buat FavoritesPage | `pages/favorites/FavoritesPage.jsx` | 2 jam |
| ✅ 1.8 | Buat TryOnHistoryPage | `pages/history/TryOnHistoryPage.jsx` | 2 jam |
| ✅ 1.9 | Buat CheckoutPage | `pages/checkout/CheckoutPage.jsx` | 3 jam |
| ✅ 1.10 | Upgrade DashboardHome | `pages/dashboard/DashboardHome.jsx` | 1 jam |

---

### FASE 2 — Koneksi Backend API (Minggu 2-3)
> Target: Data produk nyata dari Laravel

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| 2.1 | Setup axios + base URL | `services/api.js` | 1 jam |
| 2.2 | Buat productService | `services/productService.js` | 2 jam |
| 2.3 | Integrasi CatalogPage + API | `pages/catalog/CatalogPage.jsx` | 2 jam |
| 2.4 | Integrasi ProductDetailPage + API | `pages/product/ProductDetailPage.jsx` | 2 jam |
| 2.5 | Setup CartContext | `context/CartContext.jsx` | 2 jam |
| 2.6 | Setup FavoriteContext | `context/FavoriteContext.jsx` | 2 jam |
| 2.7 | Integrasi Favorit — tambah/hapus | `services/favoriteService.js` | 2 jam |

---

### FASE 3 — AR Camera Try-On ⭐ (Minggu 3-5)
> Target: Kamera aktif + kacamata overlay di wajah secara real-time

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| 3.1 | Hook `useCamera` — WebRTC getUserMedia | `hooks/useCamera.js` | 3 jam |
| 3.2 | Komponen `CameraView` — video + canvas | `components/tryon/CameraView.jsx` | 4 jam |
| 3.3 | Integrasi MediaPipe FaceMesh | `hooks/useMediaPipe.js` | 5 jam |
| 3.4 | Logika overlay kacamata 2D di canvas | `utils/glassesOverlay.js` | 6 jam |
| 3.5 | `GlassesCarousel` — ganti model kacamata | `components/tryon/GlassesCarousel.jsx` | 3 jam |
| 3.6 | TryOnPage lengkap | `pages/tryon/TryOnPage.jsx` | 4 jam |
| 3.7 | Kalibrasi posisi & skala overlay | Testing manual | 4 jam |

---

### FASE 4 — Capture, Share & History (Minggu 6-7)

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| 4.1 | Fungsi screenshot dari canvas | `utils/imageCapture.js` | 2 jam |
| 4.2 | Tombol download gambar | `components/tryon/ActionBar.jsx` | 1 jam |
| 4.3 | Share ke sosmed — Web Share API | `utils/imageCapture.js` | 2 jam |
| 4.4 | Simpan riwayat try-on ke backend | `services/historyService.js` | 2 jam |
| 4.5 | Integrasi TryOnHistoryPage + API | `pages/history/TryOnHistoryPage.jsx` | 2 jam |

---

### FASE 5 — Rating & Review (Minggu 7)

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| 5.1 | Komponen ReviewList | `components/review/ReviewList.jsx` | 2 jam |
| 5.2 | Komponen ReviewForm — bintang + teks | `components/review/ReviewForm.jsx` | 3 jam |
| 5.3 | Integrasi review ke ProductDetailPage | `pages/product/ProductDetailPage.jsx` | 2 jam |
| 5.4 | reviewService — submit & fetch | `services/reviewService.js` | 1 jam |

---

### FASE 6 — Dashboard Admin (Minggu 8)

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| 6.1 | AdminLayout — sidebar admin | `layouts/AdminLayout.jsx` | 2 jam |
| 6.2 | AdminDashboard — statistik | `pages/admin/AdminDashboard.jsx` | 3 jam |
| 6.3 | AdminProducts — tabel CRUD | `pages/admin/AdminProducts.jsx` | 4 jam |
| 6.4 | AdminProductForm — upload gambar + 3D | `pages/admin/AdminProductForm.jsx` | 5 jam |
| 6.5 | Proteksi route admin — cek role | `App.jsx` | 1 jam |

---

### FASE 7 — Fitur Bonus (Minggu 9)

| No | Task | File Target | Estimasi |
|----|------|------------|----------|
| 7.1 | Deteksi bentuk wajah dari landmark MediaPipe | `utils/faceShapeAnalyzer.js` | 5 jam |
| 7.2 | Badge bentuk wajah di TryOnPage | `pages/tryon/TryOnPage.jsx` | 2 jam |
| 7.3 | Mode Perbandingan — split screen 2 kacamata | `components/tryon/CompareMode.jsx` | 5 jam |

---

### FASE 8 — Polish & Testing (Minggu 10)

| No | Task | Estimasi |
|----|------|----------|
| 8.1 | Responsive design — mobile friendly | 4 jam |
| 8.2 | Loading states semua halaman | 2 jam |
| 8.3 | Error handling & empty states | 2 jam |
| 8.4 | Testing di berbagai browser & device | 3 jam |
| 8.5 | Optimasi performa — lazy loading | 3 jam |

---

## 🔌 API Endpoints yang Dibutuhkan dari Backend

| Method | Endpoint | Fungsi | Fase |
|--------|----------|--------|------|
| POST | `/api/login` | Login user | Auth ✅ |
| POST | `/api/register` | Daftar user baru | Auth ✅ |
| POST | `/api/logout` | Logout | Auth ✅ |
| GET | `/api/user` | Data user aktif | Auth ✅ |
| GET | `/api/products` | Ambil semua produk + filter | Fase 2 |
| GET | `/api/products/:id` | Detail 1 produk | Fase 2 |
| GET | `/api/categories` | Daftar kategori | Fase 2 |
| POST | `/api/favorites` | Tambah favorit | Fase 2 |
| DELETE | `/api/favorites/:id` | Hapus favorit | Fase 2 |
| GET | `/api/favorites` | Daftar favorit user | Fase 2 |
| POST | `/api/try-on-history` | Simpan riwayat try-on | Fase 4 |
| GET | `/api/try-on-history` | Ambil riwayat user | Fase 4 |
| POST | `/api/reviews` | Kirim review | Fase 5 |
| GET | `/api/products/:id/reviews` | Review per produk | Fase 5 |
| GET | `/api/admin/products` | Admin — list produk | Fase 6 |
| POST | `/api/admin/products` | Admin — tambah produk | Fase 6 |
| PUT | `/api/admin/products/:id` | Admin — edit produk | Fase 6 |
| DELETE | `/api/admin/products/:id` | Admin — hapus produk | Fase 6 |

---

## ⚠️ Catatan Penting

> [!IMPORTANT]
> **Urutan wajib diikuti!** Jangan coding Fase 3 (AR) sebelum Fase 1 & 2 selesai — TryOnPage butuh data produk nyata dari API.

> [!TIP]
> **Mulai AR dengan versi 2D dulu** (overlay PNG di Canvas) sebelum upgrade ke 3D. Lebih cepat, lebih mudah di-debug.

> [!WARNING]
> **MediaPipe butuh HTTPS** di production. Development pakai `localhost` cukup, tapi saat deploy wajib SSL.

> [!NOTE]
> **Semua fitur AR jalan di client-side** — tidak butuh server untuk memproses gambar kamera. MediaPipe bekerja langsung di browser user.
