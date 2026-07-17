<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './login.store'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message ?? 'Email atau password salah.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-8">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-primary-dark">HADIR.IN</h1>
      <p class="text-sm text-on-surface-variant mt-1">Masuk ke Admin Panel</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="admin@hadirin.com"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <p v-if="error" class="text-sm text-error">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[98%] transition-all disabled:opacity-60"
      >
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>
  </div>
</template>
