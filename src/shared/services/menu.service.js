import api from './api'

export const menuService = {
  me: () => api.get('/menus/me'),
}
