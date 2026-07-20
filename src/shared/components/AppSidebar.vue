<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../../modules/login/login.store'
import { useMenuStore } from '../stores/menu.store'
import AppSidebarMenuItem from './AppSidebarMenuItem.vue'

const auth = useAuthStore()
const menu = useMenuStore()

onMounted(() => {
  menu.fetchMenu()
})
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-[240px] bg-primary-dark flex flex-col py-6 px-4 z-50 overflow-y-auto">
    <div class="mb-10 px-4">
      <h1 class="text-xl font-bold text-white">HADIR.IN</h1>
      <p class="text-xs text-white/60">Admin Panel</p>
    </div>

    <nav class="flex-1 space-y-1">
      <p v-if="menu.loading" class="px-4 text-xs text-white/40">Memuat menu...</p>
      <p v-else-if="menu.loaded && menu.tree.length === 0" class="px-4 text-xs text-white/40">
        Tidak ada menu untuk role Anda.
      </p>
      <AppSidebarMenuItem v-for="item in menu.tree" :key="item.id" :item="item" />
    </nav>

    <div class="mt-auto pt-6 border-t border-white/10">
      <div class="px-4 py-2">
        <p class="text-sm font-medium text-white">{{ auth.user?.username ?? 'Admin' }}</p>
        <p class="text-xs text-white/60">{{ auth.user?.kode_identitas ?? 'Administrator' }}</p>
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
