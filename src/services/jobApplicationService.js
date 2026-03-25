import api from './api'

const jobApplicationService = {
  getAll: (params) => api.get('/job-applications/', { params }),
  getById: (id) => api.get(`/job-applications/${id}/`),
  create: (data) => api.post('/job-applications/', data),
  update: (id, data) => api.patch(`/job-applications/${id}/`, data),
  remove: (id) => api.delete(`/job-applications/${id}/`),
  advanceStage: (id) => api.post(`/job-applications/${id}/advance_stage/`),
  convertToEmployee: (id, data) => api.post(`/job-applications/${id}/convert_to_employee/`, data),
}

export default jobApplicationService
