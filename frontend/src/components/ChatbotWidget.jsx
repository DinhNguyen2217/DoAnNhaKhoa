import { useState, useRef, useEffect } from 'react'
import { Button, Input, Card, Avatar, Typography, Space, Spin } from 'antd'
import {
  MessageOutlined, CloseOutlined, SendOutlined,
  RobotOutlined, UserOutlined, ClearOutlined
} from '@ant-design/icons'
import { sendChatMessage } from '../api/chatbot'
import toast from 'react-hot-toast'

const { Text } = Typography

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI của Phòng khám Nha khoa. Tôi có thể giúp bạn tra cứu thông tin dịch vụ, bảng giá, bác sĩ trực hoặc hướng dẫn quy trình đặt lịch khám và đặt cọc.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userText = input.trim()
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMsgList = [...messages, { sender: 'user', text: userText, time: nowTime }]
    setMessages(newMsgList)
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage({ message: userText })
      const botReply = res.data?.response || res.data?.message || 'Tôi đã nhận được thông tin từ bạn.'
      setMessages([...newMsgList, {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } catch (err) {
      toast.error('Không thể kết nối đến Trợ lý AI lúc này.')
      setMessages([...newMsgList, {
        sender: 'bot',
        text: 'Xin lỗi, hiện tại tôi gặp sự cố kết nối máy chủ. Vui lòng liên hệ hotline phòng khám để được hỗ trợ trực tiếp.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (q) => {
    setInput(q)
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {!open && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined style={{ fontSize: 24 }} />}
          onClick={() => setOpen(true)}
          style={{
            width: 58,
            height: 58,
            boxShadow: '0 4px 16px rgba(24,144,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none'
          }}
        />
      )}

      {open && (
        <Card
          style={{
            width: 380,
            height: 530,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #d9d9d9'
          }}
          bodyStyle={{
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003366 0%, #0050b3 100%)',
            color: '#fff',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Space>
              <Avatar style={{ background: '#52c41a' }} icon={<RobotOutlined />} />
              <div>
                <Text strong style={{ color: '#fff', fontSize: 14, display: 'block' }}>
                  Trợ lý AI Nha Khoa
                </Text>
                <span style={{ fontSize: 11, color: '#b7eb8f' }}>● Trực tuyến 24/7 (Gemini 2.0)</span>
              </div>
            </Space>
            <Space>
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined style={{ color: '#fff' }} />}
                onClick={() => setMessages([{
                  sender: 'bot',
                  text: 'Hộp thoại đã được làm mới. Tôi có thể hỗ trợ gì cho bạn?',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }])}
                title="Làm mới đoạn chat"
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined style={{ color: '#fff' }} />}
                onClick={() => setOpen(false)}
              />
            </Space>
          </div>

          {/* Messages list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8
                }}
              >
                {m.sender === 'bot' && (
                  <Avatar size="small" style={{ background: '#1890ff', marginTop: 4 }} icon={<RobotOutlined />} />
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: m.sender === 'user' ? '#1890ff' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#333333',
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.text}
                  </div>
                  <span style={{
                    fontSize: 10,
                    color: '#8c8c8c',
                    display: 'block',
                    textAlign: m.sender === 'user' ? 'right' : 'left',
                    marginTop: 2,
                    padding: '0 4px'
                  }}>
                    {m.time}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <Avatar size="small" style={{ background: '#595959', marginTop: 4 }} icon={<UserOutlined />} />
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size="small" style={{ background: '#1890ff' }} icon={<RobotOutlined />} />
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <Spin size="small" /> <span style={{ fontSize: 12, color: '#666', marginLeft: 6 }}>Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: '6px 12px', background: '#f0f2f5', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid #e8e8e8' }}>
            <Button size="small" shape="round" onClick={() => handleQuickQuestion('Bảng giá dịch vụ nha khoa?')}>Bảng giá</Button>
            <Button size="small" shape="round" onClick={() => handleQuickQuestion('Bác sĩ nào trực hôm nay?')}>Bác sĩ trực</Button>
            <Button size="small" shape="round" onClick={() => handleQuickQuestion('Quy định đặt cọc 100k như thế nào?')}>Tiền cọc 100k</Button>
          </div>

          {/* Input Box */}
          <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <Input
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
              style={{ borderRadius: 20 }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
            />
          </div>
        </Card>
      )}
    </div>
  )
}
