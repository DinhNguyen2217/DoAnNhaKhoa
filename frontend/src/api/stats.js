import api from './axios'

export const getDashboardStats = () => api.get('/stats/dashboard/')
export const getAppointmentStats = (params) => api.get('/stats/appointments/', { params })
export const getRevenueStats = (params) => api.get('/stats/revenue/', { params })
export const getDoctorScheduleStats = (params) => api.get('/stats/doctor-schedules/', { params })
export const getSalaryStats = (params) => api.get('/stats/salary/', { params })
export const getClinicAnalytics = (params) => api.get('/stats/analytics/', { params })
