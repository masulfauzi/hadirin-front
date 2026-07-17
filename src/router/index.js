import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/login/login.store'
import BlankLayout from '../shared/layouts/BlankLayout.vue'
import DashboardLayout from '../shared/layouts/DashboardLayout.vue'
import { loginRoute } from '../modules/login/login.routes'
import { dashboardRoute } from '../modules/dashboard/dashboard.routes'
import { dataPresensiRoute } from '../modules/data-presensi/data-presensi.routes'
import { rekapPresensiRoute } from '../modules/rekap-presensi/rekap-presensi.routes'
import { manajemenIjinRoute } from '../modules/manajemen-ijin/manajemen-ijin.routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: BlankLayout,
      children: [loginRoute],
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [dashboardRoute, dataPresensiRoute, rekapPresensiRoute, manajemenIjinRoute],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.name === 'login' && auth.isAuthenticated) return '/'
})

export default router
