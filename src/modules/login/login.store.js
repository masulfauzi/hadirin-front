import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../../router'
import { authService } from './login.service'
import { useMenuStore } from '../../shared/stores/menu.store'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles?.some((r) => r.kode_role === 'ADMIN') ?? false)

  async function login(username, password) {
    const { data } = await authService.login(username, password)
    token.value = data.token
    localStorage.setItem('token', data.token)
    useMenuStore().reset()
    await fetchUser()
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

  return { token, user, isAuthenticated, isAdmin, login, logout, fetchUser }
})
