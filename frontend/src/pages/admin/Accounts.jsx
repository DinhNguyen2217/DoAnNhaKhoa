import { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Select, Space, Tag, Modal, Form, Switch, Typography, Popconfirm } from 'antd'
import { UserAddOutlined, SearchOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons'
import { getUsers, createUser, toggleActive, resetPassword } from '../../api/users'
import { ROLE_LABELS, ROLE_COLORS, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title } = Typography
const { Option } = Select

export default function Accounts() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form] = Form.useForm()
  const [resetForm] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (roleFilter) params.role = roleFilter
      if (search) params.search = search
      const res = await getUsers(params)
      setUsers(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values) => {
    try {
      await createUser(values)
      toast.success('Tạo tài khoản người dùng thành công!')
      setIsModalOpen(false)
      form.resetFields()
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || 'Lỗi khi tạo tài khoản.')
    }
  }

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id)
      toast.success('Đã cập nhật trạng thái tài khoản!')
      fetchUsers()
    } catch {
      toast.error('Không thể cập nhật trạng thái.')
    }
  }

  const handleResetPassword = async (values) => {
    try {
      await resetPassword(selectedUser.id, { new_password: values.new_password })
      toast.success(`Đã đổi mật khẩu cho ${selectedUser.username}!`)
      setResetModalOpen(false)
      resetForm.resetFields()
    } catch {
      toast.error('Lỗi khi đặt lại mật khẩu.')
    }
  }

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (u) => <strong>{u}</strong>
    },
    {
      title: 'Họ và tên',
      key: 'fullname',
      render: (_, r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || '-'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role] || role}</Tag>
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (p) => p || '-'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (e) => e || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active, record) => (
        <Popconfirm
          title={active ? 'Vô hiệu hóa tài khoản này?' : 'Kích hoạt lại tài khoản?'}
          onConfirm={() => handleToggleActive(record.id)}
        >
          <Switch checked={active} checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
        </Popconfirm>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          icon={<LockOutlined />}
          onClick={() => { setSelectedUser(record); setResetModalOpen(true) }}
        >
          Đổi mật khẩu
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#003366' }}>QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm tài khoản
        </Button>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo username, tên, SĐT..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchUsers}
            style={{ width: 280 }}
          />
          <Select
            placeholder="Lọc theo vai trò"
            allowClear
            value={roleFilter || undefined}
            onChange={(v) => setRoleFilter(v || '')}
            style={{ width: 180 }}
          >
            <Option value="admin">Quản trị viên (Admin)</Option>
            <Option value="receptionist">Lễ tân</Option>
            <Option value="doctor">Bác sĩ</Option>
            <Option value="patient">Bệnh nhân</Option>
          </Select>
          <Button icon={<SearchOutlined />} onClick={fetchUsers}>Tìm kiếm</Button>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setRoleFilter(''); fetchUsers(); }}>Làm mới</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal tạo tài khoản */}
      <Modal
        title="Thêm tài khoản mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập tên đăng nhập!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự!' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue="receptionist" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Quản trị viên (Admin)</Option>
              <Option value="receptionist">Lễ tân</Option>
              <Option value="doctor">Bác sĩ</Option>
              <Option value="patient">Bệnh nhân</Option>
            </Select>
          </Form.Item>
          <Form.Item name="first_name" label="Họ và tên đệm">
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Tên">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu tài khoản</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal
        title={`Đổi mật khẩu cho: ${selectedUser?.username}`}
        open={resetModalOpen}
        onCancel={() => setResetModalOpen(false)}
        footer={null}
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetPassword}>
          <Form.Item
            name="new_password"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setResetModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Xác nhận đổi</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
