import api from './api'

const jobService = {
  getAll: (params) => api.get('/jobs/', { params }),
  getById: (id) => api.get(`/jobs/${id}/`),
  create: (data) => api.post('/jobs/', data),
  update: (id, data) => api.patch(`/jobs/${id}/`, data),
  remove: (id) => api.delete(`/jobs/${id}/`),
}

export default jobService
