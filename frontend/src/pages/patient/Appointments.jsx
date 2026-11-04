import { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Button, Space, Alert, Modal } from 'antd'
import {
  CalendarOutlined, PlusOutlined, WechatOutlined, ReloadOutlined,
  QrcodeOutlined, CheckCircleOutlined, DollarCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getMyAppointments, notifyDeposit } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [submittingDeposit, setSubmittingDeposit] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await getMyAppointments()
      setAppointments(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách lịch hẹn của bạn.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDepositModal = (appointment) => {
    setSelectedAppointment(appointment)
    setModalVisible(true)
  }

  const handleNotifyDepositInModal = async () => {
    if (!selectedAppointment?.id) return
    setSubmittingDeposit(true)
    try {
      await notifyDeposit(selectedAppointment.id, {
        note: `Bệnh nhân đã chuyển cọc 100.000đ qua QR (COC LH${selectedAppointment.id})`
      })
      toast.success('Đã gửi thông báo đặt cọc đến lễ tân! Vui lòng chờ lễ tân đối soát.')
      setModalVisible(false)
      fetchAppointments()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Lỗi khi gửi thông báo cọc.'
      toast.error(msg)
    } finally {
      setSubmittingDeposit(false)
    }
  }

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong style={{ color: '#003366' }}>#{id}</strong>
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_, r) => {
        const dInfo = r.doctor_info || r.doctor
        const docName = `${dInfo?.user?.first_name || ''} ${dInfo?.user?.last_name || ''}`.trim() || dInfo?.user?.username || 'Bác sĩ'
        return `BS. ${docName}`
      }
    },
    {
      title: 'Dịch vụ đăng ký',
      key: 'service',
      render: (_, r) => r.service_info?.name || r.service?.name || 'Khám nha khoa'
    },
    {
      title: 'Ngày khám & Ca',
      key: 'time',
      render: (_, r) => (
        <div>
          <div>{formatDate(r.appointment_date)}</div>
          <Tag color={r.session === 'morning' ? 'orange' : 'blue'}>
            {r.session === 'morning' ? 'Ca Sáng (8h-12h)' : 'Ca Chiều (13h-17h)'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Tiền cọc (100.000đ)',
      key: 'deposit',
      render: (_, r) => {
        if (r.deposit_status === 'verified') {
          return <Tag color="green">Đã duyệt cọc</Tag>
        }
        if (r.deposit_status === 'pending_verification' || r.status === 'deposited') {
          return <Tag color="blue">Chờ lễ tân duyệt</Tag>
        }
        return <Tag color="orange">Chưa nộp cọc</Tag>
      }
    },
    {
      title: 'Trạng thái lịch hẹn',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    },
    {
      title: 'Thao tác cọc',
      key: 'actions',
      render: (_, r) => {
        if (r.deposit_status === 'not_paid' && (r.status === 'pending' || r.status === 'deposited')) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<DollarCircleOutlined />}
              onClick={() => handleOpenDepositModal(r)}
              style={{ background: '#d46b08', borderColor: '#d46b08' }}
            >
              Nộp cọc 100k
            </Button>
          )
        }
        if (r.deposit_status === 'pending_verification' || r.status === 'deposited') {
          return (
            <Button size="small" onClick={() => handleOpenDepositModal(r)}>
              Xem mã QR
            </Button>
          )
        }
        return <span style={{ color: '#52c41a', fontSize: 13 }}>✓ Hoàn tất cọc</span>
      }
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003366' }}>LỊCH HẸN KHÁM CỦA TÔI</Title>
          <Text type="secondary">Theo dõi trạng thái duyệt cọc và thời gian đến khám tại phòng khám</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/patient/booking')}>
            Đặt lịch mới
          </Button>
        </Space>
      </div>

      <Alert
        message="Hỗ trợ đổi ngày giờ khám qua Zalo"
        description="Nếu bạn có việc đột xuất không thể đến đúng hẹn, vui lòng liên hệ trực tiếp Zalo phòng khám: 0901.234.567 để nhân viên lễ tân hỗ trợ đổi lịch sang ngày khác miễn phí mà không bị mất tiền đặt cọc."
        type="warning"
        showIcon
        icon={<WechatOutlined />}
        style={{ marginBottom: 20, borderRadius: 12 }}
      />

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Bạn chưa có lịch hẹn khám nào.' }}
        />
      </Card>

      {/* Modal Hướng Dẫn & Xác Nhận Chuyển Cọc */}
      <Modal
        title={`Thông tin chuyển khoản đặt cọc - Mã hẹn #${selectedAppointment?.id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={submittingDeposit}
            onClick={handleNotifyDepositInModal}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Tôi đã chuyển tiền cọc 100.000đ
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{
            background: '#f8fafc',
            border: '2px dashed #1890ff',
            borderRadius: 16,
            padding: '20px',
            textAlign: 'left',
            marginBottom: 16
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <QrcodeOutlined style={{ fontSize: 56, color: '#003366' }} />
              <div style={{ fontSize: 12, color: '#888' }}>Quét mã QR VietQR trên ứng dụng Ngân hàng</div>
            </div>
            <p style={{ margin: '4px 0' }}>Ngân hàng: <strong>MB Bank (Quân Đội)</strong></p>
            <p style={{ margin: '4px 0' }}>Số tài khoản: <strong style={{ color: '#003366', fontSize: 15 }}>999922178888</strong></p>
            <p style={{ margin: '4px 0' }}>Chủ tài khoản: <strong>PHONG KHAM NHA KHOA DA NANG</strong></p>
            <p style={{ margin: '4px 0' }}>Số tiền cọc: <strong style={{ color: '#eb2f96', fontSize: 16 }}>100.000 VNĐ</strong></p>
            <p style={{ margin: '4px 0' }}>Nội dung CK: <strong style={{ color: '#1890ff', fontSize: 15 }}>COC LH{selectedAppointment?.id}</strong></p>
          </div>
          <Paragraph type="secondary" style={{ fontSize: 12, textAlign: 'left', margin: 0 }}>
            * Sau khi thực hiện chuyển khoản trên ứng dụng ngân hàng, bạn bấm nút <strong>"Tôi đã chuyển tiền cọc 100.000đ"</strong> bên dưới để lễ tân kiểm tra và duyệt lịch hẹn cho bạn.
          </Paragraph>
        </div>
      </Modal>
    </div>
  )
}
