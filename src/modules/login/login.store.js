import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../../router'
import { authService } from './login.service'
import { useMenuStore } from '../../shared/stores/menu.store'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    const { data } = await authService.login(username, password)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    useMenuStore().reset()
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    useMenuStore().reset()
    router.push('/login')
  }

  async function fetchUser() {
    const { data } = await authService.me()
    user.value = data
  }

  return { token, user, isAuthenticated, login, logout, fetchUser }
})
