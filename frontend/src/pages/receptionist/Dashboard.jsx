import { useState, useEffect, useMemo } from 'react'
import {
  Row, Col, Card, Statistic, Table, Tag, Typography, Button, Space,
  Spin, Segmented, Radio, Input, Divider, Alert
} from 'antd'
import {
  CalendarOutlined, CheckCircleOutlined, UserAddOutlined,
  ClockCircleOutlined, ArrowRightOutlined, CloseCircleOutlined,
  TeamOutlined, SunOutlined, CloudOutlined, SaveOutlined,
  SafetyCertificateOutlined, UserOutlined, ReloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAppointments } from '../../api/appointments'
import { getMyAttendance, checkInShift } from '../../api/schedules'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function ReceptionistDashboard() {
  const [timeRange, setTimeRange] = useState('today') // 'today' | 'month'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Quick Attendance states
  const [session, setSession] = useState('full')
  const [submittingAttendance, setSubmittingAttendance] = useState(false)
  const [currentAttendance, setCurrentAttendance] = useState(null)
  const [loadingAttendance, setLoadingAttendance] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [timeRange])

  useEffect(() => {
    fetchTodayAttendance()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (timeRange === 'today') {
        params.date = dayjs().format('YYYY-MM-DD')
      }
      // Khi chọn 'month', ta lấy danh sách và filter theo tháng hiện tại
      const res = await getAppointments(params)
      let list = res.data.results || res.data || []

      if (timeRange === 'month') {
        const currentYearMonth = dayjs().format('YYYY-MM')
        list = list.filter(a => a.appointment_date && a.appointment_date.startsWith(currentYearMonth))
      }

      setAppointments(list)
    } catch {
      toast.error('Không thể tải dữ liệu lịch hẹn.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendance = async () => {
    setLoadingAttendance(true)
    try {
      const todayStr = dayjs().format('YYYY-MM-DD')
      const res = await getMyAttendance({ date: todayStr })
      if (res.data && res.data.session) {
        setCurrentAttendance(res.data)
        setSession(res.data.session)
      }
    } catch {
      // ignore
    } finally {
      setLoadingAttendance(false)
    }
  }

  const handleQuickCheckIn = async () => {
    setSubmittingAttendance(true)
    try {
      const todayStr = dayjs().format('YYYY-MM-DD')
      const res = await checkInShift({
        date: todayStr,
        session: session,
        notes: 'Chấm ca nhanh từ Bàn tiếp đón Lễ tân'
      })
      setCurrentAttendance(res.data)
      toast.success('Đã lưu chấm ca làm việc thành công! Dữ liệu đã chuyển sang Admin để tính lương.')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Lỗi khi lưu chấm ca.'
      toast.error(msg)
    } finally {
      setSubmittingAttendance(false)
    }
  }

  // Thống kê sơ lược theo yêu cầu: Đã khám, Đã hủy, Chờ khám/Đã xác nhận, Tổng tiếp nhận
  const stats = useMemo(() => {
    const total = appointments.length
    const completed = appointments.filter(a => a.status === 'completed').length
    const cancelled = appointments.filter(a => a.status === 'cancelled').length
    const confirmed = appointments.filter(a => ['confirmed', 'checked_in', 'in_progress'].includes(a.status)).length
    const morningCount = appointments.filter(a => a.session === 'morning').length
    const afternoonCount = appointments.filter(a => a.session === 'afternoon').length

    return { total, completed, cancelled, confirmed, morningCount, afternoonCount }
  }, [appointments])

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      width: 85,
      render: (id) => <strong style={{ color: '#003366' }}>#{id}</strong>
    },
    {
      title: 'Bệnh nhân & Liên hệ',
      key: 'patient',
      render: (_, r) => {
        const pInfo = r.patient_info || r.patient
        const name = pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`.trim() || pInfo?.user?.username || 'Bệnh nhân'
        const phone = pInfo?.user?.phone || '-'
        return (
          <div>
            <Text strong style={{ color: '#111827' }}>
              <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
              {name}
            </Text>
            <div style={{ fontSize: 12, color: '#0958d9', marginTop: 2 }}>
              SĐT: <strong>{phone}</strong>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_, r) => {
        const dInfo = r.doctor_info || r.doctor
        const docName = `${dInfo?.user?.first_name || ''} ${dInfo?.user?.last_name || ''}`.trim() || dInfo?.user?.username || 'Bác sĩ'
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#003366' }}>BS. {docName}</div>
            {dInfo?.specialty && <div style={{ fontSize: 11, color: '#6b7280' }}>{dInfo.specialty}</div>}
          </div>
        )
      }
    },
    {
      title: 'Dịch vụ yêu cầu',
      key: 'service',
      render: (_, r) => (
        <span style={{ fontWeight: 500 }}>
          {r.service_info?.name || r.service?.name || 'Khám nha khoa'}
        </span>
      )
    },
    {
      title: 'Thời gian khám (Khung 30p)',
      key: 'session_time',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 12, color: '#666' }}>{formatDate(r.appointment_date)}</div>
          <Space size={4} style={{ marginTop: 2 }}>
            <Tag color={r.session === 'morning' ? 'orange' : 'blue'}>
              {r.session === 'morning' ? 'Ca Sáng' : 'Ca Chiều'}
            </Tag>
            {r.time_slot ? (
              <Tag color="geekblue" icon={<ClockCircleOutlined />} style={{ fontWeight: 700 }}>
                {r.time_slot}
              </Tag>
            ) : null}
          </Space>
        </div>
      )
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
      {/* HEADER & TIME RANGE SWITCHER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f5132' }}>BÀN TIẾP ĐÓN & ĐIỀU PHỐI LỄ TÂN</Title>
          <Text type="secondary">
            Tổng quan tình hình bệnh nhân, đánh giá tiến độ khám và thực hiện chấm ca làm việc
          </Text>
        </div>

        <Space>
          <Segmented
            options={[
              { label: '📅 Hôm nay', value: 'today' },
              { label: '📊 Trong tháng này', value: 'month' },
            ]}
            value={timeRange}
            onChange={setTimeRange}
            size="large"
          />
          <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>Làm mới</Button>
        </Space>
      </div>

      {/* 4 THẺ THỐNG KÊ SƠ LƯỢC: ĐÃ KHÁM, ĐÃ HỦY, XÁC NHẬN/CHỜ KHÁM, TỔNG TIẾP NHẬN */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #1677ff', background: '#f0f5ff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#0958d9' }}>Tổng Lượt Tiếp Nhận ({timeRange === 'today' ? 'Hôm nay' : 'Tháng này'})</span>}
              value={stats.total}
              suffix="lượt"
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#0958d9', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              ☀️ Sáng: {stats.morningCount} | 🌤️ Chiều: {stats.afternoonCount}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a', background: '#f6ffed', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#389e0d' }}>Đã Khám Hoàn Tất</span>}
              value={stats.completed}
              suffix="bệnh nhân"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#389e0d', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#52c41a', marginTop: 6 }}>
              ✓ Đã hoàn tất điều trị y khoa
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16', background: '#fff7e6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#d46b08' }}>Đã Xác Nhận / Chờ Khám</span>}
              value={stats.confirmed}
              suffix="bệnh nhân"
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#d46b08', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#d46b08', marginTop: 6 }}>
              ⏳ Sẵn sàng tiếp đón tại quầy
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #ff4d4f', background: '#fff1f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#cf1322' }}>Lịch Hẹn Đã Hủy</span>}
              value={stats.cancelled}
              suffix="lượt"
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#cf1322', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#cf1322', marginTop: 6 }}>
              ✕ Bệnh nhân tự hủy hoặc báo bận
            </div>
          </Card>
        </Col>
      </Row>

      {/* KHỐI CHẤM CA LÀM VIỆC NHANH CHO NHÂN VIÊN */}
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
          border: '1px solid #b7eb8f',
          background: '#fcfdfa',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={7}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SafetyCertificateOutlined style={{ fontSize: 28, color: '#0f5132' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f5132' }}>
                  Chấm ca làm việc hôm nay
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Ngày {dayjs().format('DD/MM/YYYY')} — Chuyển tự động sang Admin
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Radio.Group
              value={session}
              onChange={(e) => setSession(e.target.value)}
              buttonStyle="solid"
              size="middle"
              style={{ width: '100%', display: 'flex' }}
            >
              <Radio.Button value="morning" style={{ flex: 1, textAlign: 'center' }}>
                <SunOutlined style={{ marginRight: 4 }} /> Ca Sáng (8h-12h)
              </Radio.Button>
              <Radio.Button value="afternoon" style={{ flex: 1, textAlign: 'center' }}>
                <CloudOutlined style={{ marginRight: 4 }} /> Ca Chiều (13h-17h)
              </Radio.Button>
              <Radio.Button value="full" style={{ flex: 1, textAlign: 'center' }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} /> Cả Ngày (8h-17h)
              </Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} md={5} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="middle"
              icon={<SaveOutlined />}
              loading={submittingAttendance}
              onClick={handleQuickCheckIn}
              style={{ background: '#0f5132', borderColor: '#0f5132', fontWeight: 700, borderRadius: 6 }}
            >
              Lưu chấm ca
            </Button>
            {currentAttendance && (
              <div style={{ fontSize: 11, color: '#389e0d', marginTop: 4, fontWeight: 500 }}>
                ✓ Đã chấm: {currentAttendance.session === 'full' ? 'Cả ngày' : currentAttendance.session === 'morning' ? 'Ca Sáng' : 'Ca Chiều'}
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* DANH SÁCH BỆNH NHÂN KHÁM TRONG NGÀY / THÁNG */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <CalendarOutlined style={{ color: '#0f5132' }} />
              <span>
                Danh sách chi tiết lịch hẹn khám ({timeRange === 'today' ? `Hôm nay ${dayjs().format('DD/MM/YYYY')}` : `Tháng ${dayjs().format('MM/YYYY')}`})
              </span>
            </Space>
            <Button type="link" onClick={() => navigate('/receptionist/appointments')}>
              Xem toàn bộ lịch hẹn <ArrowRightOutlined />
            </Button>
          </div>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: timeRange === 'today'
              ? 'Hôm nay chưa có lượt đặt lịch nào.'
              : 'Tháng này chưa có lượt đặt lịch nào.'
          }}
        />
      </Card>
    </div>
  )
}
