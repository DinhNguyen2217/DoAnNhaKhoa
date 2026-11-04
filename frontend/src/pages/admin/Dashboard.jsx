import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin, Space } from 'antd'
import {
  UserOutlined, MedicineBoxOutlined, CalendarOutlined,
  DollarCircleOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import { getDashboardStats } from '../../api/stats'
import { formatMoney, formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats()
      setData(res.data)
    } catch {
      toast.error('Không thể tải dữ liệu thống kê tổng quan.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
  }

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => r.patient?.user?.first_name + ' ' + (r.patient?.user?.last_name || '')
    },
    {
      title: 'Bác sĩ',
      key: 'doctor',
      render: (_, r) => 'BS. ' + (r.doctor?.user?.first_name || '') + ' ' + (r.doctor?.user?.last_name || '')
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'service',
    },
    {
      title: 'Ngày khám',
      dataIndex: 'appointment_date',
      key: 'date',
      render: (d) => formatDate(d)
    },
    {
      title: 'Ca',
      dataIndex: 'session',
      key: 'session',
      render: (s) => s === 'morning' ? <Tag color="orange">Sáng</Tag> : <Tag color="blue">Chiều</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#003366' }}>TỔNG QUAN PHÒNG KHÁM</Title>
        <Text type="secondary">Theo dõi hoạt động vận hành, bệnh nhân và doanh thu thời gian thực</Text>
      </div>

      {/* 4 thẻ thống kê số lượng */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng lượt khám"
              value={data?.total_appointments || 0}
              prefix={<CalendarOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Hôm nay"
              value={data?.today_appointments || 0}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng bệnh nhân"
              value={data?.total_patients || 0}
              prefix={<UserOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng doanh thu"
              value={formatMoney(data?.total_revenue || 0)}
              prefix={<DollarCircleOutlined style={{ color: '#eb2f96', marginRight: 8 }} />}
              valueStyle={{ color: '#eb2f96', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng lịch hẹn gần đây */}
      <Card
        title="Lịch hẹn gần đây nhất"
        bordered={false}
        style={{ marginTop: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <Table
          columns={columns}
          dataSource={data?.recent_appointments || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Chưa có lịch hẹn nào gần đây.' }}
        />
      </Card>
    </div>
  )
}
