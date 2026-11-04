import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, CalendarOutlined, TeamOutlined,
  MedicineBoxOutlined, LogoutOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, HeartOutlined, UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/auth'
import toast from 'react-hot-toast'

const { Sider, Header, Content } = Layout
const { Text } = Typography

export default function DoctorLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/doctor/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/doctor/schedule', icon: <CalendarOutlined />, label: 'Ca làm việc' },
    { key: '/doctor/patients', icon: <TeamOutlined />, label: 'Bệnh nhân hôm nay' },
    { key: '/doctor/examination', icon: <MedicineBoxOutlined />, label: 'Khám bệnh' },
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
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#003a8c' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <HeartOutlined style={{ color: '#69b1ff', fontSize: 24 }} />
          {!collapsed && <Text style={{ color: 'white', marginLeft: 8, fontWeight: 700, fontSize: 14 }}>Bác Sĩ</Text>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}
          items={menuItems} onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, background: '#003a8c' }} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', fontSize: 18 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#1677ff' }} icon={<UserOutlined />} />
              <Text strong>BS. {user?.first_name} {user?.last_name || user?.username}</Text>
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
