import { useState, useEffect } from 'react'
import { Table, Card, Input, Space, Tag, Typography } from 'antd'
import { TeamOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getPatients } from '../../api/patients'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const res = await getPatients({ search })
      setPatients(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách bệnh nhân.')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>BN#{id}</Text>
    },
    {
      title: 'Họ và tên',
      key: 'name',
      render: (_, r) => <Text strong style={{ color: '#003366' }}>{r.user?.first_name} {r.user?.last_name || r.user?.username}</Text>
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['user', 'phone'],
      key: 'phone',
      render: (p) => p || '-'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (g) => g === 'M' ? <Tag color="blue">Nam</Tag> : (g === 'F' ? <Tag color="magenta">Nữ</Tag> : <Tag>Khác</Tag>)
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'date_of_birth',
      key: 'dob',
      render: (d) => formatDate(d)
    },
    {
      title: 'Tiền sử dị ứng',
      dataIndex: 'allergies',
      key: 'allergies',
      render: (a) => a ? <Tag color="red">{a}</Tag> : <Text type="secondary">Không có</Text>
    },
    {
      title: 'Ngày tạo hồ sơ',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (d) => formatDate(d)
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#003366' }}>QUẢN LÝ DANH SÁCH BỆNH NHÂN</Title>
        <Text type="secondary">Theo dõi hồ sơ định danh, tiền sử bệnh án và dị ứng của bệnh nhân</Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space>
          <Input
            placeholder="Tìm theo tên bệnh nhân, SĐT..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchPatients}
            style={{ width: 300 }}
          />
          <Button icon={<SearchOutlined />} onClick={fetchPatients}>Tìm kiếm</Button>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); fetchPatients() }}>Làm mới</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
