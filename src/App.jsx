import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginRegister from './components/auth/LoginRegister'
import DashboardLayout from './layouts/DashboardLayout'
import HomePage from './pages/home/HomePage'
import CatalogPage from './pages/catalog/CatalogPage'
import ProductDetailPage from './pages/product/ProductDetailPage'
import FavoritesPage from './pages/favorites/FavoritesPage'
import TryOnHistoryPage from './pages/history/TryOnHistoryPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import DashboardHome from './pages/dashboard/DashboardHome'
import AdminCatalogPage from './pages/admin/AdminCatalogPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login/Register Page */}
          <Route path="/login" element={<LoginRegister />} />

          {/* Unified Application Routes under Standard Dashboard Layout & Navigation Header */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ProductDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<TryOnHistoryPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<DashboardHome />} />

            {/* Admin Dedicated CRUD Routes */}
            <Route path="/admin/dashboard" element={<HomePage />} />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Root path redirects to /dashboard (which prompts /login if unauthenticated) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all redirect to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
