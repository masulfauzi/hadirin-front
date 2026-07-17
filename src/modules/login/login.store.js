import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../../router'
import api from '../../shared/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  async function fetchUser() {
    const { data } = await api.get('/auth/me')
    user.value = data
  }

  return { token, user, isAuthenticated, login, logout, fetchUser }
})
