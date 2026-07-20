import api from '../../shared/services/api'

export const divisiService = {
  list: () => api.get('/divisions'),
  get: (id) => api.get(`/divisions/${id}`),
  create: (payload) => api.post('/divisions', payload),
  update: (id, payload) => api.put(`/divisions/${id}`, payload),
  remove: (id) => api.delete(`/divisions/${id}`),
  getSchedules: (id) => api.get(`/divisions/${id}/schedules`),
  saveSchedules: (id, schedules) => api.put(`/divisions/${id}/schedules`, schedules),
}
