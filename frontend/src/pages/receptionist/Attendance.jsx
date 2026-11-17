import { useState, useEffect } from 'react'
import {
  Card, Button, Typography, DatePicker, Radio, Input, Space, Row, Col,
  Alert, Table, Tag, Divider, Spin
} from 'antd'
import {
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SaveOutlined, ReloadOutlined, SunOutlined, CloudOutlined,
  AppstoreOutlined, SafetyCertificateOutlined, UserOutlined
} from '@ant-design/icons'
import { getMyAttendance, checkInShift, getAttendances } from '../../api/schedules'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function ReceptionistAttendance() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [session, setSession] = useState('full')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentAttendance, setCurrentAttendance] = useState(null)
  const [historyList, setHistoryList] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchCurrentDateAttendance()
    fetchHistory()
  }, [selectedDate])

  const fetchCurrentDateAttendance = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD')
      const res = await getMyAttendance({ date: dateStr })
      const data = res.data
      if (data && data.session) {
        setCurrentAttendance(data)
        setSession(data.session)
        setNotes(data.notes || '')
      } else {
        setCurrentAttendance(null)
        setSession('full')
        setNotes('')
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await getAttendances()
      setHistoryList(res.data.results || res.data || [])
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSaveAttendance = async () => {
    setSubmitting(true)
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD')
      const res = await checkInShift({
        date: dateStr,
        session: session,
        notes: notes
      })
      setCurrentAttendance(res.data)
      toast.success(`Đã lưu chấm ca thành công cho ngày ${selectedDate.format('DD/MM/YYYY')}! Dữ liệu đã chuyển sang Admin để tính lương.`)
      fetchHistory()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Lỗi khi lưu chấm ca làm việc.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      title: 'Ngày làm việc',
      dataIndex: 'date',
      key: 'date',
      render: (d) => (
        <span style={{ fontWeight: 600, color: '#003a8c' }}>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {formatDate(d)}
        </span>
      )
    },
    {
      title: 'Ca làm việc đã chấm',
      dataIndex: 'session',
      key: 'session',
      render: (s) => {
        if (s === 'morning') return <Tag color="orange" icon={<SunOutlined />}>Ca Sáng (8h - 12h)</Tag>
        if (s === 'afternoon') return <Tag color="blue" icon={<CloudOutlined />}>Ca Chiều (13h - 17h)</Tag>
        return <Tag color="green" icon={<CheckCircleOutlined />}>Cả Ngày (8h - 17h)</Tag>
      }
    },
    {
      title: 'Số ca quy đổi',
      key: 'shifts',
      render: (_, r) => (
        <strong>{r.session === 'full' ? '2 buổi (Cả ngày)' : '1 buổi'}</strong>
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (n) => n || <span style={{ color: '#bbb' }}>Không có</span>
    },
    {
      title: 'Thời gian chấm',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (t) => t ? dayjs(t).format('HH:mm DD/MM/YYYY') : '-'
    }
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#0f5132' }}>
          CHẤM CA LÀM VIỆC NHÂN VIÊN
        </Title>
        <Text type="secondary">
          Điểm danh ca làm việc hằng ngày để hệ thống tự động tổng hợp số công và chuyển sang Admin tính lương
        </Text>
      </div>

      <Alert
        message="Nguyên tắc chấm công tính lương:"
        description="Nhân viên lựa chọn ngày làm việc và tick chọn Ca Sáng (8h-12h), Ca Chiều (13h-17h) hoặc Cả ngày (8h-17h) rồi bấm Lưu. Quản trị viên (Admin) sẽ căn cứ vào số ca trực thực tế này kết hợp với đơn giá ca trực đã cấu hình để tính toán bảng lương tháng tự động."
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        style={{ marginBottom: 20, borderRadius: 10 }}
      />

      <Row gutter={[20, 20]}>
        {/* KHỐI CHẤM CA TRỰC */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#0f5132' }} />
                <span>Thực hiện chấm ca làm việc</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    1. Chọn ngày làm việc cần chấm ca:
                  </label>
                  <DatePicker
                    value={selectedDate}
                    onChange={(d) => setSelectedDate(d || dayjs())}
                    format="DD/MM/YYYY"
                    allowClear={false}
                    size="large"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 10 }}>
                    2. Chọn ca làm việc trong ngày:
                  </label>
                  <Radio.Group
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    size="large"
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <Radio.Button
                      value="morning"
                      style={{
                        height: 52,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 8,
                        fontWeight: session === 'morning' ? 700 : 500
                      }}
                    >
                      <SunOutlined style={{ marginRight: 8, color: '#fa8c16', fontSize: 16 }} />
                      Ca Sáng (08:00 - 12:00) — [ 1 buổi ]
                    </Radio.Button>

                    <Radio.Button
                      value="afternoon"
                      style={{
                        height: 52,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 8,
                        fontWeight: session === 'afternoon' ? 700 : 500
                      }}
                    >
                      <CloudOutlined style={{ marginRight: 8, color: '#1890ff', fontSize: 16 }} />
                      Ca Chiều (13:00 - 17:00) — [ 1 buổi ]
                    </Radio.Button>

                    <Radio.Button
                      value="full"
                      style={{
                        height: 52,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 8,
                        fontWeight: session === 'full' ? 700 : 500
                      }}
                    >
                      <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a', fontSize: 16 }} />
                      Cả Ngày (08:00 - 17:00) — [ 2 buổi ]
                    </Radio.Button>
                  </Radio.Group>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    3. Ghi chú công việc phát sinh (tùy chọn):
                  </label>
                  <TextArea
                    rows={2}
                    placeholder="Ví dụ: Trực quầy lễ tân tiếp đón 12 bệnh nhân, hỗ trợ tính viện phí..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<SaveOutlined />}
                  loading={submitting}
                  onClick={handleSaveAttendance}
                  style={{
                    background: '#0f5132',
                    borderColor: '#0f5132',
                    height: 48,
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15
                  }}
                >
                  Lưu chấm ca & Chuyển sang Admin
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* THÔNG TIN TỔNG QUAN & TRẠNG THÁI */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: '#0f5132' }} />
                <span>Trạng thái chấm ca của bạn</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>Nhân sự đang đăng nhập:</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f5132', marginTop: 2 }}>
                {user?.first_name} {user?.last_name || user?.username} ({user?.role === 'receptionist' ? 'Nhân viên Lễ tân' : user?.role})
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Mã nhân viên: #{user?.id} | SĐT: {user?.phone || 'Chưa cập nhật'}</div>
            </div>

            <Divider style={{ margin: '14px 0' }}>Trạng thái ngày {selectedDate.format('DD/MM/YYYY')}</Divider>

            {currentAttendance ? (
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: 16, borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#389e0d', fontWeight: 700, fontSize: 15 }}>
                  <CheckCircleOutlined style={{ fontSize: 18 }} />
                  ĐÃ CHẤM CA LÀM VIỆC THÀNH CÔNG
                </div>
                <p style={{ margin: '8px 0 4px', fontSize: 14 }}>
                  Ca đã chấm: <strong>{currentAttendance.session_display || (currentAttendance.session === 'full' ? 'Cả ngày (8h-17h)' : currentAttendance.session === 'morning' ? 'Ca Sáng (8h-12h)' : 'Ca Chiều (13h-17h)')}</strong>
                </p>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  Số công quy đổi: <strong>{currentAttendance.session === 'full' ? '2 ca trực' : '1 ca trực'}</strong>
                </p>
                {currentAttendance.notes && (
                  <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>
                    Ghi chú: <em>"{currentAttendance.notes}"</em>
                  </p>
                )}
                <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                  Cập nhật lần cuối: {dayjs(currentAttendance.updated_at).format('HH:mm DD/MM/YYYY')}
                </div>
              </div>
            ) : (
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 6 }} />
                <div style={{ fontWeight: 600, color: '#d46b08' }}>
                  Chưa ghi nhận chấm ca cho ngày {selectedDate.format('DD/MM/YYYY')}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                  Vui lòng chọn 1 trong 3 ca ở khung bên trái và bấm <strong>"Lưu chấm ca"</strong> để ghi nhận công.
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* BẢNG LỊCH SỬ CHẤM CA */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <CalendarOutlined style={{ color: '#0f5132' }} />
              <span>Lịch sử chấm ca làm việc gần đây</span>
            </Space>
            <Button size="small" icon={<ReloadOutlined />} onClick={fetchHistory}>
              Làm mới
            </Button>
          </div>
        }
        style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={columns}
          dataSource={historyList}
          rowKey="id"
          loading={historyLoading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'Chưa có lịch sử chấm ca nào.' }}
        />
      </Card>
    </div>
  )
}
