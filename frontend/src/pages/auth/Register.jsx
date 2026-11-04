import { useState } from 'react'
import { Card, Form, Input, Button, Typography, Row, Col, Select, DatePicker } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../api/auth'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Option } = Select

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        username: values.username,
        password: values.password,
        confirm_password: values.confirm_password,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
        allergies: values.allergies || '',
        medical_history: values.medical_history || '',
      }
      await register(payload)
      toast.success('Đăng ký tài khoản bệnh nhân thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstErr = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
        toast.error(`${firstKey}: ${firstErr}`)
      } else {
        toast.error('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 50%, #f6ffed 100%)',
      padding: '32px 16px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 620,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          borderRadius: 16
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <HeartOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
          <Title level={3} style={{ margin: 0, color: '#003366' }}>ĐĂNG KÝ TÀI KHOẢN BỆNH NHÂN</Title>
          <Text type="secondary">Tạo tài khoản để đặt lịch khám và theo dõi hồ sơ sức khỏe răng miệng</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} size="middle">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="first_name" label="Họ và tên đệm" rules={[{ required: true, message: 'Nhập họ đệm!' }]}>
                <Input placeholder="Ví dụ: Nguyễn Văn" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="last_name" label="Tên" rules={[{ required: true, message: 'Nhập tên!' }]}>
                <Input placeholder="Ví dụ: An" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập username!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="confirm_password"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Xác nhận lại mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve()
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="gender" label="Giới tính" initialValue="M">
                <Select>
                  <Option value="M">Nam</Option>
                  <Option value="F">Nữ</Option>
                  <Option value="O">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="date_of_birth" label="Ngày sinh">
                <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày sinh" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="email" label="Email">
                <Input prefix={<MailOutlined />} placeholder="email@gmail.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="allergies" label="Tiền sử dị ứng thuốc (nếu có)">
            <Input placeholder="Ví dụ: Dị ứng Penicillin, Aspirin..." />
          </Form.Item>

          <Form.Item style={{ marginTop: 8, marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ borderRadius: 8 }}>
              Hoàn tất đăng ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>Đã có tài khoản? </Text>
            <Link to="/login" style={{ fontWeight: 600 }}>Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
