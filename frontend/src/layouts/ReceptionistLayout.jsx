import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, CalendarOutlined, CheckCircleOutlined,
  UserAddOutlined, FileTextOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, HeartOutlined, UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/auth'
import toast from 'react-hot-toast'

const { Sider, Header, Content } = Layout
const { Text } = Typography

export default function ReceptionistLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/receptionist/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/receptionist/appointments', icon: <CalendarOutlined />, label: 'Lịch hẹn' },
    { key: '/receptionist/deposit', icon: <CheckCircleOutlined />, label: 'Xác nhận cọc' },
    { key: '/receptionist/reception', icon: <UserAddOutlined />, label: 'Tiếp nhận' },
    { key: '/receptionist/invoices', icon: <FileTextOutlined />, label: 'Hóa đơn' },
  ]

  const handleLogout = async () => {
    try { await logout(localStorage.getItem('refresh_token')) } catch {}
    logoutUser(); navigate('/login'); toast.success('Đã đăng xuất')
  }

  const userMenu = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true }],
    onClick: ({ key }) => { if (key === 'logout') handleLogout() }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#0f5132' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <HeartOutlined style={{ color: '#52c41a', fontSize: 24 }} />
          {!collapsed && <Text style={{ color: 'white', marginLeft: 8, fontWeight: 700, fontSize: 14 }}>Lễ Tân</Text>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}
          items={menuItems} onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, background: '#0f5132' }} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', fontSize: 18 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#52c41a' }} icon={<UserOutlined />} />
              <Text strong>{user?.first_name} {user?.last_name || user?.username}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
