import api from './axios'

export const getAppointments = (params) => api.get('/appointments/', { params })
export const getAppointment = (id) => api.get(`/appointments/${id}/`)
export const createAppointment = (data) => api.post('/appointments/', data)
export const updateAppointment = (id, data) => api.patch(`/appointments/${id}/`, data)
export const cancelAppointment = (id, data) => api.post(`/appointments/${id}/cancel/`, data)
export const confirmDeposit = (id, data) => api.post(`/appointments/${id}/confirm-deposit/`, { deposit_status: 'verified', ...data })
export const markArrived = (id, data) => api.post(`/appointments/${id}/check-in/`, data || {})
export const markNoShow = (id) => api.post(`/appointments/${id}/mark-no-show/`)
export const getMyAppointments = (params) => api.get('/appointments/my-appointments/', { params })
export const notifyDeposit = (id, data) => api.post(`/appointments/${id}/notify-deposit/`, data || {})
