import { useState, useEffect } from 'react'
import {
  Card, Table, Tag, Typography, Button, Input, DatePicker,
  Space, Row, Col, Statistic, Modal, Divider, Spin
} from 'antd'
import {
  HistoryOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined,
  CalendarOutlined, UserOutlined, EyeOutlined, MedicineBoxOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { getMedicalRecords } from '../../api/medical'
import { getAppointments } from '../../api/appointments'
import { formatDate } from '../../utils/helpers'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function DoctorExaminationHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await getMedicalRecords()
      const list = res.data.results || res.data || []
      setRecords(list)
    } catch {
      toast.error('Không thể tải lịch sử khám bệnh.')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(r => {
    const pName = r.patient_name || `${r.patient?.user?.first_name || ''} ${r.patient?.user?.last_name || ''}`.trim() || ''
    const pPhone = r.patient?.user?.phone || r.patient_phone || ''
    const matchSearch = !search ||
      pName.toLowerCase().includes(search.toLowerCase()) ||
      pPhone.includes(search) ||
      (r.diagnosis && r.diagnosis.toLowerCase().includes(search.toLowerCase())) ||
      (r.treatment_performed && r.treatment_performed.toLowerCase().includes(search.toLowerCase()))

    let matchDate = true
    if (selectedDate && r.appointment_info?.appointment_date) {
      matchDate = r.appointment_info.appointment_date === selectedDate.format('YYYY-MM-DD')
    } else if (selectedDate && r.created_at) {
      matchDate = dayjs(r.created_at).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
    }

    return matchSearch && matchDate
  })

  // Thống kê nhanh
  const todayStr = dayjs().format('YYYY-MM-DD')
  const examinedTodayCount = records.filter(r => {
    const d = r.appointment_info?.appointment_date || dayjs(r.created_at).format('YYYY-MM-DD')
    return d === todayStr
  }).length

  const handleOpenDetail = (record) => {
    setSelectedRecord(record)
    setDetailModalOpen(true)
  }

  const columns = [
    {
      title: 'Mã HSBA',
      key: 'id',
      width: 90,
      render: (_, r) => <strong style={{ color: '#003a8c' }}>#{r.id}</strong>
    },
    {
      title: 'Thời gian khám (Khung 30p)',
      key: 'time',
      width: 200,
      render: (_, r) => {
        const appDate = r.appointment_info?.appointment_date || dayjs(r.created_at).format('YYYY-MM-DD')
        const slot = r.appointment_info?.time_slot
        const session = r.appointment_info?.session
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#003a8c' }}>
              <CalendarOutlined style={{ marginRight: 6 }} />
              {formatDate(appDate)}
            </div>
            <Space size={4} style={{ marginTop: 2 }}>
              <Tag color={session === 'morning' ? 'orange' : 'blue'}>
                {session === 'morning' ? 'Sáng' : 'Chiều'}
              </Tag>
              {slot && (
                <Tag color="geekblue" icon={<ClockCircleOutlined />} style={{ fontWeight: 700 }}>
                  {slot}
                </Tag>
              )}
            </Space>
          </div>
        )
      }
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, r) => {
        const name = r.patient_name || `${r.patient?.user?.first_name || ''} ${r.patient?.user?.last_name || ''}`.trim() || 'Bệnh nhân'
        const phone = r.patient?.user?.phone || r.patient_phone || '-'
        return (
          <div>
            <Text strong style={{ color: '#111827' }}>
              <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
              {name}
            </Text>
            <div style={{ fontSize: 12, color: '#0958d9', marginTop: 2 }}>
              SĐT: <strong>{phone}</strong>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Dịch vụ thực hiện',
      key: 'service',
      render: (_, r) => (
        <Tag color="cyan">
          {r.appointment_info?.service_name || r.treatment_performed || 'Khám nha khoa'}
        </Tag>
      )
    },
    {
      title: 'Chẩn đoán bệnh lý',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (d) => <span style={{ color: '#cf1322', fontWeight: 500 }}>{d || 'Chưa ghi nhận'}</span>
    },
    {
      title: 'Thủ thuật can thiệp',
      dataIndex: 'treatment_performed',
      key: 'treatment',
      render: (t) => <span style={{ color: '#15803d' }}>{t || 'Không có'}</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: () => (
        <Tag color="purple" icon={<CheckCircleOutlined />}>
          Đã khám hoàn tất
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      render: (_, r) => (
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleOpenDetail(r)}
          style={{ background: '#003a8c' }}
        >
          Xem bệnh án
        </Button>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003a8c' }}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            LỊCH SỬ KHÁM BỆNH CỦA BÁC SĨ
          </Title>
          <Text type="secondary">
            Lưu trữ toàn bộ hồ sơ bệnh án, chẩn đoán, thủ thuật và đơn thuốc của các ca khám đã hoàn tất
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchHistory}>
          Làm mới
        </Button>
      </div>

      {/* Thẻ thống kê nhanh */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #003a8c', background: '#f0f5ff' }}>
            <Statistic
              title="Tổng số ca đã khám hoàn tất"
              value={records.length}
              suffix="lượt bệnh nhân"
              prefix={<MedicineBoxOutlined style={{ color: '#003a8c' }} />}
              valueStyle={{ color: '#003a8c', fontWeight: 700, fontSize: 24 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 12, borderLeft: '4px solid #52c41a', background: '#f6ffed' }}>
            <Statistic
              title="Số ca đã khám xong hôm nay"
              value={examinedTodayCount}
              suffix="bệnh nhân"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#389e0d', fontWeight: 700, fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc và Tìm kiếm */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo tên bệnh nhân, SĐT, chẩn đoán..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <DatePicker
            placeholder="Lọc theo ngày khám"
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            format="DD/MM/YYYY"
            allowClear
          />
          <Button onClick={() => setSelectedDate(dayjs())}>Hôm nay</Button>
          {(search || selectedDate) && (
            <Button onClick={() => { setSearch(''); setSelectedDate(null) }}>
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      </Card>

      {/* Bảng danh sách lịch sử */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có lịch sử ca khám nào.' }}
        />
      </Card>

      {/* Modal xem chi tiết Hồ sơ bệnh án */}
      <Modal
        title={`CHI TIẾT HỒ SƠ BỆNH ÁN #${selectedRecord?.id}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={650}
      >
        {selectedRecord && (
          <div style={{ lineHeight: 1.8, fontSize: 13 }}>
            <p style={{ margin: '4px 0' }}>
              Bệnh nhân: <strong style={{ color: '#003a8c', fontSize: 15 }}>{selectedRecord.patient_name || selectedRecord.patient?.user?.first_name}</strong>
            </p>
            <p style={{ margin: '4px 0' }}>
              Ngày khám: <strong>{formatDate(selectedRecord.appointment_info?.appointment_date || selectedRecord.created_at)}</strong> | Khung giờ: <Tag color="geekblue">{selectedRecord.appointment_info?.time_slot || 'Khám trong ngày'}</Tag>
            </p>
            <p style={{ margin: '4px 0' }}>
              Dịch vụ đăng ký: <strong style={{ color: '#003a8c' }}>{selectedRecord.appointment_info?.service_name || 'Khám nha khoa'}</strong>
            </p>
            <Divider style={{ margin: '12px 0' }} />

            <p style={{ margin: '6px 0' }}>
              Lý do khám ban đầu: <em>"{selectedRecord.chief_complaint || 'Không có'}"</em>
            </p>
            <p style={{ margin: '6px 0' }}>
              Chẩn đoán y khoa: <strong style={{ color: '#cf1322', fontSize: 14 }}>{selectedRecord.diagnosis || 'Chưa ghi nhận'}</strong>
            </p>
            <p style={{ margin: '6px 0' }}>
              Vị trí răng can thiệp: <strong>{selectedRecord.tooth_status || 'Không ghi nhận'}</strong>
            </p>
            <p style={{ margin: '6px 0' }}>
              Thủ thuật điều trị: <strong style={{ color: '#15803d' }}>{selectedRecord.treatment_performed || 'Không có'}</strong>
            </p>
            <p style={{ margin: '6px 0' }}>
              Lời dặn & dặn dò: <em>{selectedRecord.notes || selectedRecord.advice || 'Không có'}</em>
            </p>
            {selectedRecord.follow_up_date && (
              <p style={{ margin: '6px 0' }}>
                Hẹn ngày tái khám: <Tag color="orange">{formatDate(selectedRecord.follow_up_date)}</Tag>
              </p>
            )}

            {selectedRecord.prescription && (
              <div style={{ marginTop: 12, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#003a8c' }}>Đơn thuốc điện tử kèm theo:</strong>
                <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', color: '#444' }}>
                  {selectedRecord.prescription?.notes || selectedRecord.prescription?.items?.map(it => `- ${it.medicine_name}: ${it.dosage} (${it.instructions})`).join('\n') || 'Đã kê đơn điện tử'}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
