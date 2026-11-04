import api from './axios'

export const getInvoices = (params) => api.get('/invoices/', { params })
export const getInvoice = (id) => api.get(`/invoices/${id}/`)
export const createInvoice = (data) => api.post('/invoices/', data)
export const updateInvoice = (id, data) => api.patch(`/invoices/${id}/`, data)
export const confirmPayment = (id, data) => api.post(`/invoices/${id}/confirm-payment/`, data)
export const markInvoicePaid = (id, data) => api.post(`/invoices/${id}/confirm-payment/`, data)
export const createFromAppointment = (appointment_id) => api.post('/invoices/create-from-appointment/', { appointment_id })
export const addInvoiceItem = (id, data) => api.post(`/invoices/${id}/add-item/`, data)
export const removeInvoiceItem = (id, itemId) => api.delete(`/invoices/${id}/remove-item/${itemId}/`)
