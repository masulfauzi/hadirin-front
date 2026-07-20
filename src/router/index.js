import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/login/login.store'
import { useMenuStore } from '../shared/stores/menu.store'
import BlankLayout from '../shared/layouts/BlankLayout.vue'
import DashboardLayout from '../shared/layouts/DashboardLayout.vue'
import { loginRoute } from '../modules/login/login.routes'
import { registerRoute } from '../modules/register/register.routes'
import { dashboardRoute } from '../modules/dashboard/dashboard.routes'
import { dataPresensiRoute } from '../modules/data-presensi/data-presensi.routes'
import { rekapPresensiRoute } from '../modules/rekap-presensi/rekap-presensi.routes'
import { manajemenIjinRoute } from '../modules/manajemen-ijin/manajemen-ijin.routes'
import { karyawanRoute } from '../modules/karyawan/karyawan.routes'
import { divisiRoute } from '../modules/divisi/divisi.routes'
import { hariLiburRoute } from '../modules/hari-libur/hari-libur.routes'
import { penggunaRoute } from '../modules/pengguna/pengguna.routes'
import { roleRoute } from '../modules/role/role.routes'
import { menuManagerRoute } from '../modules/menu-manager/menu-manager.routes'
import { aksesDitolakRoute } from '../modules/akses-ditolak/akses-ditolak.routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: BlankLayout,
      children: [loginRoute],
    },
    {
      path: '/register',
      component: BlankLayout,
      children: [registerRoute],
    },
    {
      path: '/',
      component: DashboardLayout,
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        dashboardRoute,
        dataPresensiRoute,
        rekapPresensiRoute,
        manajemenIjinRoute,
        karyawanRoute,
        divisiRoute,
        hariLiburRoute,
        penggunaRoute,
        roleRoute,
        menuManagerRoute,
        aksesDitolakRoute,
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) return '/'

  if (to.meta.requiresAuth && to.name !== 'akses-ditolak') {
    const menu = useMenuStore()
    await menu.fetchMenu()
    if (!menu.canAccess(to.path)) return { name: 'akses-ditolak' }
  }
})

export default router
