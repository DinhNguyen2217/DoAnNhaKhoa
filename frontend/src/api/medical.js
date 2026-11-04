import api from './axios'

// Medical Records
export const getMedicalRecords = (params) => api.get('/medical/records/', { params })
export const getMedicalRecord = (id) => api.get(`/medical/records/${id}/`)
export const createMedicalRecord = (data) => api.post('/medical/records/', data)
export const updateMedicalRecord = (id, data) => api.patch(`/medical/records/${id}/`, data)
export const completeMedicalRecord = (id) => api.post(`/medical/records/${id}/complete/`)

// Prescriptions
export const getPrescriptions = (params) => api.get('/medical/prescriptions/', { params })
export const getPrescription = (id) => api.get(`/medical/prescriptions/${id}/`)
export const createPrescription = (data) => api.post('/medical/prescriptions/', data)
export const updatePrescription = (id, data) => api.patch(`/medical/prescriptions/${id}/`, data)

// Treatment Plans
export const getTreatmentPlans = (params) => api.get('/medical/treatment-plans/', { params })
export const getTreatmentPlan = (id) => api.get(`/medical/treatment-plans/${id}/`)
export const createTreatmentPlan = (data) => api.post('/medical/treatment-plans/', data)
export const updateTreatmentPlan = (id, data) => api.patch(`/medical/treatment-plans/${id}/`, data)
