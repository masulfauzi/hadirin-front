import api from '../../shared/services/api'

export const hariLiburService = {
  list: () => api.get('/harilibur'),
  get: (id) => api.get(`/harilibur/${id}`),
  create: (payload) => api.post('/harilibur', payload),
  update: (id, payload) => api.put(`/harilibur/${id}`, payload),
  remove: (id) => api.delete(`/harilibur/${id}`),
}
