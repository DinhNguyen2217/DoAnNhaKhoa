import api from './axios'

export const getUsers = (params) => api.get('/auth/users/', { params })
export const getUser = (id) => api.get(`/auth/users/${id}/`)
export const createUser = (data) => api.post('/auth/users/', data)
export const updateUser = (id, data) => api.patch(`/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/auth/users/${id}/`)
export const resetPassword = (id, data) => api.post(`/auth/users/${id}/reset_password/`, data)
export const toggleActive = (id) => api.post(`/auth/users/${id}/toggle_active/`)
