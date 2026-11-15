import { useState, useEffect } from 'react'
import {
  Card, Steps, Button, Select, DatePicker, Row, Col, Typography,
  Alert, Divider, Input, Spin, Badge, Space, Radio, Tag, Result
} from 'antd'
import {
  UserOutlined, CalendarOutlined, CheckCircleOutlined,
  ArrowLeftOutlined, ArrowRightOutlined,
  MedicineBoxOutlined, ClockCircleOutlined, InfoCircleOutlined,
  SmileOutlined, PhoneOutlined, ScheduleOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { getDoctors } from '../../api/doctors'
import { getServices } from '../../api/services'
import { createAppointment, getBookedSlots } from '../../api/appointments'
import { formatMoney } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const MORNING_SLOTS = [
  '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00',
  '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30', '11:30 - 12:00'
]

const AFTERNOON_SLOTS = [
  '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
  '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00'
]

export default function PatientBooking() {
  const [currentStep, setCurrentStep] = useState(0)
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState(null)

  // Booking states
  const [doctorId, setDoctorId] = useState('auto')
  const [serviceId, setServiceId] = useState(null)
  const [appointmentDate, setAppointmentDate] = useState(null)
  const [session, setSession] = useState('morning')
  const [timeSlot, setTimeSlot] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
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

  // Khi thay đổi ngày, bác sĩ hoặc ca khám: tải các slot đã bị đặt
  useEffect(() => {
    if (!appointmentDate) {
      setBookedSlots([])
      return
    }

    const fetchSlots = async () => {
      setLoadingSlots(true)
      try {
        const formattedDate = dayjs.isDayjs(appointmentDate)
          ? appointmentDate.format('YYYY-MM-DD')
          : dayjs(appointmentDate).format('YYYY-MM-DD')

        const res = await getBookedSlots({
          date: formattedDate,
          doctor: doctorId,
          session: session
        })
        const booked = res.data?.booked_slots || []
        setBookedSlots(booked)

        // Nếu slot hiện tại nằm trong bookedSlots thì bỏ chọn
        if (timeSlot && booked.includes(timeSlot)) {
          setTimeSlot('')
        }
      } catch {
        console.error('Không thể tải danh sách khung giờ đã đặt')
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [appointmentDate, doctorId, session])

  const handleNextStep = () => {
    if (!serviceId) {
      toast.error('Vui lòng chọn Dịch vụ nha khoa mong muốn ở Bước 1!')
      return
    }
    setCurrentStep(1)
  }

  const handleConfirmBooking = async () => {
    if (!appointmentDate) {
      toast.error('Vui lòng bấm chọn Ngày khám ở Bước 2!')
      return
    }
    if (!timeSlot) {
      toast.error('Vui lòng chọn Khung giờ khám (30 phút) phù hợp!')
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
        time_slot: timeSlot,
        reason: note || 'Đặt lịch khám trực tuyến'
      }

      if (doctorId && doctorId !== 'auto') {
        payload.doctor = doctorId
      }

      const res = await createAppointment(payload)
      setCreatedAppointment(res.data)
      toast.success('Đặt lịch khám thành công! Hệ thống đã ghi nhận lịch hẹn.')
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

  const docObj = (doctorId && doctorId !== 'auto') ? doctors.find(d => d.id === doctorId) : null
  const serObj = services.find(s => s.id === serviceId)
  const currentSlots = session === 'morning' ? MORNING_SLOTS : AFTERNOON_SLOTS

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu đặt lịch..." />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Title level={2} style={{ color: '#003366', margin: 0 }}>ĐẶT LỊCH KHÁM NHA KHOA TRỰC TUYẾN</Title>
        <Text type="secondary">
          Đặt lịch dễ dàng & không cần đặt cọc trước — Khung giờ 30 phút chống chờ đợi — Tự do hủy trong 30 phút
        </Text>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <Steps
          current={currentStep}
          items={[
            { title: 'Dịch vụ & Bác sĩ' },
            { title: 'Thời gian & Khung giờ' },
            { title: 'Hoàn tất đặt lịch' },
          ]}
          style={{ marginBottom: 32 }}
        />

        {/* ========================================================
            BƯỚC 1: CHỌN DỊCH VỤ & BÁC SĨ (BÁC SĨ TÙY CHỌN/NGẪU NHIÊN)
        ======================================================== */}
        {currentStep === 0 && (
          <div>
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
                <Text strong style={{ color: '#389e0d' }}>Mô tả dịch vụ:</Text>
                <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
                  {serObj.description || 'Dịch vụ được thực hiện bởi bác sĩ chuyên khoa với hệ thống máy móc vô trùng chuẩn y khoa.'}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>
                  2. Chọn Bác sĩ phụ trách <span style={{ color: '#888', fontWeight: 'normal' }}>(Không bắt buộc)</span>
                </label>
                <span style={{ fontSize: 12, color: '#1890ff' }}>
                  ✓ Mỗi khung giờ 30 phút phục vụ riêng 1 bệnh nhân
                </span>
              </div>

              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="Chọn bác sĩ hoặc để phòng khám tự sắp xếp"
                value={doctorId}
                onChange={(val) => {
                  setDoctorId(val)
                  setTimeSlot('')
                }}
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

            {(!doctorId || doctorId === 'auto') ? (
              <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 8, marginBottom: 24, borderLeft: '4px solid #52c41a', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SmileOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                  <Text strong style={{ color: '#15803d', fontSize: 14 }}>Chế độ điều phối thông minh</Text>
                </div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>
                  Hệ thống sẽ tự động xếp bạn với bác sĩ có lịch trực và còn trống trong khung giờ bạn chọn, giúp tối ưu thời gian và tránh chờ đợi.
                </div>
              </div>
            ) : (
              docObj && (
                <div style={{ background: '#f0f5ff', padding: '12px 16px', borderRadius: 8, marginBottom: 24, borderLeft: '4px solid #1890ff' }}>
                  <Text strong style={{ color: '#003366' }}>Hồ sơ bác sĩ:</Text>
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
                Tiếp tục bước 2: Chọn khung giờ <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            BƯỚC 2: CHỌN NGÀY & KHUNG GIỜ KHÁM 30 PHÚT
        ======================================================== */}
        {currentStep === 1 && (
          <div>
            <Alert
              message="Chính sách tiếp nhận & Đặt hẹn theo khung giờ 30 phút:"
              description="Để loại bỏ thời gian chờ đợi lâu, phòng khám chia mỗi ca thành các khung giờ 30 phút cụ thể (Sáng: 8h - 12h | Chiều: 13h - 17h). Mỗi khung giờ chỉ tiếp nhận 1 bệnh nhân cho mỗi bác sĩ. Quý khách hoàn toàn không cần đặt cọc trước và có thể tự do hủy lịch trên hệ thống trong vòng 30 phút sau khi đặt."
              type="info"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    1. Chọn ngày khám bệnh <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <DatePicker
                    size="large"
                    format="DD/MM/YYYY"
                    placeholder="Bấm chọn ngày khám"
                    style={{ width: '100%' }}
                    value={appointmentDate}
                    onChange={(val) => {
                      setAppointmentDate(val)
                      setTimeSlot('')
                    }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    2. Chọn buổi khám <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <Radio.Group
                    value={session}
                    onChange={(e) => {
                      setSession(e.target.value)
                      setTimeSlot('')
                    }}
                    buttonStyle="solid"
                    size="large"
                    style={{ width: '100%', display: 'flex' }}
                  >
                    <Radio.Button value="morning" style={{ flex: 1, textAlign: 'center' }}>
                      ☀️ Buổi Sáng (8h - 12h)
                    </Radio.Button>
                    <Radio.Button value="afternoon" style={{ flex: 1, textAlign: 'center' }}>
                      🌤️ Buổi Chiều (13h - 17h)
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </Col>
            </Row>

            {/* BẢNG CHỌN KHUNG GIỜ 30 PHÚT */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>
                  3. Chọn khung giờ khám 30 phút <span style={{ color: '#ff4d4f' }}>* (Mỗi ô 30 phút)</span>
                </label>
                {loadingSlots && <Spin size="small" />}
              </div>

              {!appointmentDate ? (
                <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: 8, textAlign: 'center', color: '#888' }}>
                  <ClockCircleOutlined style={{ marginRight: 6 }} /> Vui lòng chọn ngày khám ở trên để hiển thị các khung giờ còn trống
                </div>
              ) : (
                <Row gutter={[10, 10]}>
                  {currentSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const isSelected = timeSlot === slot

                    return (
                      <Col xs={12} sm={6} key={slot}>
                        <Button
                          block
                          size="large"
                          disabled={isBooked}
                          onClick={() => setTimeSlot(slot)}
                          style={{
                            height: 48,
                            borderRadius: 8,
                            fontWeight: isSelected ? 700 : 500,
                            borderColor: isSelected ? '#1890ff' : (isBooked ? '#f0f0f0' : '#d9d9d9'),
                            background: isSelected ? '#e6f7ff' : (isBooked ? '#fafafa' : '#fff'),
                            color: isSelected ? '#1890ff' : (isBooked ? '#bfbfbf' : '#262626'),
                            boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
                          }}
                        >
                          <ClockCircleOutlined style={{ marginRight: 4, fontSize: 13 }} />
                          {slot}
                          {isBooked && (
                            <div style={{ fontSize: 10, color: '#ff4d4f', lineHeight: 1, marginTop: 2 }}>Đã kín</div>
                          )}
                        </Button>
                      </Col>
                    )
                  })}
                </Row>
              )}

              {timeSlot && (
                <div style={{ marginTop: 10, color: '#1677ff', fontSize: 13, fontWeight: 500 }}>
                  ✓ Đã chọn khung giờ khám: <strong>{timeSlot}</strong>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                Ghi chú thêm về triệu chứng / tình trạng răng (nếu có)
              </label>
              <TextArea
                rows={2}
                placeholder="Ví dụ: Răng hàm dưới bị ê buốt, cần vệ sinh cạo vôi..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Divider orientation="left" style={{ fontSize: 14 }}>Tóm tắt lịch hẹn</Divider>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 18, borderRadius: 10, marginBottom: 24 }}>
              <p style={{ margin: '4px 0' }}>
                Bác sĩ phụ trách:{' '}
                {docObj ? (
                  <strong style={{ color: '#003366' }}>
                    BS. {docObj?.user?.first_name} {docObj?.user?.last_name || docObj?.user?.username} ({docObj?.specialty})
                  </strong>
                ) : (
                  <strong style={{ color: '#15803d' }}>
                    ✨ Phòng khám tự sắp xếp bác sĩ chuyên khoa phù hợp
                  </strong>
                )}
              </p>
              <p style={{ margin: '4px 0' }}>Dịch vụ đăng ký: <strong style={{ color: '#003366' }}>{serObj?.name || 'Chưa chọn'}</strong> — Chi phí tham khảo: <strong style={{ color: '#eb2f96' }}>{formatMoney(serObj?.price)}</strong></p>
              <p style={{ margin: '4px 0' }}>
                Thời gian khám: Ngày <strong>{appointmentDate ? dayjs(appointmentDate).format('DD/MM/YYYY') : 'Chưa chọn'}</strong> | Khung giờ: <strong style={{ color: '#0050b3' }}>{timeSlot || 'Chưa chọn'}</strong> ({session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều'})
              </p>
              <p style={{ margin: '8px 0 0', paddingTop: 8, borderTop: '1px dashed #cbd5e1', color: '#15803d' }}>
                ✨ <strong>Không thu tiền cọc trước</strong> — Tiếp nhận trực tiếp tại quầy — Được hủy lịch miễn phí trong 30 phút.
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
                Xác nhận đặt lịch ngay <CheckCircleOutlined />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            BƯỚC 3: HOÀN TẤT ĐẶT LỊCH (KHÔNG CẦN CỌC)
        ======================================================== */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Result
              status="success"
              title="ĐẶT LỊCH KHÁM NHA KHOA THÀNH CÔNG!"
              subTitle={`Mã lịch hẹn của bạn là #${createdAppointment?.id}. Thông tin đã được chuyển tới bộ phận lễ tân để tiếp đón chu đáo.`}
              extra={[
                <Button
                  key="appointments"
                  type="primary"
                  size="large"
                  onClick={() => navigate('/patient/appointments')}
                  style={{ borderRadius: 8, background: '#0050b3' }}
                >
                  Xem danh sách lịch hẹn của tôi
                </Button>,
                <Button
                  key="home"
                  size="large"
                  onClick={() => navigate('/')}
                  style={{ borderRadius: 8 }}
                >
                  Về trang chủ
                </Button>
              ]}
            >
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '20px 24px',
                maxWidth: 580,
                margin: '0 auto 20px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#003366', marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                  Chi tiết thông tin lịch hẹn
                </div>
                <p style={{ margin: '6px 0' }}>
                  Mã lịch hẹn: <strong style={{ color: '#003366' }}>#{createdAppointment?.id}</strong>
                </p>
                <p style={{ margin: '6px 0' }}>
                  Bác sĩ khám: <strong>
                    BS. {createdAppointment?.doctor_info?.user?.first_name} {createdAppointment?.doctor_info?.user?.last_name || createdAppointment?.doctor_info?.user?.username || 'Bác sĩ chuyên khoa'}
                  </strong>
                </p>
                <p style={{ margin: '6px 0' }}>
                  Dịch vụ: <strong>{createdAppointment?.service_info?.name || serObj?.name}</strong>
                </p>
                <p style={{ margin: '6px 0' }}>
                  Ngày hẹn khám: <strong style={{ color: '#0050b3' }}>{createdAppointment?.appointment_date ? dayjs(createdAppointment.appointment_date).format('DD/MM/YYYY') : dayjs(appointmentDate).format('DD/MM/YYYY')}</strong>
                </p>
                <p style={{ margin: '6px 0' }}>
                  Khung giờ tiếp nhận: <Tag color="geekblue" style={{ fontSize: 14, fontWeight: 700, padding: '2px 10px' }}>{createdAppointment?.time_slot || timeSlot}</Tag> ({session === 'morning' ? 'Ca Sáng' : 'Ca Chiều'})
                </p>
              </div>

              <Alert
                message="Quy định hỗ trợ hủy hoặc đổi lịch hẹn:"
                description="Bạn có thể tự hủy lịch hẹn trực tiếp trên website trong vòng 30 phút kể từ lúc đặt. Nếu quá thời gian trên hoặc cần đổi giờ khám/đổi bác sĩ, vui lòng liên hệ nhân viên lễ tân qua Hotline/Zalo: 0901.234.567 để được hỗ trợ kịp thời!"
                type="info"
                showIcon
                style={{ textAlign: 'left', maxWidth: 580, margin: '0 auto' }}
              />
            </Result>
          </div>
        )}
      </Card>
    </div>
  )
}
