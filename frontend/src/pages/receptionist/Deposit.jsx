import { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Space, Typography, Popconfirm, Select, Tooltip } from 'antd'
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { getAppointments, confirmDeposit } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Option } = Select

export default function ReceptionistDeposit() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchDepositList()
  }, [statusFilter])

  const fetchDepositList = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const res = await getAppointments(params)
      setAppointments(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách đặt cọc.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDeposit = async (id) => {
    try {
      await confirmDeposit(id, { deposit_note: 'Lễ tân đã kiểm tra tài khoản và xác nhận cọc 100.000đ' })
      toast.success('Xác nhận tiền đặt cọc 100.000đ thành công! Lịch hẹn đã chuyển sang "Đã xác nhận".')
      fetchDepositList()
    } catch {
      toast.error('Lỗi khi xác nhận đặt cọc.')
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
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => {
        const pInfo = r.patient_info || r.patient
        const name = pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`.trim() || pInfo?.user?.username || 'Bệnh nhân'
        const phone = pInfo?.user?.phone || 'Chưa cập nhật'
        return (
          <div>
            <Text strong>{name}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>SĐT: {phone}</div>
          </div>
        )
      }
    },
    {
      title: 'Bác sĩ & Dịch vụ',
      key: 'service_doctor',
      render: (_, r) => {
        const dInfo = r.doctor_info || r.doctor
        const docName = `${dInfo?.user?.first_name || ''} ${dInfo?.user?.last_name || ''}`.trim() || dInfo?.user?.username || 'Bác sĩ'
        const serName = r.service_info?.name || r.service?.name || 'Khám nha khoa'
        return (
          <div>
            <Text strong style={{ color: '#1890ff' }}>BS. {docName}</Text>
            <div style={{ fontSize: 13, color: '#555' }}>{serName}</div>
          </div>
        )
      }
    },
    {
      title: 'Thời gian khám',
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
      title: 'Số tiền cọc',
      key: 'deposit',
      render: (_, r) => (
        <div>
          <Text strong style={{ color: '#d46b08', fontSize: 14 }}>100.000đ</Text>
          <div style={{ fontSize: 11, color: '#888' }}>
            {r.deposit_status === 'verified' ? (
              <Tag color="success">Đã đối soát</Tag>
            ) : r.deposit_status === 'pending_verification' ? (
              <Tag color="processing">Chờ đối soát</Tag>
            ) : (
              <Tag color="warning">Chưa nộp</Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái hẹn',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    },
    {
      title: 'Ghi chú cọc / Nội dung CK',
      key: 'deposit_note',
      render: (_, r) => (
        <span style={{ fontSize: 12, color: '#666' }}>
          {r.deposit_note || `COC LH${r.id}`}
        </span>
      )
    },
    {
      title: 'Xác thực cọc',
      key: 'action',
      render: (_, r) => {
        const canVerify = r.status === 'deposited' || r.status === 'pending' || r.deposit_status === 'pending_verification' || r.deposit_status === 'not_paid'
        if (canVerify) {
          return (
            <Popconfirm
              title="Xác nhận đã nhận 100.000đ tiền cọc qua Chuyển khoản / QR?"
              description={`Mã hẹn #${r.id} - Bệnh nhân sẽ nhận được trạng thái ĐÃ XÁC NHẬN.`}
              onConfirm={() => handleConfirmDeposit(r.id)}
              okText="Xác nhận đủ"
              cancelText="Hủy"
            >
              <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                Duyệt cọc 100k
              </Button>
            </Popconfirm>
          )
        }
        return <Tag color="green">Đã duyệt cọc</Tag>
      }
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#0f5132' }}>KIỂM SOÁT VÀ XÁC NHẬN TIỀN ĐẶT CỌC</Title>
        <Text type="secondary">Đối soát biến động số dư chuyển khoản 100.000đ từ bệnh nhân để phê duyệt lịch hẹn chính thức</Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space>
          <Text strong>Lọc trạng thái:</Text>
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 280 }}
          >
            <Option value="">Tất cả lịch hẹn</Option>
            <Option value="deposited">Bệnh nhân báo đã chuyển (Chờ duyệt)</Option>
            <Option value="pending">Chờ bệnh nhân chuyển cọc</Option>
            <Option value="confirmed">Đã xác nhận cọc thành công</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchDepositList}>Làm mới danh sách</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
