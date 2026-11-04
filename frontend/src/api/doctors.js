import api from './axios'

export const getDoctors = (params) => api.get('/doctors/', { params })
export const getDoctor = (id) => api.get(`/doctors/${id}/`)
export const createDoctor = (data) => api.post('/doctors/', data)
export const updateDoctor = (id, data) => api.patch(`/doctors/${id}/`, data)
export const deleteDoctor = (id) => api.delete(`/doctors/${id}/`)
export const toggleAvailable = (id) => api.post(`/doctors/${id}/toggle_available/`)
