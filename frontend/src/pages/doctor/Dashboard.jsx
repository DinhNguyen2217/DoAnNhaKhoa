import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, Space, Spin, Badge } from 'antd'
import {
  CalendarOutlined, TeamOutlined, MedicineBoxOutlined,
  CheckCircleOutlined, ArrowRightOutlined, ClockCircleOutlined,
  FileDoneOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAppointments } from '../../api/appointments'
import { getMySchedules } from '../../api/schedules'
import { useAuth } from '../../context/AuthContext'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    setLoading(true)
    try {
      const todayStr = dayjs().format('YYYY-MM-DD')
      const [resApp, resSch] = await Promise.all([
        getAppointments({ date: todayStr }),
        getMySchedules()
      ])
      setAppointments(resApp.data.results || resApp.data || [])
      setSchedules(resSch.data.results || resSch.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  // Bệnh nhân đã tiếp nhận tại quầy hoặc đang khám
  const waitingPatients = appointments.filter(a => a.status === 'checked_in' || a.status === 'in_progress' || a.status === 'arrived')
  // Bệnh nhân đã hoàn thành khám
  const completedToday = appointments.filter(a => a.status === 'completed')
  // Tổng bệnh nhân hẹn hôm nay
  const totalToday = appointments.filter(a => a.status !== 'cancelled')

  // Ca trực hôm nay
  const todayStr = dayjs().format('YYYY-MM-DD')
  const todaySchedule = schedules.find(s => s.date === todayStr)

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
            <Text strong>{name}</Text>
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
      title: 'Trạng thái khám',
      key: 'status',
      render: (_, r) => {
        if (r.status === 'checked_in') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã có mặt tại quầy (Chờ khám)</Tag>
        }
        if (r.status === 'in_progress') {
          return <Tag color="geekblue" icon={<ClockCircleOutlined />}>Đang trong phòng khám</Tag>
        }
        if (r.status === 'completed') {
          return <Tag color="purple" icon={<FileDoneOutlined />}>Đã khám xong & Lưu bệnh án</Tag>
        }
        return <Tag color={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status] || r.status}</Tag>
      }
    },
    {
      title: 'Hồ sơ bệnh án',
      key: 'medical_record',
      render: (_, r) => (
        r.has_medical_record ? (
          <Tag color="success">✓ Đã lập bệnh án</Tag>
        ) : (
          <Tag color="warning">Chưa lập</Tag>
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
          {r.status === 'completed' ? 'Xem bệnh án' : 'Vào khám'}
        </Button>
      )
    }
  ]

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#003a8c' }}>
          CHÀO MỪNG BÁC SĨ {user?.first_name?.toUpperCase()} {user?.last_name?.toUpperCase() || ''}
        </Title>
        <Text type="secondary">Nắm bắt tình hình ca trực, danh sách người bệnh và thực hiện khám bệnh trong ngày</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #1677ff', background: '#f0f5ff' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#003a8c' }}>Ca trực hôm nay</span>}
              value={todaySchedule ? (todaySchedule.session === 'morning' ? 'Ca Sáng (8h-12h)' : todaySchedule.session === 'afternoon' ? 'Ca Chiều (13h-17h)' : 'Cả Ngày (8h-17h)') : 'Nghỉ trực'}
              prefix={<CalendarOutlined style={{ color: '#1677ff', marginRight: 8 }} />}
              valueStyle={{ fontSize: 16, color: '#003a8c', fontWeight: 700 }}
            />
            <Button type="link" style={{ padding: 0, marginTop: 8 }} onClick={() => navigate('/doctor/schedule')}>
              Quản lý lịch trực <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16', background: '#fff7e6' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#873800' }}>Tổng bệnh nhân hôm nay</span>}
              value={totalToday.length}
              suffix="/ 20 tối đa"
              prefix={<TeamOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#d46b08', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              Theo dõi hạn ngạch 10 BN/ca
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a', background: '#f6ffed' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#135200' }}>Đang chờ tại quầy lễ tân</span>}
              value={waitingPatients.length}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
            <Button type="link" style={{ padding: 0, marginTop: 8, color: '#389e0d' }} onClick={() => navigate('/doctor/examination')}>
              Mở phòng khám ngay <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #722ed1', background: '#f9f0ff' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#531dab' }}>Đã hoàn tất & Lưu bệnh án</span>}
              value={completedToday.length}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              Lễ tân đã nhận dữ liệu tính tiền
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Danh sách bệnh nhân đăng ký khám trong ngày"
        bordered={false}
        style={{ marginTop: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        extra={<Button onClick={fetchDoctorData}>Làm mới</Button>}
      >
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'Chưa có bệnh nhân nào trong danh sách hôm nay.' }}
        />
      </Card>
    </div>
  )
}
