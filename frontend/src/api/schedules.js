import api from './axios'

export const getSchedules = (params) => api.get('/schedules/', { params })
export const getMySchedules = (params) => api.get('/schedules/my-schedules/', { params })
export const createSchedule = (data) => api.post('/schedules/', data)
export const updateSchedule = (id, data) => api.patch(`/schedules/${id}/`, data)
export const deleteSchedule = (id) => api.delete(`/schedules/${id}/`)

// Giám sát ca làm việc theo ngày (Admin biết ai đi làm và làm gì)
export const getDailyOverview = (params) => api.get('/schedules/daily-overview/', { params })

// Cấu hình mức lương nhân sự do Admin định giá
export const getSalaryConfigs = (params) => api.get('/schedules/salary-configs/', { params })
export const updateSalaryConfig = (id, data) => api.patch(`/schedules/salary-configs/${id}/`, data)

// Bảng tính lương tự động & chi trả
export const getPayrolls = (params) => api.get('/schedules/payrolls/', { params })
export const calculatePayroll = (data) => api.post('/schedules/payrolls/calculate/', data)
export const markPayrollPaid = (id, data) => api.post(`/schedules/payrolls/${id}/mark-paid/`, data)
