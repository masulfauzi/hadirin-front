<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './modules/login/login.store'

const auth = useAuthStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    auth.fetchUser().catch(() => {})
  }
})
</script>

<template>
  <RouterView />
</template>
