import api from './api'

const applicantService = {
  getAll: (params) => api.get('/applicants/', { params }),
  getById: (id) => api.get(`/applicants/${id}/`),
  create: (data) => api.post('/applicants/', data),
  update: (id, data) => api.patch(`/applicants/${id}/`, data),
  remove: (id) => api.delete(`/applicants/${id}/`),

  uploadPhoto: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.patch(`/applicants/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadCV: (id, file) => {
    const formData = new FormData()
    formData.append('cv', file)
    return api.patch(`/applicants/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  downloadCV: (id) =>
    api.get(`/applicants/${id}/download_cv/`, { responseType: 'blob' }),
}

export default applicantService
