import { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Button, Space, Alert, Popconfirm, Modal, Input, Avatar } from 'antd'
import {
  CalendarOutlined, PlusOutlined, WechatOutlined, ReloadOutlined,
  ClockCircleOutlined, CloseCircleOutlined, CheckCircleOutlined,
  InfoCircleOutlined, PhoneOutlined, DeleteOutlined, UserOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getMyAppointments, cancelAppointment, deleteAppointmentHistory } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancellingAppointment, setCancellingAppointment] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [submittingCancel, setSubmittingCancel] = useState(false)
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

  const handleOpenCancelModal = (appointment) => {
    setCancellingAppointment(appointment)
    setCancelReason('')
    setCancelModalVisible(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment?.id) return
    setSubmittingCancel(true)
    try {
      await cancelAppointment(cancellingAppointment.id, {
        cancellation_reason: cancelReason || 'Bệnh nhân tự hủy trong vòng 30 phút'
      })
      toast.success('Đã hủy lịch hẹn thành công. Khung giờ này đã được giải phóng để bệnh nhân khác có thể đặt!')
      setCancelModalVisible(false)
      fetchAppointments()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Không thể hủy lịch hẹn.'
      toast.error(msg)
    } finally {
      setSubmittingCancel(false)
    }
  }

  const handleDeleteHistory = async (id) => {
    try {
      await deleteAppointmentHistory(id)
      toast.success('Đã xóa lịch hẹn khỏi danh sách lịch sử của bạn.')
      fetchAppointments()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Không thể xóa lịch hẹn này.'
      toast.error(msg)
    }
  }

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <strong style={{ color: '#003366' }}>#{id}</strong>
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      render: (_, r) => {
        const dInfo = r.doctor_info || r.doctor
        const docName = `${dInfo?.user?.first_name || ''} ${dInfo?.user?.last_name || ''}`.trim() || dInfo?.user?.username || 'Bác sĩ'
        const avatarUrl = dInfo?.avatar || dInfo?.user?.avatar
        return (
          <Space align="center" size={10}>
            <Avatar size={36} src={avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', flexShrink: 0 }} />
            <div>
              <Text strong>BS. {docName}</Text>
              {dInfo?.specialty && (
                <div style={{ fontSize: 12, color: '#666' }}>{dInfo.specialty}</div>
              )}
            </div>
          </Space>
        )
      }
    },
    {
      title: 'Dịch vụ khám',
      key: 'service',
      render: (_, r) => (
        <span style={{ fontWeight: 500, color: '#1f2937' }}>
          {r.service_info?.name || r.service?.name || 'Khám nha khoa'}
        </span>
      )
    },
    {
      title: 'Thời gian khám (Khung 30p)',
      key: 'time',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#003366' }}>{formatDate(r.appointment_date)}</div>
          <Space size={4} style={{ marginTop: 3 }}>
            <Tag color={r.session === 'morning' ? 'orange' : 'blue'}>
              {r.session === 'morning' ? 'Sáng' : 'Chiều'}
            </Tag>
            {r.time_slot ? (
              <Tag color="geekblue" icon={<ClockCircleOutlined />} style={{ fontWeight: 600 }}>
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    },
    {
      title: 'Hủy / Thao tác lịch sử',
      key: 'actions',
      render: (_, r) => {
        // 1. Lịch đã khám hoàn tất -> Được phép xóa lịch sử để làm sạch trang
        if (r.status === 'completed') {
          return (
            <Popconfirm
              title="Xóa lịch hẹn này khỏi lịch sử?"
              description="Buổi khám đã hoàn tất. Xóa sẽ giúp trang lịch sử của bạn sạch đẹp hơn."
              onConfirm={() => handleDeleteHistory(r.id)}
              okText="Xóa"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa lịch sử
              </Button>
            </Popconfirm>
          )
        }

        // 2. Lịch đã hủy -> Cho phép xóa khỏi danh sách
        if (r.status === 'cancelled') {
          return (
            <Space size={8}>
              <span style={{ color: '#999', fontSize: 12 }}>Đã hủy</span>
              <Popconfirm
                title="Xóa lịch đã hủy này khỏi lịch sử?"
                onConfirm={() => handleDeleteHistory(r.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button size="small" type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          )
        }

        // 3. Lịch đang khám hoặc đã check-in -> Không được xóa
        if (['checked_in', 'in_progress'].includes(r.status)) {
          return <span style={{ color: '#1677ff', fontSize: 12, fontWeight: 500 }}>Đang khám (Không xóa)</span>
        }

        // 4. Lịch đang đợi khám (confirmed / pending) -> Tuyệt đối không được xóa, chỉ được hủy trong 30p
        if (r.can_cancel) {
          const remainingMinutes = Math.max(1, 30 - (r.minutes_since_created || 0))
          return (
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleOpenCancelModal(r)}
            >
              Hủy lịch ({remainingMinutes}p)
            </Button>
          )
        }

        // Quá 30 phút: Không được hủy trên web và không được xóa
        return (
          <div style={{ fontSize: 12, color: '#666' }}>
            <span>Đang chờ khám: </span>
            <a href="tel:0901234567" style={{ color: '#0050b3', fontWeight: 600 }}>
              LH 0901.234.567
            </a>
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003366' }}>LỊCH HẸN KHÁM CỦA TÔI</Title>
          <Text type="secondary">Theo dõi khung giờ khám 30 phút và quản lý trạng thái lịch hẹn</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/patient/booking')}>
            Đặt lịch mới
          </Button>
        </Space>
      </div>

      <Alert
        message="Chính sách tiếp nhận & Hủy / Đổi lịch khám"
        description="Quý khách có thể tự hủy lịch hẹn trên hệ thống trong vòng 30 phút sau khi đặt (khung giờ sẽ lập tức mở lại cho người khác đặt). Sau 30 phút hoặc nếu cần đổi sang bác sĩ/khung giờ khác, quý khách vui lòng liên hệ trực tiếp Zalo/Hotline: 0901.234.567 để nhân viên lễ tân hỗ trợ."
        type="info"
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

      {/* Modal xác nhận tự hủy lịch hẹn */}
      <Modal
        title={`Xác nhận hủy lịch hẹn #${cancellingAppointment?.id}`}
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setCancelModalVisible(false)}>
            Không hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={submittingCancel}
            onClick={handleConfirmCancel}
          >
            Xác nhận hủy lịch
          </Button>
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <Alert
            type="warning"
            showIcon
            message="Bạn đang thực hiện quyền tự hủy lịch trong vòng 30 phút"
            description="Sau khi hủy, khung giờ này sẽ được giải phóng ngay lập tức trên hệ thống để bệnh nhân khác có thể đặt."
            style={{ marginBottom: 16 }}
          />

          <p style={{ margin: '4px 0' }}>
            Dịch vụ: <strong>{cancellingAppointment?.service_info?.name}</strong>
          </p>
          <p style={{ margin: '4px 0' }}>
            Ngày khám: <strong>{cancellingAppointment?.appointment_date && formatDate(cancellingAppointment.appointment_date)}</strong>
          </p>
          <p style={{ margin: '4px 0' }}>
            Khung giờ: <strong style={{ color: '#0050b3' }}>{cancellingAppointment?.time_slot}</strong>
          </p>

          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Lý do hủy lịch (tùy chọn):
            </label>
            <TextArea
              rows={2}
              placeholder="Ví dụ: Đặt nhầm giờ khám, có việc bận đột xuất..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
