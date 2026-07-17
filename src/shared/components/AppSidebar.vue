<script setup>
import { useAuthStore } from '../../modules/login/login.store'

const auth = useAuthStore()

const menu = [
  { name: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { name: 'data-presensi', label: 'Presensi', icon: 'calendar_today' },
  { name: 'rekap-presensi', label: 'Rekap', icon: 'analytics' },
  { name: 'manajemen-ijin', label: 'Ijin', icon: 'event_busy' },
]
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-[240px] bg-primary-dark flex flex-col py-6 px-4 z-50">
    <div class="mb-10 px-4">
      <h1 class="text-xl font-bold text-white">HADIR.IN</h1>
      <p class="text-xs text-white/60">Admin Panel</p>
    </div>

    <nav class="flex-1 space-y-1">
      <RouterLink
        v-for="item in menu"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        active-class="bg-white/10 text-white"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="mt-auto pt-6 border-t border-white/10">
      <div class="px-4 py-2">
        <p class="text-sm font-medium text-white">{{ auth.user?.name ?? 'Admin' }}</p>
        <p class="text-xs text-white/60">{{ auth.user?.role ?? 'Administrator' }}</p>
      </div>
      <button
        class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        @click="auth.logout()"
      >
        <span class="material-symbols-outlined">logout</span>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
