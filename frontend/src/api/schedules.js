import api from './axios'

export const getSchedules = (params) => api.get('/schedules/', { params })
export const getMySchedules = (params) => api.get('/schedules/my_schedules/', { params })
export const createSchedule = (data) => api.post('/schedules/', data)
export const updateSchedule = (id, data) => api.patch(`/schedules/${id}/`, data)
export const deleteSchedule = (id) => api.delete(`/schedules/${id}/`)
