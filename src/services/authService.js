import api from './api'

const authService = {
  login: (username, password) =>
    api.post('/api-token-auth/', { username, password }),

  logout: () =>
    api.post('/logout/'),

  register: (data) =>
    api.post('/register/', data),

  passwordReset: (email) =>
    api.post('/password-reset/', { email }),

  passwordResetConfirm: (data) =>
    api.post('/password-reset/confirm/', data),

  getMe: () =>
    api.get('/me/'),
}

export default authService
