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
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginRegister />} />

          {/* Protected User Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="catalog/:id" element={<ProductDetailPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="history" element={<TryOnHistoryPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="dashboard" element={<DashboardHome />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
