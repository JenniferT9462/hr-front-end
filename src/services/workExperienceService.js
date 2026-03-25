import api from './api'

const workExperienceService = {
  getAll: (params) => api.get('/work-experience/', { params }),
  getById: (id) => api.get(`/work-experience/${id}/`),
  create: (data) => api.post('/work-experience/', data),
  update: (id, data) => api.patch(`/work-experience/${id}/`, data),
  remove: (id) => api.delete(`/work-experience/${id}/`),
}

export default workExperienceService
