<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../login/login.service'

const router = useRouter()

const kodeIdentitas = ref('')
const namaLengkap = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Konfirmasi password tidak sama.'
    return
  }

  loading.value = true
  try {
    await authService.register({
      kode_identitas: kodeIdentitas.value,
      nama_lengkap: namaLengkap.value,
      username: username.value,
      email: email.value || undefined,
      password: password.value,
    })
    success.value = 'Akun berhasil didaftarkan. Silakan masuk.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = err.message ?? 'Gagal mendaftarkan akun.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-8">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-primary-dark">HADIR.IN</h1>
      <p class="text-sm text-on-surface-variant mt-1">Daftar Akun Admin Panel</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Kode Identitas</label>
        <input
          v-model="kodeIdentitas"
          type="text"
          required
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="EMP001"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Nama Lengkap</label>
        <input
          v-model="namaLengkap"
          type="text"
          required
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="Budi Santoso"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Username</label>
        <input
          v-model="username"
          type="text"
          required
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="admin"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email (opsional)</label>
        <input
          v-model="email"
          type="email"
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="admin@example.com"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password (min. 8 karakter)</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="••••••••"
        />
      </div>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Konfirmasi Password</label>
        <input
          v-model="confirmPassword"
          type="password"
          required
          minlength="8"
          class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <p v-if="error" class="text-sm text-error">{{ error }}</p>
      <p v-if="success" class="text-sm text-green-700">{{ success }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[98%] transition-all disabled:opacity-60"
      >
        {{ loading ? 'Memproses...' : 'Daftar' }}
      </button>
    </form>

    <p class="text-sm text-on-surface-variant text-center mt-6">
      Sudah punya akun?
      <RouterLink to="/login" class="text-primary font-semibold hover:underline">Masuk di sini</RouterLink>
    </p>
  </div>
</template>
