import { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Space, Typography, Popconfirm, DatePicker } from 'antd'
import { CheckCircleOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons'
import { getAppointments, markArrived, markNoShow } from '../../api/appointments'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function ReceptionistReception() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs())

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : ''
      const res = await getAppointments({ date: dateStr })
      setAppointments(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách tiếp nhận.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkArrived = async (id) => {
    try {
      await markArrived(id)
      toast.success('Đã tiếp nhận bệnh nhân! Thông tin đã chuyển sang phòng khám bác sĩ.')
      fetchAppointments()
    } catch {
      toast.error('Lỗi khi tiếp nhận bệnh nhân.')
    }
  }

  const handleMarkNoShow = async (id) => {
    try {
      await markNoShow(id)
      toast.success('Đã đánh dấu bệnh nhân không đến khám (No-show).')
      fetchAppointments()
    } catch {
      toast.error('Không thể cập nhật.')
    }
  }

  const columns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong>#{id}</strong>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => {
        const pInfo = r.patient_info || r.patient
        const name = pInfo?.full_name || `${pInfo?.user?.first_name || ''} ${pInfo?.user?.last_name || ''}`.trim() || pInfo?.user?.username || 'Bệnh nhân'
        const phone = pInfo?.user?.phone || '-'
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
      render: (_, r) => {
        const dInfo = r.doctor_info || r.doctor
        return `BS. ${dInfo?.user?.first_name || ''} ${dInfo?.user?.last_name || ''}`.trim() || 'Bác sĩ'
      }
    },
    {
      title: 'Dịch vụ đăng ký',
      key: 'service',
      render: (_, r) => r.service_info?.name || r.service?.name || '-'
    },
    {
      title: 'Ca khám',
      dataIndex: 'session',
      key: 'session',
      render: (s) => s === 'morning' ? <Tag color="orange">Sáng</Tag> : <Tag color="blue">Chiều</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={STATUS_COLORS[st]}>{STATUS_LABELS[st] || st}</Tag>
    },
    {
      title: 'Thao tác tiếp đón',
      key: 'actions',
      render: (_, r) => (
        <Space>
          {r.status === 'confirmed' && (
            <Popconfirm title="Xác nhận bệnh nhân đã có mặt tại quầy lễ tân?" onConfirm={() => handleMarkArrived(r.id)}>
              <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }}>
                Đã đến
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'confirmed' || r.status === 'pending_deposit') && (
            <Popconfirm title="Đánh dấu bệnh nhân vắng mặt (No-show)?" onConfirm={() => handleMarkNoShow(r.id)}>
              <Button danger size="small" icon={<StopOutlined />}>
                Vắng mặt
              </Button>
            </Popconfirm>
          )}

          {r.status === 'arrived' && <Tag color="green">Đang trong phòng khám</Tag>}
          {r.status === 'completed' && <Tag color="blue">Đã khám xong</Tag>}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#0f5132' }}>TIẾP NHẬN BỆNH NHÂN TẠI PHÒNG KHÁM</Title>
        <Text type="secondary">Xác nhận bệnh nhân đã đến phòng khám và điều phối vào danh sách chờ khám của bác sĩ</Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space>
          <DatePicker
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            format="DD/MM/YYYY"
            allowClear={false}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>Làm mới</Button>
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
