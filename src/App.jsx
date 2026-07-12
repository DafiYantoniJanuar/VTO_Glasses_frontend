import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginRegister from './components/auth/LoginRegister'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login/register page */}
          <Route path="/login" element={<LoginRegister />} />

          {/* Protected Dashboard Layout and Sub-pages */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>

          {/* Catch-all route redirecting back to home/dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
