import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, Space, Spin } from 'antd'
import {
  CalendarOutlined, CheckCircleOutlined, UserAddOutlined,
  ClockCircleOutlined, ArrowRightOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAppointments } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTodayAppointments()
  }, [])

  const fetchTodayAppointments = async () => {
    try {
      const todayStr = dayjs().format('YYYY-MM-DD')
      const res = await getAppointments({ date: todayStr })
      setAppointments(res.data.results || res.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const pendingDepositCount = appointments.filter(a => a.status === 'pending_deposit' || a.status === 'deposit_paid').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const arrivedCount = appointments.filter(a => a.status === 'arrived').length

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
      render: (_, r) => (
        <div>
          <Text strong>{r.patient?.user?.first_name} {r.patient?.user?.last_name || r.patient?.user?.username}</Text>
          <div style={{ fontSize: 12, color: '#888' }}>{r.patient?.user?.phone || '-'}</div>
        </div>
      )
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_, r) => `BS. ${r.doctor?.user?.first_name || ''} ${r.doctor?.user?.last_name || ''}`
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'service',
    },
    {
      title: 'Ca khám',
      dataIndex: 'session',
      key: 'session',
      render: (s) => s === 'morning' ? <Tag color="orange">Sáng (8h-12h)</Tag> : <Tag color="blue">Chiều (13h-17h)</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    }
  ]

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f5132' }}>BÀN TIẾP ĐÓN & ĐIỀU PHỐI LỄ TÂN</Title>
        <Text type="secondary">Tổng quan lịch hẹn khám, kiểm tra tiền cọc và tiếp nhận bệnh nhân hôm nay</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16' }}>
            <Statistic
              title="Chờ xác nhận cọc"
              value={pendingDepositCount}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/receptionist/deposit')}
            >
              Xem danh sách cọc <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
            <Statistic
              title="Lịch đã xác nhận hôm nay"
              value={confirmedCount}
              prefix={<CalendarOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/receptionist/reception')}
            >
              Tiếp nhận bệnh nhân <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
            <Statistic
              title="Bệnh nhân đã đến quầy"
              value={arrivedCount}
              prefix={<UserAddOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginTop: 8 }}
              onClick={() => navigate('/receptionist/invoices')}
            >
              Xem viện phí & hóa đơn <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
      </Row>

      <Card
        title="Danh sách bệnh nhân hẹn khám trong ngày"
        bordered={false}
        style={{ marginTop: 24, borderRadius: 12 }}
        extra={<Button onClick={fetchTodayAppointments}>Làm mới</Button>}
      >
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Hôm nay chưa có lịch hẹn nào.' }}
        />
      </Card>
    </div>
  )
}
