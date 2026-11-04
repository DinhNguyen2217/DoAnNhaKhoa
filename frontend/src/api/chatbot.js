import api from './axios'

export const sendChatMessage = (data) => api.post('/chatbot/chat/', data)
export const getChatHistory = (params) => api.get('/chatbot/history/', { params })
export const clearChatHistory = () => api.delete('/chatbot/history/')
