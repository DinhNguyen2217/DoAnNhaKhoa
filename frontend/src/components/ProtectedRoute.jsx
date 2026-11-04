import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spin } from 'antd'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home page
    const roleRoutes = {
      admin: '/admin/dashboard',
      receptionist: '/receptionist/dashboard',
      doctor: '/doctor/dashboard',
      patient: '/patient/dashboard',
    }
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />
  }

  return children
}
