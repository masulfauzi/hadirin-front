import api from '../../shared/services/api'

export const dataPresensiService = {
  list: () => api.get('/presensi'),
  get: (id) => api.get(`/presensi/${id}`),
  create: (payload) => api.post('/presensi', payload),
  update: (id, payload) => api.put(`/presensi/${id}`, payload),
  remove: (id) => api.delete(`/presensi/${id}`),
}
