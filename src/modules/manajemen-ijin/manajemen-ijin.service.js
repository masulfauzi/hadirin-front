import api from '../../shared/services/api'

export const ijinService = {
  list: () => api.get('/ijin'),
  get: (id) => api.get(`/ijin/${id}`),
  create: (payload) => api.post('/ijin', payload),
  update: (id, payload) => api.put(`/ijin/${id}`, payload),
  remove: (id) => api.delete(`/ijin/${id}`),
  statusList: () => api.get('/ijin/status'),
  jenisList: () => api.get('/ijin/jenis'),
}
