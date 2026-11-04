import { useState, useEffect } from 'react'
import { Table, Card, Input, Space, Tag, Typography, Button, message, Modal, Descriptions } from 'antd'
import { TeamOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { getPatients } from '../../api/patients'
import { formatDate } from '../../utils/helpers'

const { Title, Text } = Typography

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const res = await getPatients({ search })
      setPatients(res.data?.results || res.data || [])
    } catch {
      message.error('Không thể tải danh sách bệnh nhân.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (patient) => {
    setSelectedPatient(patient)
    setModalVisible(true)
  }

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <Text strong>BN#{id}</Text>
    },
    {
      title: 'Họ và tên',
      key: 'name',
      render: (_, r) => (
        <div>
          <Text strong style={{ color: '#003366', fontSize: 14 }}>
            {r.user?.first_name} {r.user?.last_name || r.user?.username}
          </Text>
          {r.user?.email && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{r.user.email}</div>
          )}
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['user', 'phone'],
      key: 'phone',
      render: (p) => p ? <Text copyable>{p}</Text> : '-'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 90,
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
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, r) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(r)}
        >
          Chi tiết
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#003366' }}>QUẢN LÝ DANH SÁCH BỆNH NHÂN</Title>
        <Text type="secondary">Theo dõi hồ sơ định danh, tiền sử bệnh án và dị ứng của bệnh nhân</Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo tên bệnh nhân, SĐT, email..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchPatients}
            style={{ width: 320 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchPatients}>Tìm kiếm</Button>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); fetchPatients() }}>Làm mới</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng cộng ${total} bệnh nhân` }}
        />
      </Card>

      {/* Modal chi tiết bệnh nhân */}
      <Modal
        title={`Chi tiết Hồ sơ Bệnh nhân: ${selectedPatient?.user?.first_name || ''} ${selectedPatient?.user?.last_name || selectedPatient?.user?.username || ''}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={650}
      >
        {selectedPatient && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Mã bệnh nhân">BN#{selectedPatient.id}</Descriptions.Item>
            <Descriptions.Item label="Tên tài khoản">{selectedPatient.user?.username}</Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              <strong style={{ color: '#003366' }}>
                {selectedPatient.user?.first_name} {selectedPatient.user?.last_name}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedPatient.gender === 'M' ? 'Nam' : (selectedPatient.gender === 'F' ? 'Nữ' : 'Khác')}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedPatient.user?.phone || 'Chưa cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedPatient.user?.email || 'Chưa cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{formatDate(selectedPatient.date_of_birth)}</Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký">{formatDate(selectedPatient.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              {selectedPatient.address || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền sử dị ứng" span={2}>
              {selectedPatient.allergies ? (
                <Tag color="red">{selectedPatient.allergies}</Tag>
              ) : (
                <Text type="secondary">Không có ghi nhận dị ứng</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền sử bệnh lý" span={2}>
              {selectedPatient.medical_history || <Text type="secondary">Chưa có ghi chép bệnh nền</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Người liên hệ khẩn cấp" span={2}>
              {selectedPatient.emergency_contact_name ? (
                <span>{selectedPatient.emergency_contact_name} - SĐT: {selectedPatient.emergency_contact_phone || '-'}</span>
              ) : (
                <Text type="secondary">Chưa cập nhật</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}