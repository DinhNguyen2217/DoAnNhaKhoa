import { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Tag, Space, Modal, Form, Typography, InputNumber, Switch, Row, Col, Popconfirm, Avatar } from 'antd'
import { MedicineBoxOutlined, SearchOutlined, EditOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, UserOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons'
import { getDoctors, createDoctor, updateDoctor, deleteDoctor, toggleAvailable } from '../../api/doctors'
import { formatMoney } from '../../utils/helpers'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [editModal, setEditModal] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [form] = Form.useForm()
  const [createForm] = Form.useForm()

  // Avatar upload states
  const [createAvatarFile, setCreateAvatarFile] = useState(null)
  const [createAvatarPreview, setCreateAvatarPreview] = useState(null)
  const [editAvatarFile, setEditAvatarFile] = useState(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await getDoctors({ search })
      setDoctors(res.data.results || res.data || [])
    } catch {
      toast.error('Không thể tải danh sách bác sĩ.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WEBP)!')
        return
      }
      setCreateAvatarFile(file)
      setCreateAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleEditAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WEBP)!')
        return
      }
      setEditAvatarFile(file)
      setEditAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCreate = async (values) => {
    try {
      const formData = new FormData()
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })
      if (createAvatarFile) {
        formData.append('avatar', createAvatarFile)
      }

      await createDoctor(formData)
      toast.success('Thêm bác sĩ mới thành công! Bác sĩ và ảnh sẽ tự động hiển thị trên Trang chủ khách hàng.')
      setCreateModal(false)
      createForm.resetFields()
      setCreateAvatarFile(null)
      setCreateAvatarPreview(null)
      fetchDoctors()
    } catch (err) {
      const data = err.response?.data
      const firstErr = typeof data === 'object' ? Object.values(data)[0] : 'Lỗi khi thêm bác sĩ.'
      toast.error(Array.isArray(firstErr) ? firstErr[0] : firstErr)
    }
  }

  const handleEdit = (record) => {
    setSelectedDoc(record)
    setEditAvatarFile(null)
    setEditAvatarPreview(record.avatar || record.user?.avatar || null)
    form.setFieldsValue({
      first_name: record.user?.first_name,
      last_name: record.user?.last_name,
      phone: record.user?.phone,
      email: record.user?.email,
      specialty: record.specialty,
      experience_years: record.experience_years,
      consultation_fee: record.consultation_fee,
      description: record.description
    })
    setEditModal(true)
  }

  const handleSaveEdit = async (values) => {
    try {
      const formData = new FormData()
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })
      if (editAvatarFile) {
        formData.append('avatar', editAvatarFile)
      }

      await updateDoctor(selectedDoc.id, formData)
      toast.success('Cập nhật hồ sơ bác sĩ thành công! Thông tin và ảnh mới đã được đồng bộ.')
      setEditModal(false)
      setEditAvatarFile(null)
      setEditAvatarPreview(null)
      fetchDoctors()
    } catch {
      toast.error('Lỗi khi cập nhật hồ sơ bác sĩ.')
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleAvailable(id)
      toast.success('Đã cập nhật trạng thái làm việc của bác sĩ!')
      fetchDoctors()
    } catch {
      toast.error('Không thể cập nhật trạng thái.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id)
      toast.success('Đã xóa bác sĩ khỏi hệ thống!')
      fetchDoctors()
    } catch {
      toast.error('Không thể xóa bác sĩ.')
    }
  }

  const columns = [
    {
      title: 'Bác sĩ',
      key: 'name',
      render: (_, r) => {
        const avatarUrl = r.avatar || r.user?.avatar
        return (
          <Space align="center" size={14}>
            <Avatar
              size={52}
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: avatarUrl ? 'transparent' : '#1890ff',
                border: '2px solid #91d5ff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                flexShrink: 0
              }}
            />
            <div>
              <Text strong style={{ color: '#003366', fontSize: 14 }}>
                BS. {r.user?.first_name} {r.user?.last_name || r.user?.username}
              </Text>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                SĐT: {r.user?.phone || 'Chưa có SĐT'} | Email: {r.user?.email || 'Chưa có'}
              </div>
            </div>
          </Space>
        )
      }
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (s) => <Tag color="blue" style={{ fontSize: 12 }}>{s}</Tag>
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience_years',
      key: 'experience_years',
      render: (y) => <strong>{y} năm</strong>
    },
    {
      title: 'Phí khám',
      dataIndex: 'consultation_fee',
      key: 'consultation_fee',
      render: (f) => <Text style={{ color: '#eb2f96', fontWeight: 600 }}>{formatMoney(f)}</Text>
    },
    {
      title: 'Hiển thị trang chủ',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (available, r) => (
        <Switch
          checked={available}
          checkedChildren="Hiện"
          unCheckedChildren="Ẩn"
          onChange={() => handleToggle(r.id)}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>
            Sửa
          </Button>
          <Popconfirm title="Xác nhận xóa bác sĩ này?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#003366' }}>QUẢN LÝ ĐỘI NGŨ BÁC SĨ</Title>
          <Text type="secondary">
            Bác sĩ và hình ảnh đại diện được thêm hoặc cập nhật tại đây sẽ tự động hiển thị trực tiếp trên Trang chủ của Bệnh nhân
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCreateAvatarFile(null)
            setCreateAvatarPreview(null)
            createForm.resetFields()
            setCreateModal(true)
          }}
        >
          Thêm bác sĩ mới
        </Button>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space>
          <Input
            placeholder="Tìm theo tên bác sĩ, chuyên khoa..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchDoctors}
            style={{ width: 320 }}
          />
          <Button icon={<SearchOutlined />} onClick={fetchDoctors}>Tìm kiếm</Button>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); fetchDoctors() }}>Làm mới</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal thêm bác sĩ mới */}
      <Modal
        title="Thêm bác sĩ chuyên khoa mới (Tự động hiển thị ra Trang chủ)"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        footer={null}
        width={720}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} initialValues={{ experience_years: 5, consultation_fee: 200000 }}>
          {/* Avatar upload section */}
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 10, marginBottom: 20, border: '1px solid #e2e8f0' }}>
            <Text strong style={{ color: '#003366', display: 'block', marginBottom: 10 }}>
              <CameraOutlined style={{ marginRight: 6, color: '#1890ff' }} />
              Ảnh chân dung đại diện bác sĩ (Hiển thị cho bệnh nhân):
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Avatar
                size={80}
                src={createAvatarPreview}
                icon={<UserOutlined style={{ fontSize: 40 }} />}
                style={{
                  backgroundColor: createAvatarPreview ? 'transparent' : '#e6f7ff',
                  color: '#1890ff',
                  border: '2px dashed #91d5ff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  id="create-doctor-avatar-input"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleCreateAvatarChange}
                />
                <Space wrap>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => document.getElementById('create-doctor-avatar-input').click()}
                  >
                    Chọn ảnh từ máy tính
                  </Button>
                  {createAvatarPreview && (
                    <Button
                      danger
                      onClick={() => {
                        setCreateAvatarFile(null)
                        setCreateAvatarPreview(null)
                      }}
                    >
                      Hủy ảnh
                    </Button>
                  )}
                </Space>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                  Hỗ trợ định dạng JPG, PNG, WEBP (dung lượng tối ưu dưới 5MB). Hình ảnh rõ nét sẽ giúp bệnh nhân tin tưởng và dễ nhận diện bác sĩ.
                </div>
              </div>
            </div>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="first_name" label="Họ và tên đệm" rules={[{ required: true, message: 'Nhập họ đệm!' }]}>
                <Input placeholder="Ví dụ: Nguyễn Văn" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="last_name" label="Tên bác sĩ" rules={[{ required: true, message: 'Nhập tên bác sĩ!' }]}>
                <Input placeholder="Ví dụ: Hùng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập username!' }]}>
                <Input placeholder="Ví dụ: bshung" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="password" label="Mật khẩu tài khoản" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự!' }]}>
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="specialty" label="Lĩnh vực chuyên khoa" rules={[{ required: true, message: 'Nhập chuyên khoa!' }]}>
                <Input placeholder="Ví dụ: Chỉnh nha & Niềng răng, Cấy ghép Implant, Nha khoa thẩm mỹ..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="experience_years" label="Số năm kinh nghiệm" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="consultation_fee" label="Phí khám (VNĐ)" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  step={50000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Số điện thoại liên hệ">
                <Input placeholder="09xxxxxxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email">
            <Input placeholder="bacsi@nhakhoa.com" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết về bác sĩ (Học vị, thế mạnh, quá trình đào tạo... sẽ hiển thị trên Trang chủ)"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Thạc sĩ - Bác sĩ Răng Hàm Mặt, tốt nghiệp ĐH Y Dược. Hơn 8 năm kinh nghiệm trong lĩnh vực niềng răng trong suốt và chỉnh nha chuyên sâu..."
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setCreateModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu và Công bố ra Trang chủ</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa bác sĩ */}
      <Modal
        title={`Chỉnh sửa: BS. ${selectedDoc?.user?.first_name} ${selectedDoc?.user?.last_name || ''}`}
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          {/* Avatar edit section */}
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 10, marginBottom: 20, border: '1px solid #e2e8f0' }}>
            <Text strong style={{ color: '#003366', display: 'block', marginBottom: 10 }}>
              <CameraOutlined style={{ marginRight: 6, color: '#1890ff' }} />
              Ảnh chân dung đại diện bác sĩ:
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Avatar
                size={80}
                src={editAvatarPreview}
                icon={<UserOutlined style={{ fontSize: 40 }} />}
                style={{
                  backgroundColor: editAvatarPreview ? 'transparent' : '#e6f7ff',
                  color: '#1890ff',
                  border: '2px solid #91d5ff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  id="edit-doctor-avatar-input"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleEditAvatarChange}
                />
                <Space wrap>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => document.getElementById('edit-doctor-avatar-input').click()}
                  >
                    Thay đổi ảnh đại diện
                  </Button>
                  {editAvatarFile && (
                    <Button
                      onClick={() => {
                        setEditAvatarFile(null)
                        setEditAvatarPreview(selectedDoc?.avatar || selectedDoc?.user?.avatar || null)
                      }}
                    >
                      Khôi phục ảnh cũ
                    </Button>
                  )}
                </Space>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                  {editAvatarFile ? 'Đã chọn ảnh mới. Bấm "Cập nhật" để lưu ảnh này.' : 'Nếu không muốn đổi ảnh, bạn có thể giữ nguyên.'}
                </div>
              </div>
            </div>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="first_name" label="Họ và tên đệm">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="last_name" label="Tên bác sĩ">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="specialty" label="Chuyên khoa" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="experience_years" label="Số năm kinh nghiệm" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="consultation_fee" label="Phí khám (VNĐ)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              step={10000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết về bác sĩ">
            <Input.TextArea rows={4} />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setEditModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Cập nhật</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
