import api from './api'

const timeOffService = {
  getAll: (params) => api.get('/time-off/', { params }),
  getById: (id) => api.get(`/time-off/${id}/`),
  create: (data) => api.post('/time-off/', data),
  update: (id, data) => api.patch(`/time-off/${id}/`, data),
  remove: (id) => api.delete(`/time-off/${id}/`),
}

export default timeOffService
