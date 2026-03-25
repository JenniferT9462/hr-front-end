import api from './api'

const timeOffService = {
  getAll: (params) => api.get('/time-off-requests/', { params }),
  getById: (id) => api.get(`/time-off-requests/${id}/`),
  create: (data) => api.post('/time-off-requests/', data),
  update: (id, data) => api.patch(`/time-off-requests/${id}/`, data),
  remove: (id) => api.delete(`/time-off-requests/${id}/`),
}

export default timeOffService
