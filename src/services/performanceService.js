import api from './api'

const performanceService = {
  getAll: (params) => api.get('/performance-reviews/', { params }),
  getById: (id) => api.get(`/performance-reviews/${id}/`),
  create: (data) => api.post('/performance-reviews/', data),
  update: (id, data) => api.patch(`/performance-reviews/${id}/`, data),
  remove: (id) => api.delete(`/performance-reviews/${id}/`),
}

export default performanceService
