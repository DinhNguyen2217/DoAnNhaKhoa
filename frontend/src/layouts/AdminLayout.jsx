import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, UserOutlined, MedicineBoxOutlined, TeamOutlined,
  ToolOutlined, BarChartOutlined, LogoutOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, HeartOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/auth'
import toast from 'react-hot-toast'

const { Sider, Header, Content } = Layout
const { Text } = Typography

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/admin/accounts', icon: <UserOutlined />, label: 'Tài khoản' },
    { key: '/admin/doctors', icon: <MedicineBoxOutlined />, label: 'Bác sĩ' },
    { key: '/admin/patients', icon: <TeamOutlined />, label: 'Bệnh nhân' },
    { key: '/admin/services', icon: <ToolOutlined />, label: 'Dịch vụ' },
    { key: '/admin/statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
  ]

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await logout(refresh)
    } catch {}
    logoutUser()
    navigate('/login')
    toast.success('Đã đăng xuất')
  }

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }) => { if (key === 'logout') handleLogout() }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#001529' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <HeartOutlined style={{ color: '#1890ff', fontSize: 24 }} />
          {!collapsed && <Text style={{ color: 'white', marginLeft: 8, fontWeight: 700, fontSize: 14 }}>Nha Khoa</Text>}
        </div>
        <Menu
          theme="dark" mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', fontSize: 18 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#1890ff' }} icon={<UserOutlined />} />
              <Text strong>{user?.first_name} {user?.last_name || user?.username}</Text>
              <Badge color="red" text="Admin" />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: '#f0f2f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
