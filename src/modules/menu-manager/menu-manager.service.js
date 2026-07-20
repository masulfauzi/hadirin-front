import api from '../../shared/services/api'

export const menuManagerService = {
  list: () => api.get('/menus'),
  get: (id) => api.get(`/menus/${id}`),
  create: (payload) => api.post('/menus', payload),
  update: (id, payload) => api.put(`/menus/${id}`, payload),
  remove: (id) => api.delete(`/menus/${id}`),
  getPermissions: (menuId) => api.get(`/menus/${menuId}/permissions`),
  setPermission: (menuId, payload) => api.put(`/menus/${menuId}/permissions`, payload),
}
