import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Form, DatePicker, Select, Input, Tag, Space,
  Typography, Popconfirm, Modal, Row, Col, Statistic, Tooltip, Badge
} from 'antd'
import {
  CalendarOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined,
  TeamOutlined, MedicineBoxOutlined, ClockCircleOutlined, UserOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getMySchedules, createSchedule, deleteSchedule } from '../../api/schedules'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const res = await getMySchedules()
      setSchedules(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải lịch làm việc.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async (values) => {
    try {
      const payload = {
        date: values.date.format('YYYY-MM-DD'),
        session: values.session,
        note: values.note || ''
      }
      await createSchedule(payload)
      toast.success('Đăng ký ca làm việc thành công!')
      setIsModalOpen(false)
      form.resetFields()
      fetchSchedules()
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.date?.[0] || 'Lỗi khi đăng ký ca làm việc (có thể bạn đã đăng ký ngày này rồi).'
      toast.error(msg)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id)
      toast.success('Đã hủy đăng ký ca làm việc!')
      fetchSchedules()
    } catch {
      toast.error('Không thể hủy ca làm này.')
    }
  }

  const handleViewPatients = (schedule) => {
    setSelectedSchedule(schedule)
    setPatientModalOpen(true)
  }

  // Thống kê nhanh
  const todayStr = dayjs().format('YYYY-MM-DD')
  const todaySchedule = schedules.find(s => s.date === todayStr)
  const totalPatientsToday = todaySchedule ? (todaySchedule.patient_count || 0) : 0
  const totalUpcomingPatients = schedules.reduce((sum, s) => sum + (s.patient_count || 0), 0)

  const columns = [
    {
      title: 'Ngày làm việc',
      dataIndex: 'date',
      key: 'date',
      render: (d) => {
        const isToday = d === todayStr
        return (
          <Space orientation="vertical" size={2}>
            <Text strong orientation="horizontal">
              {formatDate(d)} {isToday && <Tag color="blue">Hôm nay</Tag>}
            </Text>
            <span style={{ fontSize: 12, color: '#888' }}>{dayjs(d).format('dddd')}</span>
          </Space>
        )
      }
    },
    {
      title: 'Ca làm việc đăng ký',
      dataIndex: 'session',
      key: 'session',
      render: (s) => {
        if (s === 'morning') return <Tag color="orange" style={{ fontSize: 13 }}>Buổi Sáng (8:00 - 12:00)</Tag>
        if (s === 'afternoon') return <Tag color="blue" style={{ fontSize: 13 }}>Buổi Chiều (13:00 - 17:00)</Tag>
        return <Tag color="green" style={{ fontSize: 13 }}>Cả Ngày (8:00 - 17:00)</Tag>
      }
    },
    {
      title: 'Bệnh nhân đăng ký (Giới hạn 10 BN/ca)',
      key: 'patients_registered',
      render: (_, r) => {
        const total = r.patient_count || 0
        const mCount = r.morning_count || 0
        const aCount = r.afternoon_count || 0

        return (
          <Space direction="vertical" size={4}>
            <Space orientation="horizontal" size={6}>
              {r.session === 'morning' && (
                <Tag color={mCount >= 10 ? 'red' : mCount > 0 ? 'orange' : 'default'} style={{ fontSize: 13, padding: '2px 8px' }}>
                  Sáng: <strong>{mCount}/10 BN</strong> {mCount >= 10 && '(Kín lịch)'}
                </Tag>
              )}
              {r.session === 'afternoon' && (
                <Tag color={aCount >= 10 ? 'red' : aCount > 0 ? 'blue' : 'default'} style={{ fontSize: 13, padding: '2px 8px' }}>
                  Chiều: <strong>{aCount}/10 BN</strong> {aCount >= 10 && '(Kín lịch)'}
                </Tag>
              )}
              {r.session === 'full' && (
                <>
                  <Tag color={mCount >= 10 ? 'red' : mCount > 0 ? 'orange' : 'default'}>
                    Sáng: <strong>{mCount}/10</strong>
                  </Tag>
                  <Tag color={aCount >= 10 ? 'red' : aCount > 0 ? 'blue' : 'default'}>
                    Chiều: <strong>{aCount}/10</strong>
                  </Tag>
                </>
              )}
            </Space>

            <div>
              <Button
                type="link"
                size="small"
                icon={<TeamOutlined />}
                onClick={() => handleViewPatients(r)}
                style={{ padding: 0, fontWeight: 600, color: total > 0 ? '#1677ff' : '#888' }}
              >
                {total > 0 ? `Xem chi tiết ${total} bệnh nhân đã đăng ký` : 'Chưa có bệnh nhân nào'}
              </Button>
            </div>
          </Space>
        )
      }
    },
    {
      title: 'Trạng thái ca trực',
      dataIndex: 'status',
      key: 'status',
      render: (st) => {
        if (st === 'approved') return <Tag color="green">Đã duyệt (Chính thức)</Tag>
        if (st === 'cancelled') return <Tag color="red">Đã hủy</Tag>
        return <Tag color="gold">Đã đăng ký (Chờ duyệt)</Tag>
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (n) => n || '-'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Space orientation="horizontal" size={8}>
          <Button
            type="primary"
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleViewPatients(r)}
          >
            Chi tiết ca
          </Button>
          {r.patient_count === 0 && (
            <Popconfirm title="Hủy đăng ký ca làm việc này?" onConfirm={() => handleDelete(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>Hủy ca</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  // Columns trong Modal danh sách bệnh nhân
  const patientColumns = [
    {
      title: 'Mã hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong style={{ color: '#003a8c' }}>#{id}</strong>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, p) => (
        <div>
          <Text strong>{p.patient_name}</Text>
          <div style={{ fontSize: 12, color: '#888' }}>SĐT: {p.phone || 'Chưa cập nhật'}</div>
        </div>
      )
    },
    {
      title: 'Dịch vụ yêu cầu',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (s) => <Tag color="cyan">{s}</Tag>
    },
    {
      title: 'Ca khám',
      dataIndex: 'session',
      key: 'session',
      render: (s) => s === 'morning' ? <Tag color="orange">Sáng (8h-12h)</Tag> : <Tag color="blue">Chiều (13h-17h)</Tag>
    },
    {
      title: 'Trạng thái tiếp nhận',
      key: 'status',
      render: (_, p) => {
        if (p.status === 'checked_in') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Đã có mặt tại quầy (Chờ khám)</Tag>
        }
        if (p.status === 'in_progress') {
          return <Tag color="geekblue">Đang trong phòng khám</Tag>
        }
        if (p.status === 'completed') {
          return <Tag color="purple">Đã khám xong & Lưu bệnh án</Tag>
        }
        return <Tag color={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status] || p.status_display}</Tag>
      }
    },
    {
      title: 'Triệu chứng / Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (r) => <span style={{ fontSize: 13, color: '#555' }}>{r || '-'}</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, p) => (
        <Button
          type="primary"
          size="small"
          icon={<MedicineBoxOutlined />}
          onClick={() => {
            setPatientModalOpen(false)
            navigate('/doctor/examination')
          }}
          style={{ background: '#003a8c' }}
        >
          {p.status === 'completed' ? 'Xem bệnh án' : 'Vào khám'}
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003a8c' }}>LỊCH TRỰC & NẮM BẮT CÔNG VIỆC BÁC SĨ</Title>
          <Text type="secondary">Theo dõi số lượng bệnh nhân đã đăng ký theo từng ca để chủ động điều phối chuyên môn</Text>
        </div>
        <Space orientation="horizontal" size={8}>
          <Button icon={<ReloadOutlined />} onClick={fetchSchedules}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Đăng ký ca mới
          </Button>
        </Space>
      </div>

      {/* Thẻ thống kê tổng quan ca làm & bệnh nhân */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', border: '1px solid #91caff' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#003a8c' }}>Ca làm việc hôm nay</span>}
              value={todaySchedule ? (todaySchedule.session === 'morning' ? 'Buổi Sáng' : todaySchedule.session === 'afternoon' ? 'Buổi Chiều' : 'Cả Ngày') : 'Không có ca trực'}
              prefix={<CalendarOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ fontSize: 20, color: '#003a8c', fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Ngày: <strong>{dayjs().format('DD/MM/YYYY')}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)', border: '1px solid #b7eb8f' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#135200' }}>Bệnh nhân đăng ký hôm nay</span>}
              value={totalPatientsToday}
              suffix="/ 20 tối đa"
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontSize: 24, color: '#52c41a', fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {todaySchedule ? (
                <span>Sáng: <strong>{todaySchedule.morning_count || 0}/10</strong> | Chiều: <strong>{todaySchedule.afternoon_count || 0}/10</strong></span>
              ) : 'Hôm nay chưa có lịch trực'}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)', border: '1px solid #ffd591' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#873800' }}>Tổng bệnh nhân các ca sắp tới</span>}
              value={totalUpcomingPatients}
              prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ fontSize: 24, color: '#d46b08', fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Dữ liệu đồng bộ trực tiếp từ các ca đặt lịch trực tuyến
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal đăng ký ca */}
      <Modal
        title="Đăng ký ca làm việc mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSchedule} initialValues={{ session: 'full' }}>
          <Form.Item
            name="date"
            label="Chọn ngày làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc!' }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item name="session" label="Ca làm việc" rules={[{ required: true }]}>
            <Select size="large">
              <Option value="morning">Buổi Sáng (8:00 - 12:00) — Tối đa 10 bệnh nhân</Option>
              <Option value="afternoon">Buổi Chiều (13:00 - 17:00) — Tối đa 10 bệnh nhân</Option>
              <Option value="full">Cả Ngày Hành Chính (8:00 - 17:00) — Tối đa 20 bệnh nhân</Option>
            </Select>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú cá nhân (nếu có)">
            <Input.TextArea rows={3} placeholder="Ví dụ: Có thể phụ trách các ca tiểu phẫu nhổ răng khôn..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Xác nhận đăng ký</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal chi tiết danh sách bệnh nhân đã đăng ký của ca trực */}
      <Modal
        title={
          <div>
            <span style={{ color: '#003a8c', fontSize: 16 }}>
              DANH SÁCH BỆNH NHÂN ĐĂNG KÝ — NGÀY {selectedSchedule ? formatDate(selectedSchedule.date) : ''}
            </span>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4, fontWeight: 'normal' }}>
              Ca làm việc:{' '}
              {selectedSchedule?.session === 'morning' ? 'Buổi Sáng (8h-12h)' : selectedSchedule?.session === 'afternoon' ? 'Buổi Chiều (13h-17h)' : 'Cả Ngày (8h-17h)'}
              {' '}| Tổng số: <strong>{selectedSchedule?.patient_count || 0} bệnh nhân</strong>
            </div>
          </div>
        }
        open={patientModalOpen}
        onCancel={() => setPatientModalOpen(false)}
        width={920}
        footer={[
          <Button key="close" onClick={() => setPatientModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="exam"
            type="primary"
            icon={<MedicineBoxOutlined />}
            onClick={() => {
              setPatientModalOpen(false)
              navigate('/doctor/examination')
            }}
            style={{ background: '#003a8c' }}
          >
            Chuyển đến Phòng khám bệnh
          </Button>
        ]}
      >
        <Table
          columns={patientColumns}
          dataSource={selectedSchedule?.patients_summary || []}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          locale={{ emptyText: 'Chưa có bệnh nhân nào đặt lịch cho ca làm việc này.' }}
        />
      </Modal>
    </div>
  )
}
