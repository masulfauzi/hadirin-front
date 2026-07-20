import api from '../../shared/services/api'

export const karyawanService = {
  list: () => api.get('/karyawan'),
  get: (id) => api.get(`/karyawan/${id}`),
  create: (payload) => api.post('/karyawan', payload),
  update: (id, payload) => api.put(`/karyawan/${id}`, payload),
  remove: (id) => api.delete(`/karyawan/${id}`),
}
