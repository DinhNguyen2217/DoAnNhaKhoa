import { useState, useEffect } from 'react'
import {
  Card, Tag, Typography, Divider, Spin, Alert, Row, Col, Space, Badge, Button, Empty
} from 'antd'
import {
  MedicineBoxOutlined, FileTextOutlined, HistoryOutlined,
  CalendarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarCircleOutlined, CreditCardOutlined, AuditOutlined
} from '@ant-design/icons'
import { getMedicalRecords } from '../../api/medical'
import { formatDate, formatDateTime, formatMoney } from '../../utils/helpers'

const { Title, Text, Paragraph } = Typography

export default function PatientMedicalRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await getMedicalRecords()
      const data = res?.data?.results || res?.data || []
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lỗi khi tải bệnh án:', err)
      setErrorMsg('Không thể kết nối đến máy chủ lấy thông tin hồ sơ bệnh án. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#003366', fontWeight: 500 }}>
          Đang tải hồ sơ bệnh án điện tử...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #005599 100%)',
        color: '#fff',
        padding: '24px 28px',
        borderRadius: 14,
        marginBottom: 24,
        boxShadow: '0 4px 14px rgba(0, 51, 102, 0.15)'
      }}>
        <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
          HỒ SƠ BỆNH ÁN & LỊCH SỬ KHÁM BỆNH
        </Title>
        <Paragraph style={{ color: '#e0edff', margin: '8px 0 0', fontSize: 14 }}>
          Thông tin chi tiết về từng đợt khám: Bác sĩ phụ trách, chẩn đoán bệnh lý, thủ thuật can thiệp, đơn thuốc và quyết toán chi phí khám chữa bệnh.
        </Paragraph>
      </div>

      {errorMsg && (
        <Alert
          type="error"
          showIcon
          message="Thông báo lỗi"
          description={errorMsg}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {records.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '50px 20px', border: '1px dashed #cbd5e1' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={5} style={{ color: '#64748b', marginBottom: 6 }}>
                  Bạn chưa có hồ sơ bệnh án nào tại phòng khám
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Sau khi bạn đến khám tại phòng khám và bác sĩ hoàn tất phiếu khám lâm sàng, thông tin bệnh án và chi phí điều trị sẽ được cập nhật tự động tại đây.
                </Text>
              </div>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {records.map((rec, index) => {
            const dateStr = rec.appointment_date || rec.created_at
            const toothStatus = rec.tooth_status || rec.teeth_description
            const treatment = rec.treatment_performed || rec.treatment_notes
            const followUpNote = rec.follow_up_notes || rec.next_appointment_note
            const prescription = rec.prescription
            const isPaid = rec.payment_status === 'paid'

            return (
              <Card
                key={rec.id || index}
                style={{
                  borderRadius: 14,
                  boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
                headStyle={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '14px 20px'
                }}
                title={
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <Space size="middle">
                      <MedicineBoxOutlined style={{ color: '#003366', fontSize: 20 }} />
                      <div>
                        <span style={{ fontSize: 16, color: '#003366', fontWeight: 700 }}>
                          Đợt khám ngày: {formatDate(dateStr)}
                        </span>
                        {rec.appointment_session && (
                          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8, fontWeight: 'normal' }}>
                            ({rec.appointment_session})
                          </span>
                        )}
                      </div>
                    </Space>
                    <Space>
                      {rec.invoice_number && (
                        <Tag color="cyan" icon={<AuditOutlined />}>
                          Số HĐ: {rec.invoice_number}
                        </Tag>
                      )}
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Bác sĩ đã hoàn tất bệnh án
                      </Tag>
                    </Space>
                  </div>
                }
              >
                {/* 1. THÔNG TIN BÁC SĨ & LỊCH KHÁM */}
                <div style={{
                  background: '#f0f7ff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #bae0ff'
                }}>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12}>
                      <Space align="start">
                        <UserOutlined style={{ color: '#005599', marginTop: 3 }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Bác sĩ khám & điều trị:</Text>
                          <div>
                            <strong style={{ color: '#003366', fontSize: 14 }}>
                              BS. {rec.doctor_name || 'Bác sĩ chuyên khoa'}
                            </strong>
                            {rec.doctor_specialty && (
                              <span style={{ color: '#475569', fontSize: 13, marginLeft: 6 }}>
                                ({rec.doctor_specialty})
                              </span>
                            )}
                          </div>
                        </div>
                      </Space>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space align="start">
                        <CalendarOutlined style={{ color: '#005599', marginTop: 3 }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Dịch vụ khám / Hạng mục:</Text>
                          <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>
                            {rec.service_name || 'Khám & Tư vấn tổng quát'}
                          </div>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                  {rec.chief_complaint && (
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed #d0e2ff', fontSize: 13 }}>
                      <Text type="secondary">Lý do khám / Triệu chứng ban đầu:</Text>{' '}
                      <span style={{ color: '#334155' }}>{rec.chief_complaint}</span>
                    </div>
                  )}
                </div>

                {/* 2. NỘI DUNG KHÁM & ĐIỀU TRỊ */}
                <div style={{
                  background: '#fafafa',
                  padding: '16px',
                  borderRadius: 10,
                  border: '1px solid #f0f0f0',
                  marginBottom: 16
                }}>
                  <Title level={5} style={{ margin: '0 0 10px', color: '#003366', fontSize: 14 }}>
                    NỘI DUNG CHẨN ĐOÁN & THỦ THUẬT ĐIỀU TRỊ
                  </Title>

                  <div style={{ marginBottom: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Kết luận chẩn đoán bệnh lý chính:</Text>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#cf1322',
                      background: '#fff1f0',
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #ffa39e',
                      marginTop: 4
                    }}>
                      {rec.diagnosis || 'Đang cập nhật'}
                    </div>
                  </div>

                  {toothStatus && (
                    <p style={{ margin: '8px 0 4px', fontSize: 13 }}>
                      <Text strong style={{ color: '#334155' }}>Vị trí răng can thiệp / Tình trạng:</Text>{' '}
                      <span style={{ color: '#1e293b' }}>{toothStatus}</span>
                    </p>
                  )}

                  {treatment && (
                    <p style={{ margin: '8px 0 4px', fontSize: 13 }}>
                      <Text strong style={{ color: '#334155' }}>Thủ thuật & Phương pháp đã điều trị:</Text>{' '}
                      <span style={{ color: '#166534', fontWeight: 600 }}>{treatment}</span>
                    </p>
                  )}

                  {rec.notes && (
                    <p style={{ margin: '8px 0 4px', fontSize: 13 }}>
                      <Text strong style={{ color: '#334155' }}>Lời dặn dò của bác sĩ:</Text>{' '}
                      <span style={{ fontStyle: 'italic', color: '#475569' }}>{rec.notes}</span>
                    </p>
                  )}

                  {(rec.follow_up_date || followUpNote) && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #d9d9d9' }}>
                      <Tag color="orange" icon={<CalendarOutlined />}>
                        Hẹn tái khám: {rec.follow_up_date ? formatDate(rec.follow_up_date) : 'Theo chỉ định của bác sĩ'}
                      </Tag>
                      {followUpNote && (
                        <span style={{ fontSize: 13, color: '#d46b08', marginLeft: 8 }}>
                          Ghi chú: {followUpNote}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. ĐƠN THUỐC ĐIỆN TỬ */}
                {prescription && (prescription.items?.length > 0 || prescription.notes) && (
                  <div style={{
                    background: '#f6ffed',
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 16,
                    border: '1px solid #b7eb8f'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <FileTextOutlined style={{ color: '#389e0d', fontSize: 16 }} />
                      <Text strong style={{ color: '#135200', fontSize: 14 }}>
                        Đơn thuốc điện tử kèm theo:
                      </Text>
                    </div>

                    {prescription.items && prescription.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {prescription.items.map((it, idx) => (
                          <div
                            key={it.id || idx}
                            style={{
                              fontSize: 13,
                              padding: '6px 12px',
                              background: '#fff',
                              borderRadius: 6,
                              border: '1px solid #d9f7be'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#135200' }}>
                              {idx + 1}. {it.medicine_name}
                            </span>
                            {it.dosage && <span style={{ color: '#555', marginLeft: 6 }}>({it.dosage})</span>}
                            {it.quantity && <span style={{ color: '#0958d9', marginLeft: 8 }}>— SL: {it.quantity}</span>}
                            {it.instructions && (
                              <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
                                Cách dùng: {it.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#135200' }}>
                        {prescription.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. QUYẾT TOÁN CHI PHÍ & SỐ TIỀN */}
                <div style={{
                  background: '#f8fafc',
                  padding: '16px 20px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                    <Space>
                      <DollarCircleOutlined style={{ color: '#0284c7', fontSize: 18 }} />
                      <span style={{ fontWeight: 700, color: '#003366', fontSize: 14 }}>
                        QUYẾT TOÁN CHI PHÍ KHÁM & ĐIỀU TRỊ
                      </span>
                    </Space>
                    <Tag
                      color={isPaid ? 'green' : 'orange'}
                      style={{ padding: '2px 10px', fontSize: 12, fontWeight: 600 }}
                    >
                      {isPaid ? 'ĐÃ THANH TOÁN TẠI PHÒNG KHÁM' : 'CHỜ THANH TOÁN TẠI QUẦY LỄ TÂN'}
                    </Tag>
                  </div>

                  <Row gutter={[16, 12]} align="middle">
                    <Col xs={24} sm={8}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tổng chi phí dịch vụ / Viện phí:</Text>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>
                        {formatMoney(rec.subtotal || 0)}
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tiền đặt cọc trực tuyến đã trừ:</Text>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#16a34a' }}>
                        - {formatMoney(rec.deposit_deducted || 100000)}
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {isPaid ? 'Số tiền thực tế đã thanh toán:' : 'Số tiền thực tế cần thanh toán:'}
                      </Text>
                      <div style={{ fontSize: 18, fontWeight: 700, color: isPaid ? '#0284c7' : '#e11d48' }}>
                        {formatMoney(rec.final_amount !== undefined ? rec.final_amount : Math.max(0, (rec.subtotal || 0) - (rec.deposit_deducted || 100000)))}
                      </div>
                    </Col>
                  </Row>

                  <div style={{
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: '1px dashed #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: '#64748b'
                  }}>
                    <div>
                      {rec.payment_method_display && rec.payment_method_display !== 'Chưa thanh toán' && (
                        <span>Hình thức thanh toán: <strong style={{ color: '#0f172a' }}>{rec.payment_method_display}</strong></span>
                      )}
                      {rec.paid_at && (
                        <span style={{ marginLeft: 12 }}>
                          Thời gian thanh toán: {formatDateTime(rec.paid_at)}
                        </span>
                      )}
                    </div>
                    {rec.invoice_number && (
                      <div style={{ color: '#0284c7', fontWeight: 500 }}>
                        Mã hóa đơn điện tử: {rec.invoice_number}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}