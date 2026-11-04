import { useState, useEffect } from 'react'
import {
  Card, Table, Typography, Tabs, DatePicker, Row, Col, Statistic, Tag,
  Button, Space, Modal, Form, InputNumber, Input, Select, message, Descriptions, Divider, Alert, Badge
} from 'antd'
import {
  DollarOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined,
  ClockCircleOutlined, EditOutlined, EyeOutlined, ReloadOutlined,
  UserOutlined, MedicineBoxOutlined, FileTextOutlined, AuditOutlined, PrinterOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getDailyOverview, getSalaryConfigs, updateSalaryConfig,
  getPayrolls, calculatePayroll, markPayrollPaid
} from '../../api/schedules'
import { formatMoney, formatDate, formatDateTime } from '../../utils/helpers'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('daily')

  // State Tab 1: Giám sát ca làm việc theo ngày
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [dailyData, setDailyData] = useState(null)
  const [dailyLoading, setDailyLoading] = useState(false)

  // State Tab 2: Cấu hình mức lương
  const [salaryConfigs, setSalaryConfigs] = useState([])
  const [configLoading, setConfigLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [configForm] = Form.useForm()

  // State Tab 3: Bảng tính lương tháng
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [payrollData, setPayrollData] = useState([])
  const [payrollLoading, setPayrollLoading] = useState(false)
  const [payModalVisible, setPayModalVisible] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState(null)
  const [slipModalVisible, setSlipModalVisible] = useState(false)
  const [slipData, setSlipData] = useState(null)
  const [payForm] = Form.useForm()

  useEffect(() => {
    if (activeTab === 'daily') fetchDailyOverview(selectedDate)
    if (activeTab === 'config') fetchSalaryConfigs()
    if (activeTab === 'payroll') fetchPayroll(selectedMonth)
  }, [activeTab])

  // ── Tab 1 Functions ────────────────────────────────────────────────────────
  const fetchDailyOverview = async (dateObj) => {
    setDailyLoading(true)
    try {
      const dateStr = dateObj ? dateObj.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      const res = await getDailyOverview({ date: dateStr })
      setDailyData(res.data)
    } catch {
      message.error('Không thể tải dữ liệu ca làm việc theo ngày.')
    } finally {
      setDailyLoading(false)
    }
  }

  // ── Tab 2 Functions ────────────────────────────────────────────────────────
  const fetchSalaryConfigs = async () => {
    setConfigLoading(true)
    try {
      const res = await getSalaryConfigs()
      setSalaryConfigs(res.data?.results || res.data || [])
    } catch {
      message.error('Không thể tải cấu hình mức lương nhân sự.')
    } finally {
      setConfigLoading(false)
    }
  }

  const handleEditConfig = (record) => {
    setSelectedConfig(record)
    configForm.setFieldsValue({
      shift_rate: Number(record.shift_rate) || 0,
      base_salary: Number(record.base_salary) || 0,
      commission_per_patient: Number(record.commission_per_patient) || 0,
      allowance: Number(record.allowance) || 0,
      note: record.note || ''
    })
    setEditModalVisible(true)
  }

  const handleSaveConfig = async () => {
    try {
      const values = await configForm.validateFields()
      await updateSalaryConfig(selectedConfig.id, values)
      message.success(`Đã cập nhật mức lương cho ${selectedConfig.user_name}`)
      setEditModalVisible(false)
      fetchSalaryConfigs()
    } catch (err) {
      if (!err.errorFields) message.error('Không thể lưu mức lương.')
    }
  }

  // ── Tab 3 Functions ────────────────────────────────────────────────────────
  const fetchPayroll = async (monthObj) => {
    setPayrollLoading(true)
    try {
      const month = monthObj ? monthObj.month() + 1 : dayjs().month() + 1
      const year = monthObj ? monthObj.year() : dayjs().year()
      // Tự động tính toán hoặc lấy bảng lương tháng
      const res = await calculatePayroll({ month, year })
      setPayrollData(res.data?.payrolls || [])
    } catch {
      message.error('Không thể tính toán bảng lương.')
    } finally {
      setPayrollLoading(false)
    }
  }

  const handleOpenPayModal = (record) => {
    setSelectedPayroll(record)
    payForm.setFieldsValue({
      payment_method: 'Chuyển khoản QR ngân hàng',
      note: 'Đã hoàn tất thanh toán lương tháng'
    })
    setPayModalVisible(true)
  }

  const handleConfirmPay = async () => {
    try {
      const values = await payForm.validateFields()
      await markPayrollPaid(selectedPayroll.id, values)
      message.success(`Đã xác nhận chi trả lương cho ${selectedPayroll.user_name}`)
      setPayModalVisible(false)
      fetchPayroll(selectedMonth)
    } catch {
      message.error('Không thể cập nhật trạng thái chi trả.')
    }
  }

  const handleViewSlip = (record) => {
    setSlipData(record)
    setSlipModalVisible(true)
  }

  // ── Column Definitions ─────────────────────────────────────────────────────

  // Cột bảng cấu hình lương
  const configColumns = [
    {
      title: 'Nhân sự',
      key: 'name',
      render: (_, r) => (
        <div>
          <strong style={{ color: '#003366', fontSize: 14 }}>{r.user_name}</strong>
          <div>
            <Tag color={r.user_role === 'doctor' ? 'blue' : 'purple'}>
              {r.user_role_display}
            </Tag>
            {r.specialty && <span style={{ fontSize: 12, color: '#64748b' }}>({r.specialty})</span>}
          </div>
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (p) => p || '-'
    },
    {
      title: 'Lương / 1 Ca trực',
      dataIndex: 'shift_rate',
      key: 'shift_rate',
      render: (val) => <strong style={{ color: '#0284c7' }}>{formatMoney(val)} / ca</strong>
    },
    {
      title: 'Lương cứng cơ bản',
      dataIndex: 'base_salary',
      key: 'base_salary',
      render: (val) => formatMoney(val)
    },
    {
      title: 'Hoa hồng / Lượt khám',
      dataIndex: 'commission_per_patient',
      key: 'commission',
      render: (val) => <span style={{ color: '#16a34a', fontWeight: 600 }}>+{formatMoney(val)}/BN</span>
    },
    {
      title: 'Phụ cấp',
      dataIndex: 'allowance',
      key: 'allowance',
      render: (val) => formatMoney(val)
    },
    {
      title: 'Ghi chú chế độ',
      dataIndex: 'note',
      key: 'note',
      render: (t) => t || <Text type="secondary">-</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      render: (_, r) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<EditOutlined />}
          onClick={() => handleEditConfig(r)}
        >
          Định giá lương
        </Button>
      )
    }
  ]

  // Cột bảng tính lương tháng
  const payrollColumns = [
    {
      title: 'Nhân sự & Chức vụ',
      key: 'user',
      render: (_, r) => (
        <div>
          <strong style={{ color: '#003366', fontSize: 14 }}>{r.user_name}</strong>
          <div>
            <Tag color={r.user_role === 'doctor' ? 'blue' : 'purple'}>
              {r.user_role_display}
            </Tag>
            {r.specialty && <span style={{ fontSize: 12, color: '#64748b' }}>({r.specialty})</span>}
          </div>
        </div>
      )
    },
    {
      title: 'Số ca trực',
      key: 'shifts',
      align: 'center',
      render: (_, r) => (
        <div>
          <strong style={{ fontSize: 15, color: '#0f172a' }}>{Number(r.total_shifts)} ca</strong>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Sáng: {r.morning_shifts} | Chiều: {r.afternoon_shifts}
          </div>
        </div>
      )
    },
    {
      title: 'Lượt BN khám',
      dataIndex: 'total_patients_examined',
      key: 'patients',
      align: 'center',
      render: (val) => <Tag color="cyan">{val} bệnh nhân</Tag>
    },
    {
      title: 'Tiền ca trực',
      key: 'shift_salary',
      render: (_, r) => (
        <div>
          <span>{formatMoney(r.shift_salary)}</span>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            ({formatMoney(r.shift_rate_applied)}/ca)
          </div>
        </div>
      )
    },
    {
      title: 'Lương cứng',
      dataIndex: 'base_salary',
      key: 'base_salary',
      render: (val) => formatMoney(val)
    },
    {
      title: 'Hoa hồng & Phụ cấp',
      key: 'comm_allowance',
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ color: '#16a34a' }}>HH: +{formatMoney(r.commission_amount)}</div>
          <div style={{ color: '#475569' }}>PC: +{formatMoney(r.allowance)}</div>
        </div>
      )
    },
    {
      title: 'Tổng thực lĩnh',
      dataIndex: 'net_salary',
      key: 'net_salary',
      render: (val) => (
        <strong style={{ color: '#0284c7', fontSize: 16 }}>
          {formatMoney(val)}
        </strong>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => (
        <div>
          <Tag color={r.status === 'paid' ? 'green' : 'orange'}>
            {r.status_display}
          </Tag>
          {r.paid_at && (
            <div style={{ fontSize: 11, color: '#16a34a' }}>
              {formatDateTime(r.paid_at)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleViewSlip(r)}
          >
            Phiếu lương
          </Button>
          {r.status !== 'paid' ? (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleOpenPayModal(r)}
            >
              Chi trả
            </Button>
          ) : (
            <Tag color="success">Đã chi trả</Tag>
          )}
        </Space>
      )
    }
  ]

  // Tính tổng quỹ lương của tháng
  const totalPayrollAmount = payrollData.reduce((acc, curr) => acc + (Number(curr.net_salary) || 0), 0)
  const totalShiftsCount = payrollData.reduce((acc, curr) => acc + (Number(curr.total_shifts) || 0), 0)

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
        <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
          QUẢN LÝ CA TRỰC & BẢNG TÍNH LƯƠNG NHÂN SỰ
        </Title>
        <Paragraph style={{ color: '#e0edff', margin: '6px 0 0', fontSize: 14 }}>
          Giám sát nhân sự đi làm theo ngày, thiết lập định giá mức lương từng người và tự động tính lương theo số ca làm việc thực tế.
        </Paragraph>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: 'daily',
            label: (
              <span>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Giám sát Ca làm việc & Công việc theo ngày
              </span>
            ),
            children: (
              <div>
                {/* Bộ lọc chọn ngày */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                      <Space size="middle" wrap>
                        <Text strong>Chọn ngày kiểm tra:</Text>
                        <DatePicker
                          value={selectedDate}
                          onChange={(d) => {
                            if (d) {
                              setSelectedDate(d)
                              fetchDailyOverview(d)
                            }
                          }}
                          format="DD/MM/YYYY"
                          allowClear={false}
                          style={{ width: 180 }}
                        />
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={() => fetchDailyOverview(selectedDate)}
                        >
                          Tải lại dữ liệu
                        </Button>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
                          Ngày: <strong>{selectedDate ? selectedDate.format('DD/MM/YYYY') : '-'}</strong>
                        </Tag>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Thẻ thống kê ngày */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
                      <Statistic
                        title="Bác sĩ có lịch làm việc hôm nay"
                        value={dailyData?.total_doctors_working || 0}
                        prefix={<MedicineBoxOutlined style={{ color: '#1890ff' }} />}
                        suffix="Bác sĩ"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16' }}>
                      <Statistic
                        title="Tổng bệnh nhân đã đăng ký khám"
                        value={dailyData?.total_patients_booked || 0}
                        prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
                        suffix="Lượt khám"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
                      <Statistic
                        title="Lượt khám đã hoàn tất bệnh án"
                        value={dailyData?.total_completed || 0}
                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        suffix="Lượt"
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Danh sách Bác sĩ đi làm và công việc chi tiết */}
                <Title level={4} style={{ color: '#003366', marginBottom: 12 }}>
                  Danh sách Bác sĩ trực ca & Công việc phụ trách ngày {selectedDate?.format('DD/MM/YYYY')}:
                </Title>

                {(!dailyData?.doctors_working || dailyData.doctors_working.length === 0) ? (
                  <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                    <CalendarOutlined style={{ fontSize: 40, color: '#cbd5e1', marginBottom: 10 }} />
                    <Paragraph type="secondary">
                      Chưa có bác sĩ nào đăng ký lịch trực cho ngày {selectedDate?.format('DD/MM/YYYY')}.
                    </Paragraph>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {dailyData.doctors_working.map((doc) => (
                      <Card
                        key={doc.schedule_id}
                        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space size="middle">
                              <MedicineBoxOutlined style={{ color: '#003366', fontSize: 18 }} />
                              <div>
                                <strong style={{ fontSize: 15, color: '#003366' }}>
                                  BS. {doc.doctor_name}
                                </strong>
                                <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>
                                  ({doc.specialty})
                                </span>
                              </div>
                            </Space>
                            <Space>
                              <Tag color="geekblue" style={{ fontSize: 13 }}>
                                Ca làm: <strong>{doc.session_display}</strong>
                              </Tag>
                              <Tag color="cyan">
                                Đã đặt: <strong>{doc.total_booked} BN</strong> (Sáng: {doc.morning_booked} / Chiều: {doc.afternoon_booked})
                              </Tag>
                            </Space>
                          </div>
                        }
                      >
                        {doc.patients && doc.patients.length > 0 ? (
                          <Table
                            size="small"
                            pagination={false}
                            dataSource={doc.patients}
                            rowKey="id"
                            columns={[
                              {
                                title: 'Mã hẹn',
                                dataIndex: 'id',
                                key: 'id',
                                width: 80,
                                render: (id) => `#LH${id}`
                              },
                              {
                                title: 'Bệnh nhân',
                                key: 'patient',
                                render: (_, p) => (
                                  <div>
                                    <strong>{p.patient_name}</strong>
                                    {p.phone && <div style={{ fontSize: 12, color: '#64748b' }}>SĐT: {p.phone}</div>}
                                  </div>
                                )
                              },
                              {
                                title: 'Dịch vụ khám / Hạng mục',
                                dataIndex: 'service_name',
                                key: 'service'
                              },
                              {
                                title: 'Buổi khám',
                                dataIndex: 'session_display',
                                key: 'session',
                                width: 140
                              },
                              {
                                title: 'Trạng thái khám',
                                key: 'status',
                                render: (_, p) => (
                                  <Tag color={p.status === 'completed' ? 'green' : (p.status === 'in_progress' ? 'blue' : 'orange')}>
                                    {p.status_display}
                                  </Tag>
                                )
                              },
                              {
                                title: 'Bệnh án lâm sàng',
                                key: 'record',
                                render: (_, p) => p.has_medical_record ? (
                                  <Tag color="success" icon={<CheckCircleOutlined />}>
                                    Đã lập bệnh án {p.diagnosis && `(${p.diagnosis})`}
                                  </Tag>
                                ) : (
                                  <Tag color="default">Chưa lập bệnh án</Tag>
                                )
                              },
                              {
                                title: 'Viện phí',
                                key: 'invoice',
                                render: (_, p) => p.invoice_status === 'paid' ? (
                                  <Tag color="green">Đã TT: {formatMoney(p.invoice_total)}</Tag>
                                ) : (
                                  <span style={{ color: '#64748b', fontSize: 12 }}>Chưa thanh toán</span>
                                )
                              }
                            ]}
                          />
                        ) : (
                          <Paragraph type="secondary" style={{ margin: 0 }}>
                            Chưa có bệnh nhân nào đặt lịch khám với bác sĩ trong ngày này.
                          </Paragraph>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {/* Danh sách Lễ tân trực ca */}
                {dailyData?.receptionists && dailyData.receptionists.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <Title level={5} style={{ color: '#003366', marginBottom: 12 }}>
                      Nhân viên Lễ tân & Thu ngân trực ca ngày hôm nay:
                    </Title>
                    <Row gutter={[16, 12]}>
                      {dailyData.receptionists.map((rec) => (
                        <Col xs={24} sm={12} key={rec.id}>
                          <Card size="small" style={{ borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Space align="start">
                              <UserOutlined style={{ color: '#722ed1', fontSize: 20, marginTop: 4 }} />
                              <div>
                                <strong style={{ fontSize: 14, color: '#003366' }}>{rec.name}</strong>
                                <div style={{ fontSize: 12, color: '#64748b' }}>SĐT: {rec.phone || 'Chưa cập nhật'}</div>
                                <div style={{ fontSize: 12, color: '#722ed1', marginTop: 4 }}>
                                  <strong>Nhiệm vụ:</strong> {rec.task}
                                </div>
                              </div>
                            </Space>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'config',
            label: (
              <span>
                <DollarOutlined style={{ marginRight: 6 }} />
                Cấu hình Mức lương Nhân sự (Admin định giá)
              </span>
            ),
            children: (
              <div>
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#003366' }}>
                        ĐỊNH GIÁ & CẤU HÌNH LƯƠNG NHÂN SỰ
                      </Title>
                      <Text type="secondary">
                        Admin có toàn quyền thiết lập mức lương theo ca trực, lương cứng cơ bản và hoa hồng riêng cho từng Bác sĩ & Lễ tân
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={fetchSalaryConfigs}
                    >
                      Làm mới
                    </Button>
                  </div>
                </Card>

                <Card style={{ borderRadius: 12 }}>
                  <Table
                    columns={configColumns}
                    dataSource={salaryConfigs}
                    rowKey="id"
                    loading={configLoading}
                    pagination={false}
                  />
                </Card>
              </div>
            )
          },
          {
            key: 'payroll',
            label: (
              <span>
                <AuditOutlined style={{ marginRight: 6 }} />
                Bảng tính lương tháng & Chi trả
              </span>
            ),
            children: (
              <div>
                {/* Bộ lọc tháng và nút tính lương */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                  <Row gutter={[16, 16]} justify="space-between" align="middle">
                    <Col>
                      <Space size="middle" wrap>
                        <Text strong>Chọn kỳ lương (Tháng/Năm):</Text>
                        <DatePicker
                          picker="month"
                          value={selectedMonth}
                          onChange={(m) => {
                            if (m) {
                              setSelectedMonth(m)
                              fetchPayroll(m)
                            }
                          }}
                          format="MM/YYYY"
                          allowClear={false}
                          style={{ width: 160 }}
                        />
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={() => fetchPayroll(selectedMonth)}
                        >
                          Tính toán lại bảng lương
                        </Button>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
                          Kỳ lương: <strong>Tháng {selectedMonth?.format('MM/YYYY')}</strong>
                        </Tag>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Thẻ tổng quan quỹ lương tháng */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
                      <Statistic
                        title="Tổng quỹ lương thực lĩnh tháng này"
                        value={formatMoney(totalPayrollAmount)}
                        valueStyle={{ color: '#16a34a', fontWeight: 700 }}
                        prefix={<DollarOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
                      <Statistic
                        title="Tổng số ca trực nhân sự đã làm"
                        value={totalShiftsCount}
                        valueStyle={{ color: '#0284c7', fontWeight: 700 }}
                        suffix="Ca"
                        prefix={<ClockCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #722ed1' }}>
                      <Statistic
                        title="Tổng số nhân sự hưởng lương"
                        value={payrollData.length}
                        valueStyle={{ color: '#722ed1', fontWeight: 700 }}
                        suffix="Nhân sự"
                        prefix={<TeamOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Bảng lương chi tiết */}
                <Card style={{ borderRadius: 12 }}>
                  <Table
                    columns={payrollColumns}
                    dataSource={payrollData}
                    rowKey="id"
                    loading={payrollLoading}
                    pagination={false}
                    locale={{ emptyText: 'Chưa có dữ liệu bảng lương tháng này. Hãy bấm Tính toán lại bảng lương.' }}
                  />
                </Card>
              </div>
            )
          }
        ]}
      />

      {/* Modal chỉnh sửa mức lương (Admin định giá) */}
      <Modal
        title={`Định giá & Cấu hình mức lương: ${selectedConfig?.user_name} (${selectedConfig?.user_role_display})`}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveConfig}
        okText="Lưu cấu hình mức lương"
        cancelText="Hủy bỏ"
        width={550}
      >
        <Alert
          type="info"
          showIcon
          message="Chính sách tiền lương linh hoạt"
          description="Admin có thể đặt giá ca trực riêng, lương cứng và mức hoa hồng cho từng người. Khi tính lương, hệ thống sẽ tự nhân theo số ca làm việc thực tế."
          style={{ marginBottom: 16 }}
        />
        <Form form={configForm} layout="vertical">
          <Form.Item
            name="shift_rate"
            label="Mức thù lao / 1 Ca trực (buổi)"
            rules={[{ required: true, message: 'Vui lòng nhập đơn giá ca' }]}
            extra="Ví dụ: 400.000đ cho bác sĩ, 200.000đ cho lễ tân"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ / ca"
              min={0}
              step={50000}
            />
          </Form.Item>

          <Form.Item
            name="base_salary"
            label="Lương cứng cơ bản hàng tháng"
            extra="Áp dụng cho nhân viên có lương cố định (hoặc 0đ nếu chỉ khoán ca)"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ / tháng"
              min={0}
              step={500000}
            />
          </Form.Item>

          <Form.Item
            name="commission_per_patient"
            label="Hoa hồng / 1 lượt bệnh nhân khám hoàn thành"
            extra="Ví dụ: thưởng 50.000đ trên mỗi ca khám thành công"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ / BN"
              min={0}
              step={10000}
            />
          </Form.Item>

          <Form.Item
            name="allowance"
            label="Phụ cấp hàng tháng (ăn trưa, trách nhiệm)"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ"
              min={0}
              step={100000}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú chế độ đãi ngộ">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú hoặc thỏa thuận riêng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận chi trả lương */}
      <Modal
        title={`Xác nhận Chi trả lương: ${selectedPayroll?.user_name}`}
        open={payModalVisible}
        onCancel={() => setPayModalVisible(false)}
        onOk={handleConfirmPay}
        okText="Xác nhận đã thanh toán"
        cancelText="Đóng"
      >
        {selectedPayroll && (
          <div>
            <div style={{ textAlign: 'center', padding: '16px 0', background: '#f0fdf4', borderRadius: 8, marginBottom: 16 }}>
              <Text type="secondary">Số tiền thực lĩnh cần chi trả:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                {formatMoney(selectedPayroll.net_salary)}
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Kỳ lương: Tháng {selectedPayroll.month}/{selectedPayroll.year}
              </Text>
            </div>

            <Form form={payForm} layout="vertical">
              <Form.Item
                name="payment_method"
                label="Phương thức chi trả"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Chuyển khoản QR ngân hàng">Chuyển khoản QR ngân hàng</Option>
                  <Option value="Tiền mặt">Tiền mặt tại quầy</Option>
                </Select>
              </Form.Item>
              <Form.Item name="note" label="Ghi chú thanh toán">
                <Input.TextArea rows={2} placeholder="Nhập mã giao dịch hoặc ghi chú..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Modal xem Phiếu lương chi tiết */}
      <Modal
        title="PHIẾU LƯƠNG NHÂN SỰ CHI TIẾT"
        open={slipModalVisible}
        onCancel={() => setSlipModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSlipModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={650}
      >
        {slipData && (
          <div style={{ padding: 10 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Title level={4} style={{ margin: 0, color: '#003366' }}>
                PHÒNG KHÁM NHA KHOA ĐẠI HỌC KIẾN TRÚC
              </Title>
              <Text type="secondary">
                Phiếu thanh toán thu nhập tháng {slipData.month}/{slipData.year}
              </Text>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Họ và tên">
                <strong style={{ color: '#003366' }}>{slipData.user_name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                <Tag color="blue">{slipData.user_role_display}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{slipData.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Chuyên khoa">{slipData.specialty || '-'}</Descriptions.Item>
              <Descriptions.Item label="Số ca làm việc trong tháng" span={2}>
                <strong>{Number(slipData.total_shifts)} ca</strong> (Ca sáng: {slipData.morning_shifts}, Ca chiều: {slipData.afternoon_shifts})
              </Descriptions.Item>
              <Descriptions.Item label="Số bệnh nhân đã phục vụ/khám" span={2}>
                <Tag color="cyan">{slipData.total_patients_examined} bệnh nhân</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đơn giá / 1 ca trực">
                {formatMoney(slipData.shift_rate_applied)}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền lương ca trực">
                <strong>{formatMoney(slipData.shift_salary)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Lương cứng cơ bản">
                {formatMoney(slipData.base_salary)}
              </Descriptions.Item>
              <Descriptions.Item label="Hoa hồng lượt khám">
                +{formatMoney(slipData.commission_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ cấp">
                +{formatMoney(slipData.allowance)}
              </Descriptions.Item>
              <Descriptions.Item label="Thưởng thêm">
                +{formatMoney(slipData.bonus)}
              </Descriptions.Item>
              <Descriptions.Item label="Khấu trừ / Phạt" span={2}>
                -{formatMoney(slipData.deduction)}
              </Descriptions.Item>
              <Descriptions.Item label="TỔNG THỰC LĨNH" span={2}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                  {formatMoney(slipData.net_salary)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái chi trả">
                <Tag color={slipData.status === 'paid' ? 'green' : 'orange'}>
                  {slipData.status_display}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức chi trả">
                {slipData.payment_method || 'Chưa chi trả'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}