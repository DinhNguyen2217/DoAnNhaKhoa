import { useState, useEffect } from 'react'
import {
  Card, Form, Input, Button, Select, Typography, Row, Col, Space,
  Divider, Alert, Spin, Tag, DatePicker, Tooltip
} from 'antd'
import {
  MedicineBoxOutlined, CheckCircleOutlined, UserOutlined, FileTextOutlined,
  ClockCircleOutlined, AlertOutlined, SmileOutlined, ReloadOutlined
} from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { getAppointments, updateAppointment } from '../../api/appointments'
import { createMedicalRecord, getMedicalRecords } from '../../api/medical'
import { formatDate, formatMoney } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

export default function DoctorExamination() {
  const [appointments, setAppointments] = useState([])
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingRecord, setExistingRecord] = useState(null)
  const [form] = Form.useForm()
  const location = useLocation()

  useEffect(() => {
    fetchWaitingPatients()
  }, [])

  // Khi chọn một bệnh nhân, điền sẵn thông tin hoặc nạp bệnh án cũ nếu có
  useEffect(() => {
    if (!selectedAppId) return

    const app = appointments.find(a => a.id === selectedAppId)
    if (!app) return

    // Kiểm tra xem lượt khám này đã có bệnh án chưa
    if (app.has_medical_record) {
      fetchExistingRecord(app.id)
    } else {
      setExistingRecord(null)
      form.setFieldsValue({
        chief_complaint: app.reason || '',
        diagnosis: '',
        tooth_status: '',
        treatment_performed: app.service_info?.name || app.service?.name ? `Thực hiện ${app.service_info?.name || app.service?.name}` : '',
        notes: '',
        follow_up_date: null,
        follow_up_notes: '',
        medicines: '',
        advice: ''
      })
    }
  }, [selectedAppId, appointments])

  const fetchExistingRecord = async (appointmentId) => {
    try {
      const res = await getMedicalRecords({ appointment: appointmentId })
      const records = res.data.results || res.data || []
      const found = records.find(r => r.appointment === appointmentId)
      if (found) {
        setExistingRecord(found)
        form.setFieldsValue({
          chief_complaint: found.chief_complaint || '',
          diagnosis: found.diagnosis || '',
          tooth_status: found.tooth_status || '',
          treatment_performed: found.treatment_performed || '',
          notes: found.notes || '',
          follow_up_date: found.follow_up_date ? dayjs(found.follow_up_date) : null,
          follow_up_notes: found.follow_up_notes || '',
          medicines: found.prescription?.items?.map(it => `${it.medicine_name} (${it.dosage || ''}) - ${it.instructions || ''}`).join('\n') || found.prescription?.notes || '',
          advice: found.prescription?.notes || ''
        })
      }
    } catch {
      // ignore
    }
  }

  const fetchWaitingPatients = async () => {
    setLoading(true)
    try {
      const res = await getAppointments()
      const list = res.data.results || res.data || []

      // Lọc các bệnh nhân: checked_in (ưu tiên), in_progress, confirmed, hoặc đã hoàn thành gần đây
      const activeList = list.filter(a =>
        a.status === 'checked_in' ||
        a.status === 'in_progress' ||
        a.status === 'confirmed' ||
        a.status === 'completed'
      )

      setAppointments(activeList)

      // Nếu có appointmentId truyền qua router state thì chọn luôn
      const targetId = location.state?.appointmentId
      if (targetId && activeList.some(a => a.id === targetId)) {
        setSelectedAppId(targetId)
      } else if (activeList.length > 0 && !selectedAppId) {
        // Ưu tiên chọn bệnh nhân đang có mặt tại quầy (checked_in)
        const checkedInPatient = activeList.find(a => a.status === 'checked_in')
        setSelectedAppId(checkedInPatient ? checkedInPatient.id : activeList[0].id)
      }
    } catch {
      toast.error('Không thể tải danh sách bệnh nhân chờ khám.')
    } finally {
      setLoading(false)
    }
  }

  const currentApp = appointments.find(a => a.id === selectedAppId)

  const handleFinishExam = async (values) => {
    if (!selectedAppId) {
      toast.error('Vui lòng chọn một bệnh nhân để thực hiện khám.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        appointment: selectedAppId,
        chief_complaint: values.chief_complaint || '',
        diagnosis: values.diagnosis,
        tooth_status: values.tooth_status || '',
        treatment_performed: values.treatment_performed || '',
        notes: values.notes || '',
        follow_up_date: values.follow_up_date ? values.follow_up_date.format('YYYY-MM-DD') : null,
        follow_up_notes: values.follow_up_notes || '',
        medicines: values.medicines || '',
        advice: values.advice || ''
      }

      await createMedicalRecord(payload)

      toast.success(
        'Đã hoàn thành lượt khám & lưu hồ sơ bệnh án thành công! Dữ liệu đã lập tức chuyển sang Lễ tân để tính tiền và đồng bộ sang Bệnh nhân.',
        { duration: 5000 }
      )

      fetchWaitingPatients()
    } catch (err) {
      const msg = err.response?.data?.appointment?.[0] || err.response?.data?.detail || 'Lỗi khi lưu kết quả khám bệnh. Vui lòng kiểm tra lại.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" tip="Đang tải dữ liệu phòng khám..." /></div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#003a8c' }}>PHÒNG KHÁM BỆNH & BỆNH ÁN ĐIỆN TỬ</Title>
        <Text type="secondary">
          Bác sĩ chẩn đoán, ghi nhận điều trị và kê đơn thuốc. Hồ sơ sau khi lưu sẽ đồng bộ ngay lập tức sang quầy Lễ tân để lập hóa đơn tính tiền và cập nhật vào Sổ bệnh án của bệnh nhân.
        </Text>
      </div>

      <Row gutter={24}>
        {/* Cột trái: Danh sách bệnh nhân chờ khám */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: '#003a8c' }} />
                <span>Danh sách chờ khám ({appointments.length})</span>
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 16 }}
            extra={<Button size="small" icon={<ReloadOutlined />} onClick={fetchWaitingPatients}>Làm mới</Button>}
          >
            {appointments.length === 0 ? (
              <Alert message="Hiện không có bệnh nhân nào trong danh sách khám hôm nay." type="info" showIcon />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
                {appointments.map(app => {
                  const pInfo = app.patient_info || app.patient
                  const name = pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`.trim() || pInfo?.user?.username || 'Bệnh nhân'
                  const isSelected = selectedAppId === app.id

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: isSelected ? '2px solid #1677ff' : '1px solid #e2e8f0',
                        background: isSelected ? '#e6f4ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 2px 8px rgba(22,119,255,0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ color: isSelected ? '#003a8c' : '#1f2937', fontSize: 14 }}>
                          {name}
                        </Text>
                        <Tag color="blue" style={{ margin: 0 }}>#{app.id}</Tag>
                      </div>

                      <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
                        Dịch vụ: <strong>{app.service_info?.name || app.service?.name || 'Khám nha khoa'}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          Ca: {app.session === 'morning' ? 'Sáng' : 'Chiều'} ({formatDate(app.appointment_date)})
                        </span>

                        {app.status === 'checked_in' && (
                          <Tag color="green" icon={<CheckCircleOutlined />}>Đã đến quầy</Tag>
                        )}
                        {app.status === 'in_progress' && (
                          <Tag color="geekblue" icon={<ClockCircleOutlined />}>Đang khám</Tag>
                        )}
                        {app.status === 'completed' && (
                          <Tag color="purple">Đã khám xong</Tag>
                        )}
                        {app.status === 'confirmed' && (
                          <Tag color="orange">Đã xác nhận</Tag>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Chi tiết bệnh nhân được chọn */}
          {currentApp && (
            <Card title="Hồ sơ người bệnh" style={{ borderRadius: 12, background: '#f8fafc' }}>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                <p style={{ margin: '4px 0' }}>
                  Họ tên:{' '}
                  <strong style={{ color: '#003a8c', fontSize: 14 }}>
                    {currentApp.patient_info?.full_name || `${currentApp.patient_info?.user?.first_name || ''} ${currentApp.patient_info?.user?.last_name || ''}`.trim() || 'Bệnh nhân'}
                  </strong>
                </p>
                <p style={{ margin: '4px 0' }}>
                  Số điện thoại: <strong>{currentApp.patient_info?.user?.phone || 'Chưa cập nhật'}</strong>
                </p>
                <p style={{ margin: '4px 0' }}>
                  Giới tính: <strong>{currentApp.patient_info?.gender === 'M' ? 'Nam' : currentApp.patient_info?.gender === 'F' ? 'Nữ' : 'Khác'}</strong>
                  {currentApp.patient_info?.age && ` (${currentApp.patient_info.age} tuổi)`}
                </p>
                <p style={{ margin: '4px 0' }}>
                  Tiền sử dị ứng:{' '}
                  <strong style={{ color: currentApp.patient_info?.allergies ? '#cf1322' : '#52c41a' }}>
                    {currentApp.patient_info?.allergies || 'Không có ghi nhận dị ứng'}
                  </strong>
                </p>
                <p style={{ margin: '4px 0' }}>
                  Lý do khám bệnh nhân ghi:{' '}
                  <span style={{ color: '#d46b08', fontWeight: 600 }}>
                    {currentApp.reason || 'Khám răng tổng quát'}
                  </span>
                </p>
                <p style={{ margin: '4px 0', borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                  Tiền cọc đã nộp: <Tag color="green">100.000đ (Đã khấu trừ)</Tag>
                </p>
              </div>
            </Card>
          )}
        </Col>

        {/* Cột phải: Form khám bệnh và lưu hồ sơ bệnh án */}
        <Col xs={24} md={16}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <MedicineBoxOutlined style={{ color: '#003a8c', fontSize: 18 }} />
                  <span>
                    Phiếu khám lâm sàng & Hồ sơ bệnh án
                    {currentApp && ` — Bệnh nhân #${currentApp.id}`}
                  </span>
                </Space>
                {existingRecord && (
                  <Tag color="success" style={{ fontSize: 13, padding: '2px 10px' }}>
                    ✓ Lượt khám này đã lưu bệnh án
                  </Tag>
                )}
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            {!selectedAppId ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <UserOutlined style={{ fontSize: 50, color: '#bfbfbf', marginBottom: 12 }} />
                <Paragraph type="secondary">Vui lòng chọn một bệnh nhân từ danh sách bên trái để bắt đầu khám bệnh.</Paragraph>
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleFinishExam}>
                <Alert
                  message="Lưu ý quan trọng về tính tiền viện phí:"
                  description="Sau khi bác sĩ hoàn tất và bấm 'Lưu hồ sơ bệnh án', hệ thống sẽ tự động đồng bộ chẩn đoán, thủ thuật điều trị và đơn thuốc sang quầy Lễ tân. Lễ tân dựa vào hồ sơ này để tính toán chi phí, khấu trừ tiền cọc 100.000đ và thu tiền bệnh nhân."
                  type="info"
                  showIcon
                  style={{ marginBottom: 20, borderRadius: 8 }}
                />

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="chief_complaint"
                      label={<Text strong>1. Triệu chứng lâm sàng / Lý do khám chính</Text>}
                    >
                      <Input placeholder="Ví dụ: Đau buốt răng hàm dưới khi uống nước lạnh..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="diagnosis"
                      label={<Text strong style={{ color: '#003a8c' }}>2. Chẩn đoán bệnh lý chính <span style={{ color: 'red' }}>*</span></Text>}
                      rules={[{ required: true, message: 'Bác sĩ vui lòng nhập kết quả chẩn đoán bệnh!' }]}
                    >
                      <Input placeholder="Ví dụ: Sâu ngà răng hàm R46, Viêm nha chu quanh cuống..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="tooth_status"
                  label={<Text strong>3. Tình trạng răng / Vị trí can thiệp</Text>}
                >
                  <Input placeholder="Ví dụ: Răng số 46 vỡ men mặt nhai; Răng 18 mọc lệch má cắn vào niêm mạc..." />
                </Form.Item>

                <Form.Item
                  name="treatment_performed"
                  label={<Text strong style={{ color: '#15803d' }}>4. Thủ thuật & Dịch vụ điều trị đã thực hiện <span style={{ color: 'red' }}>*</span></Text>}
                  rules={[{ required: true, message: 'Vui lòng ghi nhận các thủ thuật / dịch vụ đã thực hiện để Lễ tân tính viện phí!' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Ví dụ: Nạo sạch tổ chức sâu, hàn trám Composite quang trùng hợp R46, làm sạch cao răng 2 hàm..."
                  />
                </Form.Item>

                <Divider orientation="left" style={{ fontSize: 14, color: '#003a8c' }}>
                  <Space><FileTextOutlined /> Kê đơn thuốc điện tử (nếu có)</Space>
                </Divider>

                <Form.Item
                  name="medicines"
                  label="Danh sách thuốc, số lượng & liều dùng"
                >
                  <TextArea
                    rows={3}
                    placeholder={`Ví dụ:
1. Amoxicillin 500mg: Uống 1 viên x 2 lần/ngày sau ăn (10 viên)
2. Paracetamol 500mg: Uống 1 viên khi đau buốt, cách nhau 6 tiếng (6 viên)
3. Nước súc miệng Chlorohexidine 0.12%: Súc miệng ngày 2 lần`}
                  />
                </Form.Item>

                <Form.Item
                  name="advice"
                  label="Lời dặn của bác sĩ sau thủ thuật / Hướng dẫn chăm sóc tại nhà"
                >
                  <Input placeholder="Ví dụ: Kiêng nhai đồ quá cứng ở vùng răng trám trong 24 giờ đầu, chườm lạnh nếu ê buốt..." />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={10}>
                    <Form.Item
                      name="follow_up_date"
                      label="Hẹn ngày tái khám (nếu cần)"
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày tái khám"
                        style={{ width: '100%' }}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={14}>
                    <Form.Item
                      name="follow_up_notes"
                      label="Nội dung hẹn tái khám"
                    >
                      <Input placeholder="Ví dụ: Tái khám đánh bóng mối hàn và kiểm tra khớp cắn sau 7 ngày..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="notes"
                  label="Ghi chú nội bộ của bác sĩ"
                >
                  <Input placeholder="Ghi chú riêng để tiện theo dõi cho các lần khám tiếp theo..." />
                </Form.Item>

                <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    loading={submitting}
                    style={{
                      background: '#52c41a',
                      borderColor: '#52c41a',
                      height: 46,
                      padding: '0 32px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 15
                    }}
                  >
                    {existingRecord ? 'Cập nhật hồ sơ bệnh án' : 'Hoàn thành khám & Lưu bệnh án'}
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
