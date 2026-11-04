import { useState } from 'react'
import { Card, Form, Input, Button, Typography, Alert, Divider, Space, Tag } from 'antd'
import { UserOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await login(values)
      loginUser(res.data)
      toast.success(`Chào mừng ${res.data.user.first_name || res.data.user.username}!`)

      // Redirect based on role
      const role = res.data.user.role
      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'receptionist') navigate('/receptionist/dashboard')
      else if (role === 'doctor') navigate('/doctor/dashboard')
      else navigate('/patient/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillAccount = (username, password) => {
    form.setFieldsValue({ username, password })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 50%, #f6ffed 100%)',
      padding: 16
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          borderRadius: 16,
          overflow: 'hidden'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#e6f7ff',
            marginBottom: 12
          }}>
            <HeartOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#003366' }}>PHÒNG KHÁM NHA KHOA</Title>
          <Text type="secondary">Hệ thống quản lý và đặt lịch khám trực tuyến</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, borderRadius: 8 }}>
              Đăng nhập hệ thống
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Text>Chưa có tài khoản bệnh nhân? </Text>
          <Link to="/register" style={{ fontWeight: 600 }}>Đăng ký ngay</Link>
        </div>

        <Divider style={{ margin: '12px 0', fontSize: 12 }}>Tài khoản thử nghiệm (Click để nạp nhanh)</Divider>
        <Space direction="vertical" style={{ width: '100%' }} size={4}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: '#f5f5f5', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
               onClick={() => fillAccount('admin', 'admin123')}>
            <Tag color="red">Admin</Tag>
            <code>admin / admin123</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: '#f5f5f5', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
               onClick={() => fillAccount('letan1', 'letan123')}>
            <Tag color="green">Lễ tân</Tag>
            <code>letan1 / letan123</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: '#f5f5f5', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
               onClick={() => fillAccount('bsminh', 'doctor123')}>
            <Tag color="blue">Bác sĩ</Tag>
            <code>bsminh / doctor123</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: '#f5f5f5', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
               onClick={() => fillAccount('benhnhan1', 'patient123')}>
            <Tag color="orange">Bệnh nhân</Tag>
            <code>benhnhan1 / patient123</code>
          </div>
        </Space>
      </Card>
    </div>
  )
}
