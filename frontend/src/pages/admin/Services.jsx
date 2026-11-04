import { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, InputNumber, Switch, Popconfirm } from 'antd'
import { ToolOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getServices, createService, updateService, deleteService } from '../../api/services'
import { formatMoney } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await getServices({ search })
      setServices(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách dịch vụ.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (service = null) => {
    setEditingService(service)
    if (service) {
      form.setFieldsValue(service)
    } else {
      form.resetFields()
      form.setFieldsValue({ duration_minutes: 30, is_active: true })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (values) => {
    try {
      if (editingService) {
        await updateService(editingService.id, values)
        toast.success('Cập nhật dịch vụ thành công!')
      } else {
        await createService(values)
        toast.success('Thêm dịch vụ nha khoa mới thành công!')
      }
      setIsModalOpen(false)
      fetchServices()
    } catch {
      toast.error('Lỗi khi lưu dịch vụ.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteService(id)
      toast.success('Đã xóa dịch vụ!')
      fetchServices()
    } catch {
      toast.error('Không thể xóa dịch vụ này.')
    }
  }

  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (n) => <Text strong style={{ color: '#003366' }}>{n}</Text>
    },
    {
      title: 'Phân loại',
      dataIndex: 'category',
      key: 'category',
      render: (c) => c ? <Tag color="cyan">{c}</Tag> : '-'
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (p) => <Text style={{ color: '#eb2f96', fontWeight: 600 }}>{formatMoney(p)}</Text>
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (d) => `${d} phút`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (act) => act ? <Tag color="green">Đang áp dụng</Tag> : <Tag color="default">Tạm ngưng</Tag>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(r)}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa dịch vụ này?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003366' }}>DANH MỤC DỊCH VỤ NHA KHOA</Title>
          <Text type="secondary">Quản lý các dịch vụ khám, điều trị, đơn giá và thời lượng dự kiến</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm dịch vụ</Button>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space>
          <Input
            placeholder="Tìm theo tên dịch vụ..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchServices}
            style={{ width: 300 }}
          />
          <Button icon={<SearchOutlined />} onClick={fetchServices}>Tìm kiếm</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: 'Nhập tên dịch vụ!' }]}>
            <Input placeholder="Ví dụ: Tẩy trắng răng, Nhổ răng khôn..." />
          </Form.Item>
          <Form.Item name="category" label="Danh mục / Phân loại">
            <Input placeholder="Ví dụ: Thẩm mỹ, Phẫu thuật, Nha chu, Chỉnh nha..." />
          </Form.Item>
          <Form.Item name="price" label="Đơn giá (VNĐ)" rules={[{ required: true, message: 'Nhập đơn giá!' }]}>
            <InputNumber
              min={0}
              step={50000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="duration_minutes" label="Thời lượng dự kiến (phút)" rules={[{ required: true }]}>
            <InputNumber min={5} max={300} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={3} placeholder="Mô tả kỹ thuật thực hiện hoặc lưu ý..." />
          </Form.Item>
          <Form.Item name="is_active" label="Trạng thái áp dụng" valuePropName="checked">
            <Switch checkedChildren="Áp dụng" unCheckedChildren="Tạm ngưng" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu dịch vụ</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
