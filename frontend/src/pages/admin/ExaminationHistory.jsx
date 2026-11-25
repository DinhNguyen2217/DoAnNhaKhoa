import { useState, useEffect, useMemo } from 'react'
import {
  Card, Table, Tag, Typography, Button, Input, DatePicker,
  Space, Row, Col, Statistic, Modal, Divider, Select, Radio,
  Segmented, Tooltip
} from 'antd'
import {
  HistoryOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined,
  CalendarOutlined, UserOutlined, EyeOutlined, MedicineBoxOutlined,
  DollarCircleOutlined, CloseCircleOutlined, TeamOutlined,
  ClockCircleOutlined, FileTextOutlined
} from '@ant-design/icons'
import { getAppointments } from '../../api/appointments'
import { getInvoices } from '../../api/invoices'
import { getDoctors } from '../../api/doctors'
import { formatDate, formatMoney, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Option } = Select

export default function AdminExaminationHistory() {
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [filterMode, setFilterMode] = useState('month') // 'month' | 'year' | 'all'
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [selectedYear, setSelectedYear] = useState(dayjs())
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resApp, resInv, resDoc] = await Promise.all([
        getAppointments(),
        getInvoices(),
        getDoctors()
      ])
      setAppointments(resApp.data.results || resApp.data || [])
      setInvoices(resInv.data.results || resInv.data || [])
      setDoctors(resDoc.data.results || resDoc.data || [])
    } catch {
      toast.error('Không thể tải dữ liệu lịch sử khám bệnh.')
    } finally {
      setLoading(false)
    }
  }

  // Lọc dữ liệu theo thời gian (Tháng / Năm / Tất cả), Bác sĩ, Trạng thái, Search
  const filteredList = useMemo(() => {
    return appointments.filter(app => {
      if (!app.appointment_date) return false
      const appDate = dayjs(app.appointment_date)

      // 1. Lọc theo thời gian
      if (filterMode === 'month' && selectedMonth) {
        if (!appDate.isSame(selectedMonth, 'month')) return false
      } else if (filterMode === 'year' && selectedYear) {
        if (!appDate.isSame(selectedYear, 'year')) return false
      }

      // 2. Lọc theo Bác sĩ
      if (doctorFilter !== 'all') {
        const docId = app.doctor_info?.id || app.doctor
        if (String(docId) !== String(doctorFilter)) return false
      }

      // 3. Lọc theo Trạng thái
      if (statusFilter !== 'all') {
        if (app.status !== statusFilter) return false
      }

      // 4. Tìm kiếm từ khóa
      if (search) {
        const query = search.toLowerCase()
        const pInfo = app.patient_info || app.patient
        const pName = (pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`).toLowerCase()
        const pPhone = pInfo?.user?.phone || app.patient_phone || ''
        const code = String(app.id)
        if (!pName.includes(query) && !pPhone.includes(query) && !code.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [appointments, filterMode, selectedMonth, selectedYear, doctorFilter, statusFilter, search])

  // Map mỗi ca khám với hóa đơn tương ứng để tính doanh thu
  const appointmentWithInvoice = useMemo(() => {
    return filteredList.map(app => {
      const inv = invoices.find(i => i.appointment === app.id)
      return {
        ...app,
        invoice: inv,
        paid_amount: (inv && inv.status === 'paid') ? Number(inv.final_amount || inv.total_amount || 0) : 0
      }
    })
  }, [filteredList, invoices])

  // Thống kê cốt lõi theo yêu cầu của Admin:
  // - Đã khám bao nhiêu người
  // - Đã thu tiền bao nhiêu
  // - Có bao nhiêu người đặt rồi hủy
  // - Tổng lượt đặt lịch
  const stats = useMemo(() => {
    const totalBooked = appointmentWithInvoice.length
    const examinedCount = appointmentWithInvoice.filter(a => a.status === 'completed').length
    const cancelledCount = appointmentWithInvoice.filter(a => a.status === 'cancelled').length
    const waitingCount = appointmentWithInvoice.filter(a => ['confirmed', 'checked_in', 'in_progress'].includes(a.status)).length

    // Tổng tiền đã thu thực tế từ các ca đã thanh toán trong kỳ
    const totalRevenue = appointmentWithInvoice.reduce((sum, a) => sum + (a.paid_amount || 0), 0)

    const cancelRate = totalBooked > 0 ? ((cancelledCount / totalBooked) * 100).toFixed(1) : 0

    return { totalBooked, examinedCount, cancelledCount, waitingCount, totalRevenue, cancelRate }
  }, [appointmentWithInvoice])

  const handleOpenDetail = (item) => {
    setSelectedItem(item)
    setDetailModalOpen(true)
  }

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
      key: 'time',
      width: 200,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#003366' }}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            {formatDate(r.appointment_date)}
          </div>
          <Space size={4} style={{ marginTop: 2 }}>
            <Tag color={r.session === 'morning' ? 'orange' : 'blue'}>
              {r.session === 'morning' ? 'Sáng' : 'Chiều'}
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
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => {
        const pInfo = r.patient_info || r.patient
        const name = pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`.trim() || 'Bệnh nhân'
        const phone = pInfo?.user?.phone || r.patient_phone || '-'
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
      title: 'Dịch vụ nha khoa',
      key: 'service',
      render: (_, r) => (
        <span style={{ fontWeight: 500 }}>
          {r.service_info?.name || r.service?.name || 'Khám nha khoa'}
        </span>
      )
    },
    {
      title: 'Tiền đã thu',
      key: 'revenue',
      width: 140,
      render: (_, r) => {
        if (r.paid_amount > 0) {
          return (
            <div>
              <strong style={{ color: '#15803d', fontSize: 14 }}>{formatMoney(r.paid_amount)}</strong>
              <div style={{ fontSize: 11, color: '#52c41a' }}>✓ Đã thanh toán</div>
            </div>
          )
        }
        if (r.status === 'completed') {
          return <span style={{ color: '#d46b08', fontSize: 12 }}>Chờ thu tiền</span>
        }
        if (r.status === 'cancelled') {
          return <span style={{ color: '#999', fontSize: 12 }}>-</span>
        }
        return <span style={{ color: '#666', fontSize: 12 }}>Chưa tính tiền</span>
      }
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
      width: 120,
      render: (_, r) => (
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleOpenDetail(r)}
          style={{ background: '#001529' }}
        >
          Chi tiết
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#001529' }}>
            <HistoryOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            LỊCH SỬ KHÁM BỆNH & DOANH THU PHÒNG KHÁM
          </Title>
          <Text type="secondary">
            Báo cáo tổng hợp số lượng bệnh nhân đã khám, doanh thu thực thu và số lượt hủy lịch theo Tháng / Năm
          </Text>
        </div>

        <Space>
          <Segmented
            options={[
              { label: '📅 Theo Tháng', value: 'month' },
              { label: '📆 Theo Năm', value: 'year' },
              { label: '🌐 Tất Cả', value: 'all' },
            ]}
            value={filterMode}
            onChange={setFilterMode}
            size="large"
          />
          {filterMode === 'month' && (
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(d) => setSelectedMonth(d || dayjs())}
              format="MM/YYYY"
              allowClear={false}
              size="large"
            />
          )}
          {filterMode === 'year' && (
            <DatePicker
              picker="year"
              value={selectedYear}
              onChange={(d) => setSelectedYear(d || dayjs())}
              format="YYYY"
              allowClear={false}
              size="large"
            />
          )}
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* 4 THẺ THỐNG KÊ LOGIC THEO YÊU CẦU CỦA ADMIN */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a', background: '#f6ffed', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#389e0d' }}>Số Người Đã Khám ({filterMode === 'month' ? `T${selectedMonth.format('MM/YYYY')}` : filterMode === 'year' ? `Năm ${selectedYear.format('YYYY')}` : 'Toàn thời gian'})</span>}
              value={stats.examinedCount}
              suffix="bệnh nhân"
              prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#389e0d', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#52c41a', marginTop: 6 }}>
              ✓ Đã hoàn tất điều trị y khoa
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #1890ff', background: '#f0f5ff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#0958d9' }}>Số Tiền Đã Thu Được</span>}
              value={stats.totalRevenue}
              formatter={(v) => formatMoney(v)}
              prefix={<DollarCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#0958d9', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#0958d9', marginTop: 6 }}>
              💰 Viện phí thu thực tế tại quầy
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #ff4d4f', background: '#fff1f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#cf1322' }}>Số Lượt Đặt Rồi Hủy</span>}
              value={stats.cancelledCount}
              suffix={`lượt (${stats.cancelRate}%)`}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#cf1322', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#cf1322', marginTop: 6 }}>
              ✕ Bệnh nhân tự hủy hoặc báo bận
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #722ed1', background: '#f9f0ff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#531dab' }}>Tổng Lượt Đặt Lịch</span>}
              value={stats.totalBooked}
              suffix="lượt hẹn"
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#531dab', fontWeight: 800, fontSize: 24 }}
            />
            <div style={{ fontSize: 12, color: '#531dab', marginTop: 6 }}>
              ⏳ Đang chờ/đang khám: {stats.waitingCount} lượt
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc bổ sung: Bác sĩ, Trạng thái, Tìm kiếm */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo tên bệnh nhân, SĐT, mã hẹn..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            value={doctorFilter}
            onChange={setDoctorFilter}
            style={{ width: 220 }}
          >
            <Option value="all">👨‍⚕️ Tất cả bác sĩ phụ trách</Option>
            {doctors.map(d => (
              <Option key={d.id} value={d.id}>
                BS. {d.user?.first_name} {d.user?.last_name || d.user?.username} ({d.specialty})
              </Option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 190 }}
          >
            <Option value="all">📌 Tất cả trạng thái</Option>
            <Option value="completed">Đã khám hoàn tất</Option>
            <Option value="cancelled">Đã hủy lịch</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="checked_in">Đã đến quầy</Option>
            <Option value="in_progress">Đang trong phòng khám</Option>
          </Select>

          {(search || doctorFilter !== 'all' || statusFilter !== 'all') && (
            <Button onClick={() => { setSearch(''); setDoctorFilter('all'); setStatusFilter('all') }}>
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      </Card>

      {/* Bảng danh sách chi tiết */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          columns={columns}
          dataSource={appointmentWithInvoice}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: 'Không tìm thấy dữ liệu ca khám nào trong khoảng thời gian này.' }}
        />
      </Card>

      {/* Modal chi tiết ca khám */}
      <Modal
        title={`CHI TIẾT LỊCH HẸN & BỆNH ÁN #${selectedItem?.id}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={650}
      >
        {selectedItem && (
          <div style={{ lineHeight: 1.8, fontSize: 13 }}>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 14, border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '3px 0' }}>
                Bệnh nhân: <strong style={{ color: '#003a8c', fontSize: 15 }}>{selectedItem.patient_info?.full_name || 'Bệnh nhân'}</strong> (SĐT: {selectedItem.patient_info?.user?.phone || selectedItem.patient_phone || '-'})
              </p>
              <p style={{ margin: '3px 0' }}>
                Bác sĩ phụ trách: <strong>BS. {selectedItem.doctor_info?.user?.first_name} {selectedItem.doctor_info?.user?.last_name || ''} ({selectedItem.doctor_info?.specialty})</strong>
              </p>
              <p style={{ margin: '3px 0' }}>
                Dịch vụ: <strong>{selectedItem.service_info?.name || 'Khám nha khoa'}</strong>
              </p>
              <p style={{ margin: '3px 0' }}>
                Thời gian khám: <strong>{formatDate(selectedItem.appointment_date)}</strong> | Khung giờ: <Tag color="geekblue">{selectedItem.time_slot || 'Khám trong ngày'}</Tag>
              </p>
              <p style={{ margin: '3px 0' }}>
                Trạng thái: <Tag color={STATUS_COLORS[selectedItem.status]}>{STATUS_LABELS[selectedItem.status] || selectedItem.status}</Tag>
              </p>
            </div>

            {selectedItem.reason && (
              <p style={{ margin: '6px 0' }}>
                Triệu chứng ban đầu: <em>"{selectedItem.reason}"</em>
              </p>
            )}

            {selectedItem.invoice && (
              <div style={{ marginTop: 12, background: '#f6ffed', padding: 14, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                  <FileTextOutlined style={{ marginRight: 6 }} />
                  Thông tin hóa đơn & Viện phí ({selectedItem.invoice.invoice_number})
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Tổng tiền dịch vụ:</span>
                  <strong>{formatMoney(selectedItem.invoice.subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Số tiền thực thu tại quầy:</span>
                  <strong style={{ color: '#eb2f96', fontSize: 15 }}>{formatMoney(selectedItem.invoice.final_amount || selectedItem.invoice.total_amount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Trạng thái thanh toán:</span>
                  <Tag color={selectedItem.invoice.status === 'paid' ? 'green' : 'orange'}>
                    {selectedItem.invoice.status === 'paid' ? 'Đã thu đủ tiền' : 'Chờ thanh toán'}
                  </Tag>
                </div>
              </div>
            )}

            {selectedItem.cancellation_reason && (
              <div style={{ marginTop: 12, background: '#fff1f0', padding: 12, borderRadius: 8, border: '1px solid #ffa39e' }}>
                <strong style={{ color: '#cf1322' }}>Lý do hủy lịch:</strong>
                <p style={{ margin: '4px 0 0', color: '#666' }}>{selectedItem.cancellation_reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
