import api from './api'

const interviewService = {
  getAll: (params) => api.get('/interviews/', { params }),
  getById: (id) => api.get(`/interviews/${id}/`),
  create: (data) => api.post('/interviews/', data),
  update: (id, data) => api.patch(`/interviews/${id}/`, data),
  remove: (id) => api.delete(`/interviews/${id}/`),
}

export default interviewService
