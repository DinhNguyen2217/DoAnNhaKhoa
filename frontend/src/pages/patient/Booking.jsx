import { useState, useEffect } from 'react'
import {
  Card, Steps, Button, Select, DatePicker, Row, Col, Typography,
  Alert, Divider, Input, Spin, Badge, Space
} from 'antd'
import {
  UserOutlined, CalendarOutlined, CheckCircleOutlined,
  QrcodeOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  MedicineBoxOutlined, ClockCircleOutlined, InfoCircleOutlined,
  SmileOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { getDoctors } from '../../api/doctors'
import { getServices } from '../../api/services'
import { createAppointment, notifyDeposit } from '../../api/appointments'
import { formatMoney } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

export default function PatientBooking() {
  const [currentStep, setCurrentStep] = useState(0)
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState(null)
  const [notifyingDeposit, setNotifyingDeposit] = useState(false)

  // Quản lý dữ liệu bằng React State trực tiếp (Không phụ thuộc Form nội bộ để tránh lỗi)
  // doctorId = 'auto' hoặc null nghĩa là phòng khám tự sắp xếp bác sĩ
  const [doctorId, setDoctorId] = useState('auto')
  const [serviceId, setServiceId] = useState(null)
  const [appointmentDate, setAppointmentDate] = useState(null)
  const [session, setSession] = useState('morning')
  const [note, setNote] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [resDoc, resSer] = await Promise.all([
        getDoctors({ is_available: true }),
        getServices({ is_active: true })
      ])
      const docList = resDoc.data.results || resDoc.data || []
      const serList = resSer.data.results || resSer.data || []
      setDoctors(docList)
      setServices(serList)

      // Điền sẵn nếu người dùng bấm từ thẻ Dịch vụ / Bác sĩ ở Trang chủ
      if (location.state?.doctorId) {
        setDoctorId(location.state.doctorId)
      }
      if (location.state?.serviceId) {
        setServiceId(location.state.serviceId)
      }
    } catch {
      toast.error('Không thể tải danh sách bác sĩ và dịch vụ.')
    } finally {
      setLoading(false)
    }
  }

  // Chuyển từ Bước 1 sang Bước 2 (Chỉ bắt buộc chọn Dịch vụ, Bác sĩ là tùy chọn)
  const handleNextStep = () => {
    if (!serviceId) {
      toast.error('Vui lòng chọn Dịch vụ nha khoa mong muốn ở Bước 1!')
      return
    }
    setCurrentStep(1)
  }

  // Chuyển từ Bước 2 sang Bước 3 (Gửi API tạo lịch hẹn)
  const handleConfirmBooking = async () => {
    if (!appointmentDate) {
      toast.error('Vui lòng bấm chọn Ngày khám ở Bước 2!')
      return
    }

    setSubmitting(true)
    try {
      const formattedDate = dayjs.isDayjs(appointmentDate)
        ? appointmentDate.format('YYYY-MM-DD')
        : dayjs(appointmentDate).format('YYYY-MM-DD')

      const payload = {
        service: serviceId,
        appointment_date: formattedDate,
        session: session || 'morning',
        reason: note || 'Đặt lịch khám trực tuyến'
      }

      // Chỉ gửi doctor khi bệnh nhân đích danh chọn 1 bác sĩ
      if (doctorId && doctorId !== 'auto') {
        payload.doctor = doctorId
      }

      const res = await createAppointment(payload)
      setCreatedAppointment(res.data)
      toast.success('Đặt lịch thành công! Vui lòng chuyển khoản tiền cọc 100.000đ để hoàn tất.')
      setCurrentStep(2)
    } catch (err) {
      const data = err.response?.data
      let msg = 'Lỗi khi tạo lịch hẹn.'
      if (data) {
        if (typeof data === 'object') {
          const firstVal = Object.values(data)[0]
          msg = Array.isArray(firstVal) ? firstVal[0] : firstVal
        } else if (typeof data === 'string') {
          msg = data
        }
      }
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Báo đã chuyển tiền cọc 100k
  const handleNotifyDeposit = async () => {
    if (!createdAppointment?.id) {
      toast.error('Chưa có mã lịch hẹn để gửi thông báo cọc.')
      return
    }
    setNotifyingDeposit(true)
    try {
      await notifyDeposit(createdAppointment.id, {
        note: `Bệnh nhân đã chuyển cọc 100.000đ qua QR (COC LH${createdAppointment.id})`
      })
      toast.success('Đã gửi thông báo đặt cọc đến lễ tân! Vui lòng chờ lễ tân kiểm tra và duyệt lịch hẹn.')
      navigate('/patient/appointments')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Lỗi khi gửi thông báo đặt cọc.'
      toast.error(msg)
    } finally {
      setNotifyingDeposit(false)
    }
  }

  const docObj = (doctorId && doctorId !== 'auto') ? doctors.find(d => d.id === doctorId) : null
  const serObj = services.find(s => s.id === serviceId)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu đặt lịch..." />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Title level={2} style={{ color: '#003366', margin: 0 }}>ĐẶT LỊCH KHÁM NHA KHOA TRỰC TUYẾN</Title>
        <Text type="secondary">Thực hiện từng bước: Chọn dịch vụ & bác sĩ $\rightarrow$ Chọn ngày khám $\rightarrow$ Chuyển cọc 100.000đ</Text>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <Steps
          current={currentStep}
          items={[
            { title: 'Dịch vụ & Bác sĩ' },
            { title: 'Thời gian khám' },
            { title: 'Đặt cọc 100.000đ' },
          ]}
          style={{ marginBottom: 32 }}
        />

        {/* ========================================================
            BƯỚC 1: CHỌN DỊCH VỤ & BÁC SĨ (BÁC SĨ TÙY CHỌN/NGẪU NHIÊN)
        ======================================================== */}
        {currentStep === 0 && (
          <div>
            {/* 1. Chọn Dịch vụ */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                1. Chọn Dịch vụ nha khoa mong muốn <span style={{ color: '#ff4d4f' }}>* (Bắt buộc)</span>
              </label>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="-- Bấm vào đây để chọn dịch vụ nha khoa --"
                value={serviceId || undefined}
                onChange={(val) => setServiceId(val)}
                allowClear
              >
                {services.map(s => (
                  <Option key={s.id} value={s.id}>
                    {s.name} ({s.category || 'Nha khoa'}) — Bảng giá: {formatMoney(s.price)} (~{s.duration_minutes} phút)
                  </Option>
                ))}
              </Select>
            </div>

            {serObj && (
              <div style={{ background: '#f6ffed', padding: '12px 16px', borderRadius: 8, marginBottom: 24, borderLeft: '4px solid #52c41a' }}>
                <Text strong style={{ color: '#389e0d' }}>Mô tả kỹ thuật dịch vụ:</Text>
                <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
                  {serObj.description || 'Dịch vụ được thực hiện bởi bác sĩ chuyên khoa với đầy đủ trang thiết bị hỗ trợ chuyên dụng.'}
                </div>
              </div>
            )}

            {/* 2. Chọn Bác sĩ (Tùy chọn) */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>
                  2. Chọn Bác sĩ phụ trách <span style={{ color: '#888', fontWeight: 'normal' }}>(Không bắt buộc)</span>
                </label>
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  ✓ Tối đa 10 bệnh nhân/ca/bác sĩ (20 BN/ngày)
                </span>
              </div>

              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="Chọn bác sĩ hoặc để phòng khám tự sắp xếp"
                value={doctorId}
                onChange={(val) => setDoctorId(val)}
              >
                <Option value="auto">
                  ✨ Phòng khám tự sắp xếp bác sĩ chuyên khoa phù hợp (Khuyên dùng)
                </Option>
                {doctors.map(d => (
                  <Option key={d.id} value={d.id}>
                    BS. {d.user?.first_name} {d.user?.last_name || d.user?.username} — Chuyên khoa: {d.specialty} ({d.experience_years} năm KN) — Phí khám: {formatMoney(d.consultation_fee)}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Thông báo giải thích khi chọn Tự sắp xếp */}
            {(!doctorId || doctorId === 'auto') ? (
              <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 8, marginBottom: 24, borderLeft: '4px solid #52c41a', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SmileOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                  <Text strong style={{ color: '#15803d', fontSize: 14 }}>Chế độ thông minh: Phòng khám tự động điều phối bác sĩ</Text>
                </div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>
                  Hệ thống sẽ tự động chỉ định bác sĩ đúng chuyên môn còn trống lịch trong ca khám bạn chọn (đảm bảo không quá 10 bệnh nhân/ca). Bạn không cần bận tâm về việc bác sĩ nào có ca trực vào ngày đó.
                </div>
              </div>
            ) : (
              docObj && (
                <div style={{ background: '#f0f5ff', padding: '12px 16px', borderRadius: 8, marginBottom: 24, borderLeft: '4px solid #1890ff' }}>
                  <Text strong style={{ color: '#003366' }}>Hồ sơ chuyên môn bác sĩ:</Text>
                  <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
                    {docObj.description || 'Chuyên gia nha khoa giàu kinh nghiệm trong chẩn đoán và điều trị kỹ thuật cao.'}
                  </div>
                </div>
              )
            )}

            <div style={{ textAlign: 'right', marginTop: 28 }}>
              <Button
                type="primary"
                size="large"
                onClick={handleNextStep}
                style={{ height: 44, padding: '0 28px', borderRadius: 8, background: '#0050b3' }}
              >
                Tiếp tục bước 2: Chọn ngày khám <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            BƯỚC 2: CHỌN THỜI GIAN KHÁM & XÁC NHẬN (GIỚI HẠN 10 BN/CA)
        ======================================================== */}
        {currentStep === 1 && (
          <div>
            <Alert
              message="Quy định tiếp nhận & Giới hạn bệnh nhân:"
              description="Để đảm bảo chất lượng thăm khám và vô trùng dụng cụ chu đáo nhất, mỗi bác sĩ chỉ nhận tối đa 10 bệnh nhân trong mỗi ca (Buổi Sáng: 8:00 - 12:00 | Buổi Chiều: 13:00 - 17:00, tối đa 20 BN/ngày). Nếu ca khám đã đủ 10 bệnh nhân, hệ thống sẽ báo kín lịch để bạn chọn ca hoặc ngày khác."
              type="info"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    Chọn ngày khám bệnh <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <DatePicker
                    size="large"
                    format="DD/MM/YYYY"
                    placeholder="Bấm chọn ngày khám"
                    style={{ width: '100%' }}
                    value={appointmentDate}
                    onChange={(val) => setAppointmentDate(val)}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    Chọn ca khám <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    value={session}
                    onChange={(val) => setSession(val)}
                  >
                    <Option value="morning">Buổi Sáng (8:00 - 12:00) — Tối đa 10 bệnh nhân</Option>
                    <Option value="afternoon">Buổi Chiều (13:00 - 17:00) — Tối đa 10 bệnh nhân</Option>
                  </Select>
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                Ghi chú thêm về triệu chứng / răng cần can thiệp (nếu có)
              </label>
              <TextArea
                rows={2}
                placeholder="Ví dụ: Răng số 46 bị sâu đau nhức, cần kiểm tra tổng quát..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Divider orientation="left" style={{ fontSize: 14 }}>Tóm tắt lịch hẹn đã chọn</Divider>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 18, borderRadius: 10, marginBottom: 24 }}>
              <p style={{ margin: '4px 0' }}>
                Bác sĩ phụ trách:{' '}
                {docObj ? (
                  <strong style={{ color: '#003366' }}>
                    BS. {docObj?.user?.first_name} {docObj?.user?.last_name || docObj?.user?.username} ({docObj?.specialty})
                  </strong>
                ) : (
                  <strong style={{ color: '#15803d' }}>
                    ✨ Phòng khám tự sắp xếp bác sĩ chuyên môn (Tối đa 10 BN/ca)
                  </strong>
                )}
              </p>
              <p style={{ margin: '4px 0' }}>Dịch vụ đăng ký: <strong style={{ color: '#003366' }}>{serObj?.name || 'Chưa chọn'}</strong> — Đơn giá tham khảo: <strong style={{ color: '#eb2f96' }}>{formatMoney(serObj?.price)}</strong></p>
              <p style={{ margin: '4px 0' }}>
                Thời gian khám: Ngày <strong>{appointmentDate ? dayjs(appointmentDate).format('DD/MM/YYYY') : 'Chưa chọn'}</strong> | Ca: <strong>{session === 'morning' ? 'Buổi Sáng (8h-12h)' : 'Buổi Chiều (13h-17h)'}</strong>
              </p>
              <p style={{ margin: '8px 0 0', paddingTop: 8, borderTop: '1px dashed #cbd5e1' }}>
                Tiền đặt cọc trực tuyến: <strong style={{ color: '#d46b08', fontSize: 16 }}>100.000 VNĐ</strong> <span style={{ color: '#666', fontSize: 12 }}>(Trừ thẳng vào viện phí khi bạn đến khám)</span>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button size="large" onClick={() => setCurrentStep(0)} style={{ borderRadius: 8 }}>
                <ArrowLeftOutlined /> Quay lại Bước 1
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleConfirmBooking}
                loading={submitting}
                style={{ background: '#52c41a', borderColor: '#52c41a', height: 44, padding: '0 28px', borderRadius: 8, fontWeight: 700 }}
              >
                Xác nhận đặt lịch & Chuyển sang nộp cọc <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            BƯỚC 3: HƯỚNG DẪN ĐẶT CỌC 100K & XÁC NHẬN
        ======================================================== */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a', marginBottom: 12 }} />
            <Title level={3} style={{ color: '#003366', margin: 0 }}>Lịch hẹn đã được ghi nhận: #{createdAppointment?.id}</Title>

            {createdAppointment?.doctor_info && (
              <div style={{ marginTop: 8, fontSize: 14, color: '#15803d', fontWeight: 600 }}>
                Bác sĩ phụ trách: BS. {createdAppointment.doctor_info.user?.first_name} {createdAppointment.doctor_info.user?.last_name || ''} ({createdAppointment.doctor_info.specialty})
              </div>
            )}

            <Paragraph style={{ color: '#666', marginTop: 8 }}>
              Vui lòng chuyển khoản <strong>100.000đ</strong> tiền cọc giữ giờ khám theo thông tin bên dưới:
            </Paragraph>

            <div style={{
              display: 'inline-block',
              background: '#f8fafc',
              border: '2px dashed #1890ff',
              borderRadius: 16,
              padding: '24px 32px',
              margin: '16px auto',
              maxWidth: 460,
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <QrcodeOutlined style={{ fontSize: 64, color: '#003366' }} />
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Quét mã QR VietQR trên ứng dụng Ngân hàng</div>
              </div>
              <p style={{ margin: '6px 0' }}>Ngân hàng: <strong>MB Bank (Quân Đội)</strong></p>
              <p style={{ margin: '6px 0' }}>Số tài khoản: <strong style={{ fontSize: 15, color: '#003366' }}>999922178888</strong></p>
              <p style={{ margin: '6px 0' }}>Chủ tài khoản: <strong>PHONG KHAM NHA KHOA DA NANG</strong></p>
              <p style={{ margin: '6px 0' }}>Số tiền cọc: <strong style={{ color: '#eb2f96', fontSize: 17 }}>100.000 VNĐ</strong></p>
              <p style={{ margin: '6px 0' }}>Nội dung chuyển khoản: <strong style={{ color: '#1890ff', fontSize: 15 }}>COC LH{createdAppointment?.id}</strong></p>
            </div>

            <Alert
              message="Chính sách đảm bảo quyền lợi:"
              description="Sau khi chuyển khoản thành công, bạn bấm nút 'Tôi đã chuyển tiền cọc 100.000đ' để lễ tân đối soát. Nếu có việc đột xuất, bạn có thể liên hệ Zalo phòng khám (0901.234.567) để dời lịch khám sang ngày khác miễn phí mà không mất tiền cọc."
              type="warning"
              showIcon
              style={{ textAlign: 'left', marginBottom: 24, maxWidth: 580, margin: '0 auto 24px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Button size="large" onClick={() => navigate('/patient/appointments')} style={{ borderRadius: 8 }}>
                Để sau / Xem lịch của tôi
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={notifyingDeposit}
                onClick={handleNotifyDeposit}
                style={{ background: '#52c41a', borderColor: '#52c41a', height: 44, padding: '0 24px', borderRadius: 8, fontWeight: 700 }}
              >
                Tôi đã chuyển tiền cọc 100.000đ
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
