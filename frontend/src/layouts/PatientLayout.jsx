import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined, AppstoreOutlined, TeamOutlined,
  CalendarOutlined, HistoryOutlined, HeartOutlined,
  LogoutOutlined, UserOutlined, PlusCircleOutlined,
  PhoneOutlined, ReadOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/auth'
import ChatbotWidget from '../components/ChatbotWidget'
import toast from 'react-hot-toast'

const { Header, Content, Footer } = Layout
const { Text } = Typography

export default function PatientLayout() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (key) => {
    if (key.startsWith('#')) {
      // If we are on dashboard, scroll to element
      if (location.pathname === '/patient/dashboard' || location.pathname === '/') {
        const elem = document.querySelector(key)
        if (elem) elem.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/patient/dashboard' + key)
      }
    } else {
      navigate(key)
    }
  }

  // Base public navigation items
  const menuItems = [
    { key: '/patient/dashboard', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: '#gioi-thieu', icon: <InfoCircleOutlined />, label: 'Giới thiệu' },
    { key: '#dich-vu', icon: <AppstoreOutlined />, label: 'Dịch vụ & Bảng giá' },
    { key: '#bac-si', icon: <TeamOutlined />, label: 'Đội ngũ Bác sĩ' },
    { key: '#tin-tuc', icon: <ReadOutlined />, label: 'Cẩm nang' },
    { key: '#lien-he', icon: <PhoneOutlined />, label: 'Liên hệ & Giờ mở cửa' },
  ]

  // Add personal menu items if patient is logged in
  if (user && user.role === 'patient') {
    menuItems.push(
      { key: '/patient/booking', icon: <PlusCircleOutlined />, label: 'Đặt lịch' },
      { key: '/patient/appointments', icon: <CalendarOutlined />, label: 'Lịch của tôi' },
      { key: '/patient/records', icon: <HistoryOutlined />, label: 'Bệnh án' }
    )
  }

  const handleLogout = async () => {
    try { await logout(localStorage.getItem('refresh_token')) } catch {}
    logoutUser()
    navigate('/login')
    toast.success('Đã đăng xuất')
  }

  const userMenu = {
    items: [
      { key: 'role', label: <Text type="secondary">Tài khoản: {user?.role === 'admin' ? 'Quản trị viên' : 'Bệnh nhân'}</Text>, disabled: true },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true }
    ],
    onClick: ({ key }) => { if (key === 'logout') handleLogout() }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{
        background: '#fff',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 68
      }}>
        {/* Brand Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/patient/dashboard')}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10
          }}>
            <HeartOutlined style={{ color: '#0050b3', fontSize: 24 }} />
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#003366', letterSpacing: 0.5, lineHeight: 1.2 }}>
              NHA KHOA ĐÀ NẴNG
            </span>
            <span style={{ fontSize: 11, color: '#666', display: 'block' }}>Chăm sóc nụ cười & Sức khỏe răng miệng</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleNavClick(key)}
          style={{ flex: 1, justifyContent: 'center', borderBottom: 0, fontSize: 14, fontWeight: 500 }}
        />

        {/* User / Auth Actions */}
        <div style={{ flexShrink: 0 }}>
          {user ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 20, background: '#f0f5ff' }}>
                <Avatar style={{ background: '#1890ff' }} icon={<UserOutlined />} />
                <Text strong style={{ color: '#003366' }}>{user.first_name} {user.last_name || user.username}</Text>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Button onClick={() => navigate('/login')} style={{ borderRadius: 6 }}>
                Đăng nhập
              </Button>
              <Button type="primary" onClick={() => navigate('/register')} style={{ borderRadius: 6, background: '#0050b3' }}>
                Đăng ký
              </Button>
            </Space>
          )}
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{ width: '100%', margin: '0 auto' }}>
        <Outlet />
      </Content>

      {/* Comprehensive Footer */}
      <Footer style={{ background: '#002140', color: '#cbd5e1', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                <HeartOutlined style={{ color: '#40a9ff', marginRight: 8 }} /> NHA KHOA ĐÀ NẴNG
              </h3>
              <p style={{ lineHeight: 1.6, fontSize: 13, color: '#94a3b8' }}>
                Hệ thống phòng khám chuyên khoa Răng Hàm Mặt kỹ thuật cao tại Đà Nẵng. Cung cấp giải pháp chỉnh nha, cấy ghép Implant và nha khoa thẩm mỹ chuẩn y khoa.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 16 }}>THỜI GIAN LÀM VIỆC</h4>
              <p style={{ margin: '6px 0', fontSize: 13 }}>• Thứ 2 - Thứ 7: <strong>8:00 - 17:00</strong></p>
              <p style={{ margin: '6px 0', fontSize: 13, paddingLeft: 12, color: '#94a3b8' }}>- Ca Sáng: 08:00 - 12:00</p>
              <p style={{ margin: '6px 0', fontSize: 13, paddingLeft: 12, color: '#94a3b8' }}>- Ca Chiều: 13:00 - 17:00</p>
              <p style={{ margin: '6px 0', fontSize: 13 }}>• Chủ Nhật: <strong>Nghỉ (Hỗ trợ đặt lịch online 24/7)</strong></p>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 16 }}>THÔNG TIN LIÊN HỆ</h4>
              <p style={{ margin: '6px 0', fontSize: 13 }}>📍 Địa chỉ: 54 Nguyễn Lương Bằng, P. Hòa Khánh Bắc, Q. Liên Chiểu, TP. Đà Nẵng</p>
              <p style={{ margin: '6px 0', fontSize: 13 }}>📞 Hotline tư vấn: <strong>0901.234.567</strong></p>
              <p style={{ margin: '6px 0', fontSize: 13 }}>💬 Zalo hỗ trợ cọc & đổi lịch: <strong>0901.234.567</strong></p>
              <p style={{ margin: '6px 0', fontSize: 13 }}>✉️ Email: info@nhakhoadanang.com</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
            Phòng khám Nha khoa Đà Nẵng © 2026. Đề tài tốt nghiệp CNTT: Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến.
          </div>
        </div>
      </Footer>

      {/* Chatbot Gemini AI nổi góc phải */}
      <ChatbotWidget />
    </Layout>
  )
}
