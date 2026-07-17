<script setup>
import { useRoute } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-surface">
    <AppSidebar />
    <div class="ml-[240px] min-h-screen flex flex-col">
      <AppHeader :title="route.meta.title" />
      <main class="flex-1 p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
