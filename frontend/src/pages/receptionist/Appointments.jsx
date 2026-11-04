import { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Select, Space, Tag, Typography, Popconfirm, DatePicker } from 'antd'
import { CalendarOutlined, SearchOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { getAppointments, cancelAppointment } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Option } = Select

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (search) params.search = search
      const res = await getAppointments(params)
      setAppointments(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách lịch hẹn.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id, { cancellation_reason: 'Khách hàng liên hệ đổi/hủy qua kênh Zalo' })
      toast.success('Đã hủy lịch hẹn theo yêu cầu!')
      fetchAppointments()
    } catch {
      toast.error('Không thể hủy lịch.')
    }
  }

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong>#{id}</strong>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => {
        const pInfo = r.patient_info || r.patient
        const name = pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`.trim() || pInfo?.user?.username || 'Bệnh nhân'
        const phone = pInfo?.user?.phone || '-'
        return (
          <div>
            <Text strong>{name}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>SĐT: {phone}</div>
          </div>
        )
      }
    },
    {
      title: 'Bác sĩ',
      key: 'doctor',
      render: (_, r) => {
        const dInfo = r.doctor_info || r.doctor
        return `BS. ${dInfo?.user?.first_name || ''} ${dInfo?.user?.last_name || ''}`.trim() || 'Bác sĩ'
      }
    },
    {
      title: 'Dịch vụ',
      key: 'service',
      render: (_, r) => r.service_info?.name || r.service?.name || '-'
    },
    {
      title: 'Ngày hẹn & Ca',
      key: 'date_session',
      render: (_, r) => (
        <div>
          <div>{formatDate(r.appointment_date)}</div>
          <Tag color={r.session === 'morning' ? 'orange' : 'blue'}>
            {r.session === 'morning' ? 'Sáng' : 'Chiều'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        r.status !== 'cancelled' && r.status !== 'completed' && (
          <Popconfirm title="Xác nhận hủy lịch hẹn này?" onConfirm={() => handleCancel(r.id)}>
            <Button size="small" danger icon={<CloseCircleOutlined />}>
              Hủy lịch
            </Button>
          </Popconfirm>
        )
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#0f5132' }}>QUẢN LÝ TẤT CẢ LỊCH HẸN KHÁM</Title>
        <Text type="secondary">Theo dõi, tìm kiếm và điều phối lịch hẹn của tất cả bệnh nhân</Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo tên bệnh nhân, SĐT..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchAppointments}
            style={{ width: 280 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || '')}
            style={{ width: 200 }}
          >
            <Option value="pending_deposit">Chờ đặt cọc</Option>
            <Option value="deposit_paid">Đã đặt cọc</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="arrived">Đã đến phòng khám</Option>
            <Option value="completed">Đã hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="no_show">Vắng mặt (No-show)</Option>
          </Select>
          <Button icon={<SearchOutlined />} onClick={fetchAppointments}>Tìm kiếm</Button>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setStatusFilter(''); fetchAppointments() }}>Làm mới</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
