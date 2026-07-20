<script setup>
import AppSidebarMenuItem from './AppSidebarMenuItem.vue'

defineProps({
  item: { type: Object, required: true },
})
</script>

<template>
  <div>
    <RouterLink
      v-if="item.route"
      :to="item.route"
      class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      active-class="bg-white/10 text-white"
    >
      <span v-if="item.icon" class="material-symbols-outlined">{{ item.icon }}</span>
      <span>{{ item.nama_menu }}</span>
    </RouterLink>
    <div v-else class="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
      {{ item.nama_menu }}
    </div>
    <div v-if="item.children?.length" class="ml-4 space-y-1">
      <AppSidebarMenuItem v-for="child in item.children" :key="child.id" :item="child" />
    </div>
  </div>
</template>
