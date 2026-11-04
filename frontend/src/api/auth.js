import api from './axios'
import axios from 'axios'

export const login = (data) => api.post('/auth/login/', data)
export const logout = (refresh) => api.post('/auth/logout/', { refresh })
export const getProfile = () => api.get('/auth/profile/')
export const updateProfile = (data) => api.patch('/auth/profile/', data)
export const changePassword = (data) => api.post('/auth/change-password/', data)
export const register = (data) => api.post('/auth/register/', data)
export const refreshToken = (refresh) => axios.post('/api/auth/token/refresh/', { refresh })
