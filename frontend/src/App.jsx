import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import ReceptionistLayout from './layouts/ReceptionistLayout'
import DoctorLayout from './layouts/DoctorLayout'
import PatientLayout from './layouts/PatientLayout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import Accounts from './pages/admin/Accounts'
import Doctors from './pages/admin/Doctors'
import Patients from './pages/admin/Patients'
import Services from './pages/admin/Services'
import Statistics from './pages/admin/Statistics'
import Payroll from './pages/admin/Payroll'

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard'
import ReceptionistAppointments from './pages/receptionist/Appointments'
import ReceptionistDeposit from './pages/receptionist/Deposit'
import ReceptionistReception from './pages/receptionist/Reception'
import ReceptionistInvoices from './pages/receptionist/Invoices'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorSchedule from './pages/doctor/Schedule'
import DoctorPatients from './pages/doctor/Patients'
import DoctorExamination from './pages/doctor/Examination'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientBooking from './pages/patient/Booking'
import PatientAppointments from './pages/patient/Appointments'
import PatientMedicalRecords from './pages/patient/MedicalRecords'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/patient/dashboard" replace />

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'receptionist') return <Navigate to="/receptionist/dashboard" replace />
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />
  return <Navigate to="/patient/dashboard" replace />
}

export default function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        }
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Root & Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="patients" element={<Patients />} />
              <Route path="services" element={<Services />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>

            {/* Receptionist Routes */}
            <Route
              path="/receptionist"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                  <ReceptionistLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/receptionist/dashboard" replace />} />
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="appointments" element={<ReceptionistAppointments />} />
              <Route path="deposit" element={<ReceptionistDeposit />} />
              <Route path="reception" element={<ReceptionistReception />} />
              <Route path="invoices" element={<ReceptionistInvoices />} />
            </Route>

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="examination" element={<DoctorExamination />} />
            </Route>

            {/* Patient & Public Clinic Portal Routes */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              {/* Trang chủ phòng khám công khai cho tất cả mọi người */}
              <Route path="dashboard" element={<PatientDashboard />} />

              {/* Các trang nghiệp vụ cá nhân cần đăng nhập tài khoản bệnh nhân */}
              <Route
                path="booking"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'admin']}>
                    <PatientBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="appointments"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'admin']}>
                    <PatientAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="records"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'admin']}>
                    <PatientMedicalRecords />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  )
}
