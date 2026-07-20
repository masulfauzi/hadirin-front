import api from '../../shared/services/api'

export const roleService = {
  list: () => api.get('/roles'),
  get: (id) => api.get(`/roles/${id}`),
  create: (payload) => api.post('/roles', payload),
  update: (id, payload) => api.put(`/roles/${id}`, payload),
  remove: (id) => api.delete(`/roles/${id}`),
  assignUser: (roleId, userId) => api.post(`/roles/${roleId}/users`, { user_id: userId }),
  revokeUser: (roleId, userId) => api.delete(`/roles/${roleId}/users/${userId}`),
}
