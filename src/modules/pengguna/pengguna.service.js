import api from '../../shared/services/api'

export const penggunaService = {
  list: () => api.get('/users'),
  get: (id) => api.get(`/users/${id}`),
  remove: (id) => api.delete(`/users/${id}`),
}
