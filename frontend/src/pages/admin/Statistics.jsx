import { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, Table, Typography, DatePicker, Button,
  Space, Tag, Spin, Progress, Tooltip, message, Select, Divider
} from 'antd'
import {
  DollarOutlined, CalendarOutlined, TeamOutlined, BarChartOutlined,
  ReloadOutlined, RiseOutlined, TrophyOutlined, CreditCardOutlined,
  MedicineBoxOutlined, CheckCircleOutlined, WalletOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getClinicAnalytics } from '../../api/stats'
import { formatMoney } from '../../utils/helpers'

const { Title, Text, Paragraph } = Typography

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedYear, selectedMonth])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await getClinicAnalytics({ year: selectedYear, month: selectedMonth })
      setAnalyticsData(res.data)
    } catch {
      message.error('Không thể tải dữ liệu báo cáo thống kê phân tích.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !analyticsData) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#003366', fontWeight: 500 }}>
          Đang tổng hợp các chỉ số doanh thu và biểu đồ phòng khám...
        </div>
      </div>
    )
  }

  const summary = analyticsData?.summary || {}
  const monthlyRevenue = analyticsData?.monthly_revenue || []
  const dailyRevenue = analyticsData?.daily_revenue || []
  const serviceStats = analyticsData?.service_stats || []
  const doctorStats = analyticsData?.doctor_stats || []
  const paymentStats = analyticsData?.payment_stats || []

  // Tìm giá trị doanh thu cao nhất tháng để tính tỷ lệ biểu đồ cột
  const maxMonthRev = Math.max(...monthlyRevenue.map((m) => m.revenue), 1)
  const maxDailyRev = Math.max(...dailyRevenue.map((d) => d.revenue), 1)

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #005599 100%)',
        color: '#fff',
        padding: '22px 28px',
        borderRadius: 14,
        marginBottom: 20,
        boxShadow: '0 4px 14px rgba(0, 51, 102, 0.15)'
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              BÁO CÁO THỐNG KÊ & BIỂU ĐỒ DOANH THU PHÒNG KHÁM
            </Title>
            <Paragraph style={{ color: '#e0edff', margin: '6px 0 0', fontSize: 14 }}>
              Đánh giá toàn diện bức tranh tài chính: Doanh thu theo tháng/ngày, cơ cấu dịch vụ và hiệu suất bác sĩ.
            </Paragraph>
          </Col>
          <Col>
            <Space wrap>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 120 }}
                options={[
                  { value: 2025, label: 'Năm 2025' },
                  { value: 2026, label: 'Năm 2026' },
                  { value: 2027, label: 'Năm 2027' }
                ]}
              />
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 130 }}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: `Tháng ${i + 1}`
                }))}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchAnalytics} type="primary" ghost>
                Cập nhật
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 4 Thẻ KPI Tài chính hàng đầu */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderTop: '4px solid #16a34a' }}>
            <Statistic
              title="Tổng doanh thu năm"
              value={formatMoney(summary.year_revenue || 0)}
              prefix={<RiseOutlined style={{ color: '#16a34a', marginRight: 8 }} />}
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Cả năm {selectedYear}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderTop: '4px solid #0284c7' }}>
            <Statistic
              title={`Doanh thu Tháng ${selectedMonth}/${selectedYear}`}
              value={formatMoney(summary.month_revenue || 0)}
              prefix={<DollarOutlined style={{ color: '#0284c7', marginRight: 8 }} />}
              valueStyle={{ color: '#0284c7', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Tháng đang chọn
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderTop: '4px solid #722ed1' }}>
            <Statistic
              title="Tiền cọc trực tuyến đã thu"
              value={formatMoney(summary.total_deposit || 0)}
              prefix={<CalendarOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              100.000 VNĐ / lượt giữ hẹn
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderTop: '4px solid #fa8c16' }}>
            <Statistic
              title="Hóa đơn đã quyết toán"
              value={summary.paid_invoices_count || 0}
              prefix={<CheckCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              suffix="HĐ"
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Khám & thanh toán thành công
            </div>
          </Card>
        </Col>
      </Row>

      {/* BIỂU ĐỒ 1: CỘT DOANH THU 12 THÁNG TRONG NĂM */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#003366', fontSize: 18 }} />
            <span style={{ color: '#003366', fontSize: 16, fontWeight: 700 }}>
              Biểu đồ Doanh thu 12 Tháng trong năm {selectedYear}
            </span>
          </div>
        }
        style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <div style={{ padding: '10px 0 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 220,
            padding: '0 10px',
            borderBottom: '2px solid #e2e8f0',
            gap: 12
          }}>
            {monthlyRevenue.map((item) => {
              const heightPercent = maxMonthRev > 0 ? Math.max(10, Math.round((item.revenue / maxMonthRev) * 100)) : 10
              const isSelected = item.month_num === selectedMonth

              return (
                <Tooltip
                  key={item.month}
                  title={
                    <div style={{ padding: 4 }}>
                      <div><strong>Tháng {item.month_num}/{selectedYear}</strong></div>
                      <div>Doanh thu: <strong>{formatMoney(item.revenue)}</strong></div>
                      <div>Tiền cọc: {formatMoney(item.deposit)}</div>
                      <div>Số lượt HĐ: {item.invoice_count} hóa đơn</div>
                    </div>
                  }
                >
                  <div
                    onClick={() => setSelectedMonth(item.month_num)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer'
                    }}
                  >
                    {item.revenue > 0 && (
                      <div style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: isSelected ? '#003366' : '#64748b',
                        marginBottom: 4,
                        textAlign: 'center',
                        whiteSpace: 'nowrap'
                      }}>
                        {(item.revenue / 1000000).toFixed(1)}M
                      </div>
                    )}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 42,
                        height: `${item.revenue > 0 ? heightPercent : 6}%`,
                        background: isSelected
                          ? 'linear-gradient(180deg, #1890ff 0%, #003366 100%)'
                          : (item.revenue > 0 ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' : '#e2e8f0'),
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                        boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.5)' : 'none'
                      }}
                    />
                    <div style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#003366' : '#64748b'
                    }}>
                      {item.month}
                    </div>
                  </div>
                </Tooltip>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14, fontSize: 13, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: '#0284c7', borderRadius: 2 }} /> Doanh thu tháng
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: '#003366', borderRadius: 2 }} /> Tháng đang chọn (T{selectedMonth})
            </span>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* BIỂU ĐỒ 2: CƠ CẤU DOANH THU THEO DỊCH VỤ NHA KHOA */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MedicineBoxOutlined style={{ color: '#003366', fontSize: 18 }} />
                <span style={{ color: '#003366', fontSize: 16, fontWeight: 700 }}>
                  Cơ cấu Doanh thu theo Dịch vụ Nha khoa
                </span>
              </div>
            }
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            {serviceStats.length === 0 ? (
              <Paragraph type="secondary" style={{ textAlign: 'center', padding: 30 }}>
                Chưa có dữ liệu dịch vụ đã thanh toán.
              </Paragraph>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {serviceStats.map((srv, idx) => {
                  const colors = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96']
                  const strokeColor = colors[idx % colors.length]

                  return (
                    <div key={srv.id || idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: '#003366' }}>
                          {idx + 1}. {srv.service_name} ({srv.count} lượt)
                        </span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          {formatMoney(srv.revenue)} ({srv.percent}%)
                        </span>
                      </div>
                      <Progress
                        percent={srv.percent}
                        showInfo={false}
                        strokeColor={strokeColor}
                        size="small"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* BIỂU ĐỒ 3: HIỆU SUẤT & DOANH THU THEO BÁC SĨ */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: '#d97706', fontSize: 18 }} />
                <span style={{ color: '#003366', fontSize: 16, fontWeight: 700 }}>
                  Hiệu suất & Doanh thu theo Bác sĩ
                </span>
              </div>
            }
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <Table
              size="small"
              pagination={false}
              dataSource={doctorStats}
              rowKey="doctor_id"
              columns={[
                {
                  title: 'Hạng',
                  key: 'rank',
                  width: 60,
                  render: (_, __, index) => {
                    if (index === 0) return <Tag color="gold">#1</Tag>
                    if (index === 1) return <Tag color="silver">#2</Tag>
                    if (index === 2) return <Tag color="orange">#3</Tag>
                    return `#${index + 1}`
                  }
                },
                {
                  title: 'Bác sĩ',
                  key: 'name',
                  render: (_, r) => (
                    <div>
                      <strong style={{ color: '#003366' }}>BS. {r.doctor_name}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{r.specialty}</div>
                    </div>
                  )
                },
                {
                  title: 'Ca hoàn thành',
                  dataIndex: 'completed_appointments',
                  key: 'apps',
                  align: 'center',
                  render: (v) => <Tag color="blue">{v} ca</Tag>
                },
                {
                  title: 'Doanh thu mang lại',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  render: (v) => (
                    <strong style={{ color: '#16a34a', fontSize: 14 }}>
                      {formatMoney(v)}
                    </strong>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* BIỂU ĐỒ 4: CƠ CẤU PHƯƠNG THỨC THANH TOÁN */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WalletOutlined style={{ color: '#003366', fontSize: 18 }} />
            <span style={{ color: '#003366', fontSize: 16, fontWeight: 700 }}>
              Phân bổ Phương thức Thanh toán tại Phòng khám
            </span>
          </div>
        }
        style={{ borderRadius: 12, marginTop: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <Row gutter={[24, 16]}>
          {paymentStats.map((p, idx) => (
            <Col xs={24} sm={12} key={idx}>
              <div style={{
                background: idx === 0 ? '#f0fdf4' : '#eff6ff',
                padding: '16px 20px',
                borderRadius: 10,
                border: `1px solid ${idx === 0 ? '#bbf7d0' : '#bfdbfe'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ fontSize: 15, color: '#003366' }}>{p.method}</strong>
                  <Tag color={idx === 0 ? 'green' : 'blue'}>{p.count} giao dịch</Tag>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: idx === 0 ? '#16a34a' : '#0284c7' }}>
                  {formatMoney(p.amount)}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {summary.year_revenue > 0 ? ((p.amount / summary.year_revenue) * 100).toFixed(1) : 0}% tổng doanh thu năm
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}