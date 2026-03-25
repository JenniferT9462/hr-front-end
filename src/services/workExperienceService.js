import api from './api'

const workExperienceService = {
  getAll: (params) => api.get('/work-experiences/', { params }),
  getById: (id) => api.get(`/work-experiences/${id}/`),
  create: (data) => api.post('/work-experiences/', data),
  update: (id, data) => api.patch(`/work-experiences/${id}/`, data),
  remove: (id) => api.delete(`/work-experiences/${id}/`),
}

export default workExperienceService
