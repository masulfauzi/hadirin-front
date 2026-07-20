<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-24 text-center gap-4">
    <span class="material-symbols-outlined text-5xl text-outline">lock</span>
    <h2 class="text-lg font-semibold text-on-surface">Akses Ditolak</h2>
    <p class="text-sm text-outline max-w-md">
      Role Anda tidak memiliki izin untuk membuka halaman ini. Hubungi admin
      kalau menurut Anda ini seharusnya bisa diakses.
    </p>
    <RouterLink
      :to="{ name: 'dashboard' }"
      class="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
    >
      Kembali ke Dashboard
    </RouterLink>
  </div>
</template>
