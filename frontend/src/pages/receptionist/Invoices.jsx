import { useState, useEffect } from 'react'
import {
  Table, Card, Button, Tag, Space, Typography, Modal, Select,
  Input, Tabs, Tooltip, Alert, Row, Col, Divider, Statistic, Badge
} from 'antd'
import {
  FileTextOutlined, CheckCircleOutlined, ReloadOutlined, DollarOutlined,
  ClockCircleOutlined, MedicineBoxOutlined, UserOutlined, EyeOutlined,
  QrcodeOutlined
} from '@ant-design/icons'
import { getInvoices, confirmPayment, createFromAppointment } from '../../api/invoices'
import { getAppointments } from '../../api/appointments'
import { formatDate, formatMoney } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

export default function ReceptionistInvoices() {
  const [invoices, setInvoices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending_queue')

  // Modal tính tiền
  const [payModal, setPayModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null) // invoice or appointment
  const [payMethod, setPayMethod] = useState('cash')
  const [submittingPay, setSubmittingPay] = useState(false)

  // Modal xem bệnh án
  const [recordModal, setRecordModal] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resInv, resApp] = await Promise.all([
        getInvoices(),
        getAppointments()
      ])
      setInvoices(resInv.data.results || resInv.data || [])
      setAppointments(resApp.data.results || resApp.data || [])
    } catch {
      toast.error('Không thể tải danh sách hóa đơn và lịch khám.')
    } finally {
      setLoading(false)
    }
  }

  // Danh sách các ca chờ thanh toán: gồm các Invoice status === 'pending'
  // VÀ các Appointment đã hoàn thành khám hoặc đang khám nhưng chưa có Invoice
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending')
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')

  // Lấy các lịch hẹn trong trạng thái checked_in, in_progress, completed nhưng chưa có invoice trong pendingInvoices
  const appointmentsNeedingBilling = appointments.filter(app => {
    if (app.status === 'cancelled') return false
    // Kiểm tra đã có trong invoices chưa
    const hasInvoice = invoices.some(inv => inv.appointment === app.id)
    return !hasInvoice && (app.status === 'completed' || app.status === 'checked_in' || app.status === 'in_progress')
  })

  // Mở modal thanh toán
  const handleOpenPay = async (item) => {
    // Nếu item là Appointment chưa có Invoice:
    if (!item.invoice_number && item.id) {
      if (!item.has_medical_record) {
        toast.error('Bác sĩ chưa cập nhật hồ sơ bệnh án cho lượt khám này. Lễ tân chưa thể tính tiền!')
        return
      }
      try {
        setLoading(true)
        const res = await createFromAppointment(item.id)
        setSelectedItem(res.data)
        setPayMethod('cash')
        setPayModal(true)
        fetchData()
      } catch (err) {
        const msg = err.response?.data?.detail || 'Lỗi khi tạo hóa đơn tính tiền.'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
      return
    }

    // Nếu item đã là Invoice
    setSelectedItem(item)
    setPayMethod('cash')
    setPayModal(true)
  }

  const handleConfirmPay = async () => {
    if (!selectedItem?.id) return
    setSubmittingPay(true)
    try {
      await confirmPayment(selectedItem.id, {
        payment_method: payMethod,
        notes: `Lễ tân xác nhận đã thu đủ viện phí tại quầy qua hình thức ${payMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}`
      })
      toast.success('Xác nhận thanh toán hóa đơn viện phí thành công!')
      setPayModal(false)
      fetchData()
    } catch {
      toast.error('Lỗi khi cập nhật thanh toán hóa đơn.')
    } finally {
      setSubmittingPay(false)
    }
  }

  const handleViewMedicalRecord = (item) => {
    const medInfo = item.medical_record_info || (item.appointment_info?.medical_record_info)
    setViewRecord({
      patientName: item.patient_name || item.patient_info?.full_name,
      doctorName: item.doctor_name || item.doctor_info?.user?.first_name,
      serviceName: item.appointment_info?.service_name || item.service_info?.name,
      ...medInfo
    })
    setRecordModal(true)
  }

  // Cột cho Bảng hàng chờ tính tiền (Pending Queue)
  const pendingColumns = [
    {
      title: 'Mã hẹn / HĐ',
      key: 'code',
      render: (_, r) => (
        <div>
          <strong style={{ color: '#0f5132' }}>{r.invoice_number || `Hẹn #${r.id}`}</strong>
        </div>
      )
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => {
        const name = r.patient_name || r.patient_info?.full_name || 'Bệnh nhân'
        const phone = r.appointment_info?.patient_phone || r.patient_info?.user?.phone || '-'
        return (
          <div>
            <Text strong>{name}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>SĐT: {phone}</div>
          </div>
        )
      }
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_, r) => (
        <span style={{ color: '#003a8c', fontWeight: 600 }}>
          BS. {r.doctor_name || r.doctor_info?.user?.first_name || 'Chuyên khoa'}
        </span>
      )
    },
    {
      title: 'Dịch vụ khám',
      key: 'service',
      render: (_, r) => (
        <Tag color="cyan">
          {r.appointment_info?.service_name || r.service_info?.name || r.items?.[0]?.description || 'Khám nha khoa'}
        </Tag>
      )
    },
    {
      title: 'Hồ sơ bệnh án của Bác sĩ',
      key: 'medical_record',
      render: (_, r) => {
        const hasRecord = r.has_medical_record || (r.medical_record_info !== null && r.medical_record_info !== undefined)
        if (hasRecord) {
          return (
            <Space direction="vertical" size={2}>
              <Tag color="green" icon={<CheckCircleOutlined />}>Bác sĩ đã hoàn tất bệnh án</Tag>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewMedicalRecord(r)}
                style={{ padding: 0, fontSize: 12 }}
              >
                Xem chi tiết bệnh án
              </Button>
            </Space>
          )
        }
        return (
          <Tooltip title="Bác sĩ đang khám bệnh hoặc chưa lưu hồ sơ bệnh án. Lễ tân cần chờ bác sĩ khám xong mới có thể tính tiền!">
            <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ bác sĩ cập nhật bệnh án</Tag>
          </Tooltip>
        )
      }
    },
    {
      title: 'Chi phí tính toán',
      key: 'money',
      render: (_, r) => {
        const subtotal = r.subtotal || r.appointment_info?.service_price || r.service_info?.price || 0
        const deposit = r.deposit_deducted !== undefined ? r.deposit_deducted : (r.deposit_status === 'verified' ? 100000 : 0)
        const finalAmt = r.final_amount !== undefined ? r.final_amount : Math.max(0, subtotal - deposit)

        return (
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Tổng phí: {formatMoney(subtotal)}</div>
            <div style={{ fontSize: 12, color: '#d46b08' }}>Đã trừ cọc: -{formatMoney(deposit)}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#eb2f96' }}>
              Cần thu: {formatMoney(finalAmt)}
            </div>
          </div>
        )
      }
    },
    {
      title: 'Thao tác thu tiền',
      key: 'action',
      render: (_, r) => {
        const hasRecord = r.has_medical_record || (r.medical_record_info !== null && r.medical_record_info !== undefined)

        if (hasRecord) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleOpenPay(r)}
              style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 600 }}
            >
              Tính tiền & Thu viện phí
            </Button>
          )
        }

        return (
          <Tooltip title="Bác sĩ chưa hoàn tất khám và lưu bệnh án. Phải cập nhật bệnh án thì lễ tân mới biết cách tính tiền!">
            <Button size="small" disabled style={{ background: '#f5f5f5', color: '#bfbfbf' }}>
              Chờ bác sĩ khám
            </Button>
          </Tooltip>
        )
      }
    }
  ]

  // Cột cho Tab Lịch sử đã thanh toán (Paid)
  const paidColumns = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (num) => <Text strong style={{ color: '#0f5132' }}>{num}</Text>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => (
        <div>
          <Text strong>{r.patient_name || 'Bệnh nhân'}</Text>
          <div style={{ fontSize: 12, color: '#888' }}>SĐT: {r.appointment_info?.patient_phone || '-'}</div>
        </div>
      )
    },
    {
      title: 'Bác sĩ điều trị',
      key: 'doctor',
      render: (_, r) => `BS. ${r.doctor_name || 'Chuyên khoa'}`
    },
    {
      title: 'Tổng tiền dịch vụ',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (t) => formatMoney(t)
    },
    {
      title: 'Đã trừ cọc trực tuyến',
      dataIndex: 'deposit_deducted',
      key: 'deposit',
      render: (d) => <Text style={{ color: '#d46b08' }}>- {formatMoney(d)}</Text>
    },
    {
      title: 'Số tiền thực thu tại quầy',
      dataIndex: 'final_amount',
      key: 'final',
      render: (f) => <Text strong style={{ color: '#eb2f96', fontSize: 14 }}>{formatMoney(f)}</Text>
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'method',
      render: (m) => m === 'transfer' ? <Tag color="blue">Chuyển khoản / QR</Tag> : <Tag color="green">Tiền mặt tại quầy</Tag>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="success">✓ Đã thanh toán</Tag>
    },
    {
      title: 'Chi tiết',
      key: 'view',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewMedicalRecord(r)}>
          Xem bệnh án
        </Button>
      )
    }
  ]

  // Gộp danh sách chờ thanh toán: pendingInvoices + appointmentsNeedingBilling
  const allPendingItems = [
    ...pendingInvoices,
    ...appointmentsNeedingBilling
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f5132' }}>QUẢN LÝ HÓA ĐƠN & TÍNH TIỀN VIỆN PHÍ</Title>
          <Text type="secondary">
            Quy trình thanh toán: Chỉ tính tiền khi Bác sĩ đã hoàn tất khám lâm sàng và cập nhật Hồ sơ bệnh án
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>Làm mới danh sách</Button>
      </div>

      <Alert
        message="Nguyên tắc tính viện phí chuẩn y khoa:"
        description="Khi bệnh nhân đến khám, bác sĩ sẽ ghi nhận chẩn đoán, thủ thuật đã làm và đơn thuốc vào Hồ sơ bệnh án. Hệ thống tự động chuyển dữ liệu sang quầy Lễ tân, đối trừ 100.000đ tiền cọc và xác định số tiền thực thu. Nếu bác sĩ chưa lưu bệnh án, lễ tân chưa thể tính tiền."
        type="info"
        showIcon
        style={{ marginBottom: 20, borderRadius: 10 }}
      />

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'pending_queue',
              label: (
                <span>
                  Chờ thanh toán & Tính viện phí{' '}
                  <Badge count={allPendingItems.length} overflowCount={99} style={{ backgroundColor: '#fa8c16' }} />
                </span>
              ),
              children: (
                <Table
                  columns={pendingColumns}
                  dataSource={allPendingItems}
                  rowKey={(r) => r.invoice_number ? `inv_${r.id}` : `app_${r.id}`}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Hiện không có ca khám nào đang chờ thanh toán.' }}
                />
              )
            },
            {
              key: 'paid_history',
              label: (
                <span>
                  Lịch sử hóa đơn đã thanh toán{' '}
                  <Badge count={paidInvoices.length} overflowCount={99} style={{ backgroundColor: '#52c41a' }} />
                </span>
              ),
              children: (
                <Table
                  columns={paidColumns}
                  dataSource={paidInvoices}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Chưa có hóa đơn nào đã thanh toán.' }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* Modal Tính tiền & Thu viện phí */}
      <Modal
        title={
          <div style={{ color: '#0f5132', fontSize: 16 }}>
            PHIẾU TÍNH TIỀN & XÁC NHẬN THU VIỆN PHÍ — {selectedItem?.invoice_number || `MÃ HẸN #${selectedItem?.id}`}
          </div>
        }
        open={payModal}
        onCancel={() => setPayModal(false)}
        width={650}
        footer={[
          <Button key="cancel" onClick={() => setPayModal(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={submittingPay}
            onClick={handleConfirmPay}
            style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 700 }}
          >
            Xác nhận đã nhận đủ tiền & Hoàn tất
          </Button>
        ]}
      >
        {selectedItem && (
          <div style={{ padding: '8px 0' }}>
            {/* Thông tin bệnh nhân & Bác sĩ */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">Bệnh nhân:</Text>{' '}
                  <strong style={{ color: '#003a8c', fontSize: 14 }}>
                    {selectedItem.patient_name || selectedItem.patient_info?.full_name}
                  </strong>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Bác sĩ khám:</Text>{' '}
                  <strong style={{ color: '#003a8c' }}>
                    BS. {selectedItem.doctor_name || selectedItem.doctor_info?.user?.first_name || 'Chuyên khoa'}
                  </strong>
                </Col>
              </Row>

              {/* Thông tin bệnh án liên quan */}
              {selectedItem.medical_record_info && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #cbd5e1', fontSize: 13 }}>
                  <div>Chẩn đoán của bác sĩ: <strong style={{ color: '#cf1322' }}>{selectedItem.medical_record_info.diagnosis}</strong></div>
                  {selectedItem.medical_record_info.treatment_performed && (
                    <div style={{ marginTop: 2 }}>Thủ thuật đã làm: <span style={{ color: '#15803d', fontWeight: 600 }}>{selectedItem.medical_record_info.treatment_performed}</span></div>
                  )}
                </div>
              )}
            </div>

            {/* Bảng chi tiết tính tiền */}
            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <Title level={5} style={{ margin: '0 0 12px', color: '#0f5132' }}>BẢNG KÊ CHI PHÍ VIỆN PHÍ</Title>

              {/* Danh sách mục nếu có items */}
              {selectedItem.items && selectedItem.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {selectedItem.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>{idx + 1}. {it.description}</span>
                      <strong style={{ color: '#333' }}>{formatMoney(it.subtotal)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span>Phí dịch vụ nha khoa</span>
                  <strong>{formatMoney(selectedItem.subtotal)}</strong>
                </div>
              )}

              <Divider style={{ margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, margin: '4px 0' }}>
                <span>Tổng chi phí dịch vụ:</span>
                <strong>{formatMoney(selectedItem.subtotal)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, margin: '4px 0', color: '#d46b08' }}>
                <span>Khấu trừ tiền cọc trực tuyến đã nộp:</span>
                <strong>- {formatMoney(selectedItem.deposit_deducted || 100000)}</strong>
              </div>

              <Divider style={{ margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f5132' }}>SỐ TIỀN THỰC THU TẠI QUẦY:</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#eb2f96' }}>
                  {formatMoney(selectedItem.final_amount || selectedItem.total_amount)}
                </span>
              </div>
            </div>

            {/* Chọn hình thức thanh toán */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Hình thức thanh toán tại quầy lễ tân:
              </label>
              <Select value={payMethod} onChange={setPayMethod} style={{ width: '100%' }} size="large">
                <Option value="cash">💵 Tiền mặt tại quầy lễ tân</Option>
                <Option value="transfer">💳 Chuyển khoản ngân hàng / Quét mã QR VietQR</Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xem chi tiết Hồ sơ bệnh án */}
      <Modal
        title="CHI TIẾT HỒ SƠ BỆNH ÁN LÂM SÀNG"
        open={recordModal}
        onCancel={() => setRecordModal(false)}
        footer={[
          <Button key="close" onClick={() => setRecordModal(false)}>
            Đóng
          </Button>
        ]}
      >
        {viewRecord && (
          <div style={{ lineHeight: 1.8, fontSize: 13 }}>
            <p>Bệnh nhân: <strong style={{ color: '#003a8c' }}>{viewRecord.patientName}</strong></p>
            <p>Bác sĩ điều trị: <strong style={{ color: '#003a8c' }}>BS. {viewRecord.doctorName}</strong></p>
            <Divider style={{ margin: '10px 0' }} />
            <p>Chẩn đoán bệnh lý: <strong style={{ color: '#cf1322', fontSize: 14 }}>{viewRecord.diagnosis || 'Chưa ghi nhận'}</strong></p>
            <p>Vị trí răng can thiệp: <strong>{viewRecord.tooth_status || 'Không có'}</strong></p>
            <p>Thủ thuật điều trị: <strong style={{ color: '#15803d' }}>{viewRecord.treatment_performed || 'Không có'}</strong></p>
            <p>Lời dặn của bác sĩ: <em>{viewRecord.notes || 'Không có'}</em></p>
            {viewRecord.follow_up_date && (
              <p>Ngày hẹn tái khám: <Tag color="orange">{formatDate(viewRecord.follow_up_date)}</Tag></p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
