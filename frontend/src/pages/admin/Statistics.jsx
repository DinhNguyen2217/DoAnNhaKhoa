import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Typography, DatePicker, Button, Space, Tag, Spin } from 'antd'
import { DollarOutlined, CalendarOutlined, TeamOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons'
import { getRevenueStats, getSalaryStats, getAppointmentStats } from '../../api/stats'
import { formatMoney } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function Statistics() {
  const [revenueData, setRevenueData] = useState(null)
  const [salaryData, setSalaryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resRev, resSal] = await Promise.all([
        getRevenueStats(),
        getSalaryStats()
      ])
      setRevenueData(resRev.data)
      setSalaryData(resSal.data || [])
    } catch {
      toast.error('Không thể tải dữ liệu báo cáo thống kê.')
    } finally {
      setLoading(false)
    }
  }

  const salaryColumns = [
    {
      title: 'Bác sĩ',
      key: 'doctor',
      render: (_, r) => <strong>BS. {r.doctor_name}</strong>
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (s) => <Tag color="blue">{s}</Tag>
    },
    {
      title: 'Số ca làm việc (đã duyệt)',
      dataIndex: 'total_shifts',
      key: 'shifts',
      render: (s) => <Tag color="green" style={{ fontSize: 13, fontWeight: 600 }}>{s} ca</Tag>
    },
    {
      title: 'Đơn giá ca trực',
      dataIndex: 'rate_per_shift',
      key: 'rate',
      render: (r) => formatMoney(r || 300000)
    },
    {
      title: 'Lương ca trực ước tính',
      key: 'estimated_salary',
      render: (_, r) => (
        <Text strong style={{ color: '#eb2f96', fontSize: 14 }}>
          {formatMoney((r.total_shifts || 0) * (r.rate_per_shift || 300000))}
        </Text>
      )
    }
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003366' }}>BÁO CÁO THỐNG KÊ DOANH THU & CA TRỰC</Title>
          <Text type="secondary">Tổng hợp chỉ số tài chính phòng khám và số ca làm việc hỗ trợ hạch toán lương bác sĩ</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>Làm mới</Button>
      </div>

      {/* Thẻ thống kê tài chính */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng doanh thu thực tế"
              value={formatMoney(revenueData?.total_revenue || 0)}
              prefix={<DollarOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng tiền cọc đã thu (100k/lượt)"
              value={formatMoney(revenueData?.total_deposits || 0)}
              prefix={<CalendarOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Số hóa đơn đã thanh toán"
              value={revenueData?.paid_invoices_count || 0}
              prefix={<BarChartOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng thống kê ca làm và hỗ trợ tính lương bác sĩ */}
      <Card
        title="Bảng thống kê ca làm việc & Dự toán lương bác sĩ"
        bordered={false}
        style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <Table
          columns={salaryColumns}
          dataSource={salaryData}
          rowKey="doctor_id"
          pagination={false}
          locale={{ emptyText: 'Chưa có dữ liệu ca trực được ghi nhận.' }}
        />
      </Card>
    </div>
  )
}
