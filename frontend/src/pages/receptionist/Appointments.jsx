import { useState, useEffect, useMemo } from 'react'
import {
  Table, Card, Button, Input, Select, Space, Tag, Typography,
  Popconfirm, DatePicker, Radio, Row, Col, Statistic, Badge, Divider, Tooltip
} from 'antd'
import {
  CalendarOutlined, SearchOutlined, CloseCircleOutlined, ReloadOutlined,
  ClockCircleOutlined, UserOutlined, TeamOutlined, SunOutlined,
  CloudOutlined, CheckCircleOutlined, AppstoreOutlined
} from '@ant-design/icons'
import { getAppointments, cancelAppointment } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Option } = Select

export default function ReceptionistAppointments() {
  const [viewMode, setViewMode] = useState('by_date') // 'by_date' | 'all'
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [sessionFilter, setSessionFilter] = useState('all') // 'all' | 'morning' | 'afternoon'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [viewMode, selectedDate, statusFilter, sessionFilter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (viewMode === 'by_date' && selectedDate) {
        params.date = selectedDate.format('YYYY-MM-DD')
      }
      if (sessionFilter !== 'all') {
        params.session = sessionFilter
      }
      if (statusFilter) {
        params.status = statusFilter
      }
      if (search) {
        params.search = search
      }

      const res = await getAppointments(params)
      let data = res.data.results || res.data || []

      // Nếu đang xem theo ngày, sắp xếp theo khung giờ tăng dần để lễ tân dễ theo dõi
      if (viewMode === 'by_date') {
        data.sort((a, b) => {
          const timeA = a.time_slot || (a.session === 'morning' ? '08:00' : '13:00')
          const timeB = b.time_slot || (b.session === 'morning' ? '08:00' : '13:00')
          return timeA.localeCompare(timeB)
        })
      }

      setAppointments(data)
    } catch {
      toast.error('Không thể tải danh sách lịch hẹn.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id, { cancellation_reason: 'Khách hàng liên hệ đổi/hủy qua kênh hỗ trợ Lễ tân' })
      toast.success('Đã hủy lịch hẹn theo yêu cầu!')
      fetchAppointments()
    } catch {
      toast.error('Không thể hủy lịch.')
    }
  }

  // Thống kê số lượng bệnh nhân theo ngày đang chọn
  const stats = useMemo(() => {
    const total = appointments.length
    const morningCount = appointments.filter(a => a.session === 'morning').length
    const afternoonCount = appointments.filter(a => a.session === 'afternoon').length
    const confirmedCount = appointments.filter(a => ['confirmed', 'checked_in', 'in_progress'].includes(a.status)).length
    const cancelledCount = appointments.filter(a => a.status === 'cancelled').length

    return { total, morningCount, afternoonCount, confirmedCount, cancelledCount }
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
      title: 'Thời gian khám (Khung 30p)',
      key: 'date_session',
      width: 220,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#003366', fontSize: 13 }}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            {formatDate(r.appointment_date)}
          </div>
          <Space size={6} style={{ marginTop: 4 }}>
            <Tag color={r.session === 'morning' ? 'orange' : 'blue'}>
              {r.session === 'morning' ? 'Ca Sáng' : 'Ca Chiều'}
            </Tag>
            {r.time_slot ? (
              <Tag color="geekblue" icon={<ClockCircleOutlined />} style={{ fontWeight: 700, fontSize: 12 }}>
                {r.time_slot}
              </Tag>
            ) : (
              <Tag color="default">Giờ tự do</Tag>
            )}
          </Space>
        </div>
      )
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
            <div style={{ fontWeight: 600, color: '#111827' }}>
              <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
              {name}
            </div>
            <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>
              SĐT: <strong style={{ color: '#0958d9' }}>{phone}</strong>
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
            {dInfo?.specialty && (
              <div style={{ fontSize: 11, color: '#6b7280' }}>{dInfo.specialty}</div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Dịch vụ khám',
      key: 'service',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 500 }}>{r.service_info?.name || r.service?.name || '-'}</span>
          {r.reason && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 2, fontStyle: 'italic' }}>
              "{r.reason}"
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_, r) => (
        r.status !== 'cancelled' && r.status !== 'completed' && (
          <Popconfirm
            title="Hủy lịch hẹn theo yêu cầu?"
            description="Lịch hẹn sẽ bị hủy và khung giờ này sẽ được mở lại cho bệnh nhân khác."
            onConfirm={() => handleCancel(r.id)}
            okText="Đồng ý hủy"
            cancelText="Không"
          >
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f5132' }}>QUẢN LÝ & ĐIỀU PHỐI LỊCH HẸN KHÁM</Title>
          <Text type="secondary">Theo dõi số lượng người đặt lịch theo ngày, buổi và từng khung giờ 30 phút</Text>
        </div>
        <Space>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="by_date">
              <CalendarOutlined style={{ marginRight: 6 }} /> Theo Lịch Ngày
            </Radio.Button>
            <Radio.Button value="all">
              <AppstoreOutlined style={{ marginRight: 6 }} /> Tất Cả Lịch Hẹn
            </Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {/* KHỐI XEM THEO NGÀY: DATEPICKER & THỐNG KÊ BUỔI / SỐ NGƯỜI */}
      {viewMode === 'by_date' && (
        <Card style={{ marginBottom: 16, borderRadius: 12, borderTop: '4px solid #1677ff' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                Chọn ngày xem lịch:
              </label>
              <Space wrap>
                <DatePicker
                  value={selectedDate}
                  onChange={(d) => setSelectedDate(d || dayjs())}
                  format="DD/MM/YYYY"
                  allowClear={false}
                  size="large"
                  style={{ width: 170 }}
                />
                <Button onClick={() => setSelectedDate(dayjs())}>Hôm nay</Button>
                <Button onClick={() => setSelectedDate(dayjs().add(1, 'day'))}>Ngày mai</Button>
              </Space>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={12}>
                <Col xs={12} sm={6}>
                  <Card size="small" style={{ background: '#f0f5ff', borderRadius: 8, textAlign: 'center' }}>
                    <Statistic
                      title={<span style={{ fontSize: 12, color: '#0958d9' }}>Tổng số lịch hẹn</span>}
                      value={stats.total}
                      suffix="người"
                      valueStyle={{ color: '#0958d9', fontWeight: 700, fontSize: 20 }}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" style={{ background: '#fff7e6', borderRadius: 8, textAlign: 'center' }}>
                    <Statistic
                      title={<span style={{ fontSize: 12, color: '#d46b08' }}>Buổi Sáng (8h-12h)</span>}
                      value={stats.morningCount}
                      suffix="người"
                      valueStyle={{ color: '#d46b08', fontWeight: 700, fontSize: 20 }}
                      prefix={<SunOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" style={{ background: '#e6f7ff', borderRadius: 8, textAlign: 'center' }}>
                    <Statistic
                      title={<span style={{ fontSize: 12, color: '#13c2c2' }}>Buổi Chiều (13h-17h)</span>}
                      value={stats.afternoonCount}
                      suffix="người"
                      valueStyle={{ color: '#13c2c2', fontWeight: 700, fontSize: 20 }}
                      prefix={<CloudOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small" style={{ background: '#f6ffed', borderRadius: 8, textAlign: 'center' }}>
                    <Statistic
                      title={<span style={{ fontSize: 12, color: '#389e0d' }}>Sắp / Đang khám</span>}
                      value={stats.confirmedCount}
                      suffix="người"
                      valueStyle={{ color: '#389e0d', fontWeight: 700, fontSize: 20 }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider style={{ margin: '14px 0' }} />

          {/* Lọc nhanh theo buổi */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <Space>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Lọc buổi:</span>
              <Radio.Group
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                size="small"
              >
                <Radio.Button value="all">Tất cả ({stats.total})</Radio.Button>
                <Radio.Button value="morning">☀️ Buổi Sáng ({stats.morningCount})</Radio.Button>
                <Radio.Button value="afternoon">🌤️ Buổi Chiều ({stats.afternoonCount})</Radio.Button>
              </Radio.Group>
            </Space>

            <Space>
              <Input
                placeholder="Tìm tên BN, SĐT..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchAppointments}
                size="small"
                style={{ width: 220 }}
              />
              <Button size="small" icon={<SearchOutlined />} onClick={fetchAppointments}>Tìm</Button>
              <Button size="small" icon={<ReloadOutlined />} onClick={fetchAppointments}>Làm mới</Button>
            </Space>
          </div>
        </Card>
      )}

      {/* KHỐI XEM TẤT CẢ LỊCH HẸN */}
      {viewMode === 'all' && (
        <Card style={{ marginBottom: 16, borderRadius: 12, borderTop: '4px solid #52c41a' }}>
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
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="checked_in">Đã đến phòng khám</Option>
              <Option value="in_progress">Đang khám</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="no_show">Vắng mặt (No-show)</Option>
            </Select>
            <Button icon={<SearchOutlined />} onClick={fetchAppointments}>Tìm kiếm</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setStatusFilter(''); fetchAppointments() }}>
              Làm mới
            </Button>
          </Space>
        </Card>
      )}

      {/* BẢNG DANH SÁCH LỊCH HẸN */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          locale={{
            emptyText: viewMode === 'by_date'
              ? `Ngày ${selectedDate ? selectedDate.format('DD/MM/YYYY') : ''} chưa có lịch hẹn nào.`
              : 'Không tìm thấy lịch hẹn nào.'
          }}
        />
      </Card>
    </div>
  )
}
