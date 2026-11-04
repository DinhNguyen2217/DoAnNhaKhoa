import { useState, useEffect } from 'react'
import { Card, Table, Tag, Space, Typography, Button, DatePicker } from 'antd'
import { TeamOutlined, MedicineBoxOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAppointments } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatients()
  }, [selectedDate])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : ''
      const res = await getAppointments({ date: dateStr })
      setAppointments(res.data.results || res.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong style={{ color: '#003a8c' }}>#{id}</strong>
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
            <Text strong style={{ color: '#003a8c' }}>{name}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>SĐT: {phone}</div>
          </div>
        )
      }
    },
    {
      title: 'Dịch vụ yêu cầu',
      key: 'service',
      render: (_, r) => <Tag color="cyan">{r.service_info?.name || r.service?.name || 'Khám nha khoa'}</Tag>
    },
    {
      title: 'Ca khám',
      dataIndex: 'session',
      key: 'session',
      render: (s) => s === 'morning' ? <Tag color="orange">Sáng (8h-12h)</Tag> : <Tag color="blue">Chiều (13h-17h)</Tag>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => {
        if (r.status === 'checked_in') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã có mặt tại quầy (Chờ khám)</Tag>
        }
        if (r.status === 'in_progress') {
          return <Tag color="geekblue" icon={<ClockCircleOutlined />}>Đang khám</Tag>
        }
        if (r.status === 'completed') {
          return <Tag color="purple">Đã khám xong & Lưu bệnh án</Tag>
        }
        return <Tag color={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status] || r.status}</Tag>
      }
    },
    {
      title: 'Bệnh án',
      key: 'has_medical_record',
      render: (_, r) => (
        r.has_medical_record ? (
          <Tag color="success">✓ Đã lập bệnh án</Tag>
        ) : (
          <Tag color="warning">Chưa lập bệnh án</Tag>
        )
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<MedicineBoxOutlined />}
          onClick={() => navigate('/doctor/examination', { state: { appointmentId: r.id } })}
          style={{ background: '#003a8c' }}
        >
          {r.status === 'completed' || r.has_medical_record ? 'Xem bệnh án' : 'Khám bệnh'}
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#003a8c' }}>DANH SÁCH BỆNH NHÂN KHÁM THEO NGÀY</Title>
        <Text type="secondary">Theo dõi tiến độ khám và điều trị của các bệnh nhân trong danh sách phụ trách</Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space>
          <DatePicker
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            format="DD/MM/YYYY"
            allowClear={false}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchPatients}>Làm mới danh sách</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có bệnh nhân nào trong ngày đã chọn.' }}
        />
      </Card>
    </div>
  )
}
