import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Button, Typography, Tag, Space, Divider,
  Spin, Badge, Form, Input, Alert
} from 'antd'
import {
  PlusCircleOutlined, CalendarOutlined, MedicineBoxOutlined,
  CheckCircleOutlined, InfoCircleOutlined, ClockCircleOutlined,
  PhoneOutlined, EnvironmentOutlined, MailOutlined, WechatOutlined,
  SafetyCertificateOutlined, SmileOutlined, StarFilled, ArrowRightOutlined,
  SendOutlined, UserOutlined, ToolOutlined, ReadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getDoctors } from '../../api/doctors'
import { getServices } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { formatMoney } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography

export default function PatientDashboard() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactForm] = Form.useForm()
  const navigate = useNavigate()

  useEffect(() => {
    fetchClinicData()
  }, [])

  const fetchClinicData = async () => {
    try {
      const [resDoc, resSer] = await Promise.all([
        getDoctors({ is_available: true }),
        getServices({ is_active: true })
      ])
      setDoctors(resDoc.data.results || resDoc.data || [])
      setServices(resSer.data.results || resSer.data || [])
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleBookingClick = (doctorId = null, serviceId = null) => {
    if (!user) {
      toast('Vui lòng đăng nhập hoặc đăng ký tài khoản để tiến hành đặt lịch khám!', { icon: 'ℹ️' })
      navigate('/login')
      return
    }
    navigate('/patient/booking', { state: { doctorId, serviceId } })
  }

  const handleSendContact = (values) => {
    toast.success('Cảm ơn bạn đã gửi liên hệ! Đội ngũ lễ tân sẽ phản hồi trong thời gian sớm nhất.')
    contactForm.resetFields()
  }

  return (
    <div>
      {/* ========================================================
          1. HERO BANNER
      ======================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, #002244 0%, #004080 60%, #0059b3 100%)',
        color: '#fff',
        padding: '70px 32px',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row align="middle" gutter={[32, 32]}>
            <Col xs={24} md={15}>
              <Badge count="Phòng khám Chuẩn Y Khoa" style={{ backgroundColor: '#52c41a', color: '#fff', fontSize: 13, padding: '4px 12px', borderRadius: 20 }} />
              <Title level={1} style={{ color: '#fff', fontSize: 38, fontWeight: 800, marginTop: 16, marginBottom: 16, lineHeight: 1.25 }}>
                Chăm Sóc Nụ Cười Của Bạn <br />
                <span style={{ color: '#69c0ff' }}>Với Đội Ngũ Bác Sĩ Chuyên Sâu</span>
              </Title>
              <Paragraph style={{ color: '#d6e4ff', fontSize: 16, lineHeight: 1.7, maxWidth: 620, marginBottom: 28 }}>
                Phòng khám Nha khoa Đà Nẵng tiên phong ứng dụng công nghệ hiện đại, quy trình vô trùng tuyệt đối khép kín và phác đồ điều trị nhẹ nhàng, bảo tồn răng tối đa cho từng bệnh nhân.
              </Paragraph>
              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusCircleOutlined />}
                  onClick={() => handleBookingClick()}
                  style={{
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    height: 50,
                    padding: '0 28px',
                    fontSize: 16,
                    borderRadius: 8,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(82, 196, 26, 0.4)'
                  }}
                >
                  Đặt Lịch Khám Trực Tuyến
                </Button>
                <Button
                  size="large"
                  ghost
                  onClick={() => {
                    const el = document.getElementById('dich-vu')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{ height: 50, padding: '0 24px', fontSize: 15, borderRadius: 8 }}
                >
                  Xem Dịch Vụ & Bảng Giá
                </Button>
              </Space>
            </Col>

            <Col xs={24} md={9} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: 20,
                padding: '32px 24px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                  <SafetyCertificateOutlined style={{ fontSize: 36, color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ color: '#fff', fontSize: 15, display: 'block' }}>100% Vô Trùng Chuẩn Y Khoa</Text>
                    <Text style={{ color: '#bfbfbf', fontSize: 13 }}>Dụng cụ riêng biệt cho từng người</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                  <UserOutlined style={{ fontSize: 36, color: '#40a9ff' }} />
                  <div>
                    <Text strong style={{ color: '#fff', fontSize: 15, display: 'block' }}>Bác Sĩ Chuyên Khoa Giàu Kinh Nghiệm</Text>
                    <Text style={{ color: '#bfbfbf', fontSize: 13 }}>Được đào tạo chính quy, tận tâm</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                  <ClockCircleOutlined style={{ fontSize: 36, color: '#ffd666' }} />
                  <div>
                    <Text strong style={{ color: '#fff', fontSize: 15, display: 'block' }}>Đặt Cọc 100k - Giữ Giờ Khám</Text>
                    <Text style={{ color: '#bfbfbf', fontSize: 13 }}>Trừ trực tiếp vào viện phí khi khám</Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Container nội dung chính */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* ========================================================
            2. MỤC GIỚI THIỆU PHÒNG KHÁM
        ======================================================== */}
        <section id="gioi-thieu" style={{ marginBottom: 64, scrollMarginTop: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Badge count="GIỚI THIỆU" style={{ backgroundColor: '#e6f7ff', color: '#1890ff', fontWeight: 600, padding: '2px 10px' }} />
            <Title level={2} style={{ color: '#003366', marginTop: 12, marginBottom: 12 }}>
              VỀ PHÒNG KHÁM NHA KHOA ĐÀ NẴNG
            </Title>
            <Paragraph style={{ color: '#666', fontSize: 15, maxWidth: 780, margin: '0 auto' }}>
              Với phương châm <em>"Bảo tồn nụ cười tự nhiên - Điều trị chuẩn y khoa"</em>, chúng tôi tự hào là điểm đến chăm sóc răng miệng tin cậy của đông đảo khách hàng tại TP. Đà Nẵng và các tỉnh miền Trung.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12, textAlign: 'center', borderTop: '4px solid #1890ff' }}>
                <ToolOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#003366' }}>Công Nghệ Hiện Đại</Title>
                <Paragraph style={{ color: '#666', fontSize: 13 }}>
                  Trang bị hệ thống máy chụp phim X-quang kỹ thuật số, ghế máy nha khoa đa chức năng và đèn quang trùng hợp cao cấp.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12, textAlign: 'center', borderTop: '4px solid #52c41a' }}>
                <SafetyCertificateOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#003366' }}>Vô Trùng Khép Kín</Title>
                <Paragraph style={{ color: '#666', fontSize: 13 }}>
                  Quy trình tiệt trùng dụng cụ qua nồi hấp Autoclave nhiệt độ cao theo chuẩn y tế, chống lây nhiễm chéo 100%.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12, textAlign: 'center', borderTop: '4px solid #fa8c16' }}>
                <MedicineBoxOutlined style={{ fontSize: 40, color: '#fa8c16', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#003366' }}>Điều Trị Nhẹ Nhàng</Title>
                <Paragraph style={{ color: '#666', fontSize: 13 }}>
                  Áp dụng kỹ thuật gây tê cục bộ không đau, tâm lý học trong điều trị giúp xóa tan nỗi sợ đi khám răng của bệnh nhân.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12, textAlign: 'center', borderTop: '4px solid #722ed1' }}>
                <ClockCircleOutlined style={{ fontSize: 40, color: '#722ed1', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#003366' }}>Đặt Lịch Tiện Lợi</Title>
                <Paragraph style={{ color: '#666', fontSize: 13 }}>
                  Đặt lịch online 24/7 kèm cọc 100k giữ chỗ. Dễ dàng đổi lịch khám linh hoạt qua kênh Zalo phòng khám khi có việc bận.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ========================================================
            3. MỤC DỊCH VỤ VÀ BẢNG GIÁ
        ======================================================== */}
        <section id="dich-vu" style={{ marginBottom: 64, scrollMarginTop: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Badge count="BẢNG GIÁ CÔNG KHAI" style={{ backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f', fontWeight: 600, padding: '2px 10px' }} />
            <Title level={2} style={{ color: '#003366', marginTop: 12, marginBottom: 12 }}>
              DỊCH VỤ NHA KHOA CHUYÊN NGHIỆP
            </Title>
            <Paragraph style={{ color: '#666', fontSize: 15, maxWidth: 780, margin: '0 auto' }}>
              Danh mục các dịch vụ khám, phục hình, thẩm mỹ và điều trị bệnh lý răng miệng với bảng giá niêm yết rõ ràng, minh bạch.
            </Paragraph>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
          ) : (
            <Row gutter={[20, 20]}>
              {services.map(ser => (
                <Col xs={24} sm={12} lg={8} key={ser.id}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                    }}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 22 }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <Tag color="cyan" style={{ fontSize: 12, padding: '2px 8px' }}>
                          {ser.category || 'Nha khoa'}
                        </Tag>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />~{ser.duration_minutes} phút
                        </span>
                      </div>

                      <Title level={4} style={{ color: '#003366', marginBottom: 8, fontSize: 17 }}>
                        {ser.name}
                      </Title>

                      <Paragraph style={{ color: '#666', fontSize: 13, lineHeight: 1.6, minHeight: 48, marginBottom: 16 }}>
                        {ser.description || 'Dịch vụ được thực hiện bởi bác sĩ chuyên khoa với đầy đủ trang thiết bị hỗ trợ chuyên dụng.'}
                      </Paragraph>
                    </div>

                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#888', display: 'block' }}>Đơn giá niêm yết</span>
                        <Text strong style={{ color: '#eb2f96', fontSize: 17 }}>
                          {formatMoney(ser.price)}
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusCircleOutlined />}
                        onClick={() => handleBookingClick(null, ser.id)}
                        style={{ borderRadius: 6, background: '#1890ff' }}
                      >
                        Đặt lịch
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ========================================================
            4. MỤC ĐỘI NGŨ BÁC SĨ (LIÊN KẾT VỚI ADMIN)
        ======================================================== */}
        <section id="bac-si" style={{ marginBottom: 64, scrollMarginTop: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Badge count="CHUYÊN GIA Y KHOA" style={{ backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591', fontWeight: 600, padding: '2px 10px' }} />
            <Title level={2} style={{ color: '#003366', marginTop: 12, marginBottom: 12 }}>
              ĐỘI NGŨ BÁC SĨ CHUYÊN KHOA
            </Title>
            <Paragraph style={{ color: '#666', fontSize: 15, maxWidth: 780, margin: '0 auto' }}>
              Các bác sĩ chuyên khoa đầu ngành, giàu kinh nghiệm lâm sàng và luôn tận tụy với từng nụ cười của bệnh nhân.
            </Paragraph>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
          ) : (
            <Row gutter={[24, 24]}>
              {doctors.map(doc => (
                <Col xs={24} md={12} lg={12} key={doc.id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      height: '100%',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <Row gutter={20} align="middle">
                      <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                          boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
                        }}>
                          <UserOutlined style={{ fontSize: 50, color: '#fff' }} />
                        </div>
                        <Badge status="success" text="Đang tiếp nhận lịch" />
                      </Col>

                      <Col xs={24} sm={16}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <Title level={4} style={{ color: '#003366', margin: 0 }}>
                              BS. {doc.user?.first_name} {doc.user?.last_name || doc.user?.username}
                            </Title>
                            <Tag color="blue" style={{ marginTop: 4, marginBottom: 8, fontSize: 12 }}>
                              {doc.specialty}
                            </Tag>
                          </div>
                          <span style={{ fontSize: 12, color: '#52c41a', fontWeight: 600 }}>
                            {doc.experience_years} năm KN
                          </span>
                        </div>

                        <Paragraph style={{ color: '#555', fontSize: 13, lineHeight: 1.6, marginTop: 4, marginBottom: 12 }}>
                          {doc.description || 'Bác sĩ chuyên khoa giàu kinh nghiệm trong chẩn đoán và điều trị nha khoa kỹ thuật cao.'}
                        </Paragraph>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e8e8e8', paddingTop: 10 }}>
                          <div>
                            <span style={{ fontSize: 11, color: '#888' }}>Phí khám: </span>
                            <Text strong style={{ color: '#eb2f96' }}>{formatMoney(doc.consultation_fee)}</Text>
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleBookingClick(doc.id, null)}
                            style={{ borderRadius: 6, background: '#0050b3' }}
                          >
                            Đặt khám với BS
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>

        {/* ========================================================
            5. MỤC CẨM NANG & TIN TỨC NHA KHOA
        ======================================================== */}
        <section id="tin-tuc" style={{ marginBottom: 64, scrollMarginTop: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Badge count="KIẾN THỨC CHUYÊN MÔN" style={{ backgroundColor: '#f0f5ff', color: '#2f54eb', fontWeight: 600, padding: '2px 10px' }} />
            <Title level={2} style={{ color: '#003366', marginTop: 12, marginBottom: 12 }}>
              CẨM NANG CHĂM SÓC RĂNG MIỆNG
            </Title>
            <Paragraph style={{ color: '#666', fontSize: 15, maxWidth: 780, margin: '0 auto' }}>
              Chia sẻ những lời khuyên hữu ích từ các bác sĩ chuyên khoa giúp bạn và gia đình duy trì hàm răng chắc khỏe, sáng bóng.
            </Paragraph>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                <ReadOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }} />
                <Title level={5} style={{ color: '#003366' }}>Quy trình niềng răng chuẩn y khoa diễn ra như thế nào?</Title>
                <Paragraph style={{ color: '#666', fontSize: 12 }}>
                  Tìm hiểu các giai đoạn thăm khám, chụp phim, lên phác đồ điều trị và gắn mắc cài để có nụ cười tự tin nhất.
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 11 }}>Đăng ngày: 15/10/2026</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                <ReadOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 12 }} />
                <Title level={5} style={{ color: '#003366' }}>Tẩy trắng răng bằng đèn LED có làm mòn men răng?</Title>
                <Paragraph style={{ color: '#666', fontSize: 12 }}>
                  Giải đáp băn khoăn về công nghệ tẩy trắng nha khoa hiện đại: an toàn, không ê buốt và duy trì độ trắng sáng dài lâu.
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 11 }}>Đăng ngày: 18/10/2026</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                <ReadOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 12 }} />
                <Title level={5} style={{ color: '#003366' }}>Những lưu ý quan trọng sau khi nhổ răng khôn</Title>
                <Paragraph style={{ color: '#666', fontSize: 12 }}>
                  Chế độ ăn uống, cách vệ sinh khoang miệng và dấu hiệu cần liên hệ bác sĩ để vết nhổ lành thương nhanh chóng.
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 11 }}>Đăng ngày: 22/10/2026</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                <ReadOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 12 }} />
                <Title level={5} style={{ color: '#003366' }}>Cách phòng ngừa sâu răng và viêm nướu hiệu quả</Title>
                <Paragraph style={{ color: '#666', fontSize: 12 }}>
                  Hướng dẫn chải răng đúng cách, dùng chỉ nha khoa, nước súc miệng và khám định kỳ 6 tháng/lần tại phòng khám.
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 11 }}>Đăng ngày: 25/10/2026</Text>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ========================================================
            6. MỤC THỜI GIAN MỞ CỬA & LIÊN HỆ
        ======================================================== */}
        <section id="lien-he" style={{ scrollMarginTop: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Badge count="THÔNG TIN LIÊN HỆ" style={{ backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e', fontWeight: 600, padding: '2px 10px' }} />
            <Title level={2} style={{ color: '#003366', marginTop: 12, marginBottom: 12 }}>
              THỜI GIAN LÀM VIỆC & LIÊN HỆ
            </Title>
            <Paragraph style={{ color: '#666', fontSize: 15, maxWidth: 780, margin: '0 auto' }}>
              Hãy ghé thăm phòng khám hoặc gửi lời nhắn cho chúng tôi để được tư vấn sức khỏe răng miệng tận tình nhất.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {/* Cột trái: Khung giờ làm việc & Địa chỉ */}
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 16, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <Title level={4} style={{ color: '#003366', display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 10 }} />
                  Thời Gian Tiếp Nhận Bệnh Nhân
                </Title>

                <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, marginBottom: 20 }}>
                  <p style={{ margin: '8px 0', fontSize: 14 }}>
                    📅 <strong>Thứ Hai đến Thứ Bảy:</strong> Mở cửa từ <strong>08:00 - 17:00</strong>
                  </p>
                  <p style={{ margin: '4px 0 4px 24px', color: '#555', fontSize: 13 }}>
                    • <strong>Ca Sáng:</strong> 08:00 - 12:00
                  </p>
                  <p style={{ margin: '4px 0 4px 24px', color: '#555', fontSize: 13 }}>
                    • <strong>Ca Chiều:</strong> 13:00 - 17:00
                  </p>
                  <p style={{ margin: '12px 0 0', fontSize: 14, color: '#d46b08' }}>
                    📅 <strong>Chủ Nhật:</strong> Nghỉ tại phòng khám <em>(Hệ thống Web & Chatbot AI hỗ trợ đặt lịch 24/7)</em>
                  </p>
                </div>

                <Title level={4} style={{ color: '#003366', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <EnvironmentOutlined style={{ color: '#52c41a', marginRight: 10 }} />
                  Địa Chỉ & Kênh Liên Hệ Trực Tiếp
                </Title>

                <p style={{ fontSize: 14, margin: '8px 0' }}>
                  📍 <strong>Địa chỉ:</strong> 54 Nguyễn Lương Bằng, P. Hòa Khánh Bắc, Q. Liên Chiểu, TP. Đà Nẵng
                </p>
                <p style={{ fontSize: 14, margin: '8px 0' }}>
                  📞 <strong>Hotline tư vấn:</strong> <strong style={{ color: '#0050b3' }}>0901.234.567</strong>
                </p>
                <p style={{ fontSize: 14, margin: '8px 0' }}>
                  💬 <strong>Zalo hỗ trợ cọc & dời lịch:</strong> <strong style={{ color: '#52c41a' }}>0901.234.567</strong>
                </p>
                <p style={{ fontSize: 14, margin: '8px 0' }}>
                  ✉️ <strong>Email hỗ trợ:</strong> info@nhakhoadanang.com
                </p>
              </Card>
            </Col>

            {/* Cột phải: Form gửi liên hệ nhanh */}
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 16, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <Title level={4} style={{ color: '#003366', marginBottom: 6 }}>
                  Gửi Yêu Cầu Tư Vấn Nhanh
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 18 }}>
                  Để lại thông tin và nhu cầu của bạn, nhân viên lễ tân sẽ liên hệ giải đáp trong 15 phút.
                </Text>

                <Form form={contactForm} layout="vertical" onFinish={handleSendContact}>
                  <Form.Item name="name" label="Họ và tên của bạn" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                    <Input placeholder="Ví dụ: Nguyễn Văn An" />
                  </Form.Item>
                  <Form.Item name="phone" label="Số điện thoại liên hệ" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                    <Input placeholder="Ví dụ: 0905xxxxxx" />
                  </Form.Item>
                  <Form.Item name="message" label="Nội dung cần tư vấn hoặc tình trạng răng miệng" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
                    <Input.TextArea rows={3} placeholder="Ví dụ: Tôi muốn tư vấn chi phí tẩy trắng răng hoặc niềng răng trong suốt..." />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />} block style={{ height: 42, borderRadius: 8, background: '#0050b3' }}>
                      Gửi Tin Nhắn Cho Phòng Khám
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </section>

      </div>
    </div>
  )
}
