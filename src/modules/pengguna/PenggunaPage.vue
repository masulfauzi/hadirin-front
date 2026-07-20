<script setup>
import { ref, onMounted } from 'vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { penggunaService } from './pengguna.service'
import { authService } from '../login/login.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

function emptyForm() {
  return { kode_identitas: '', nama_lengkap: '', username: '', email: '', password: '' }
}

const rows = ref([])
const loading = ref(false)
const error = ref('')

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const form = ref(emptyForm())

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await penggunaService.list()
    rows.value = data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data pengguna.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  form.value = emptyForm()
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formSaving.value = true
  formError.value = ''
  try {
    await authService.register(form.value)
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal mendaftarkan akun.'
  } finally {
    formSaving.value = false
  }
}

async function removePengguna(row) {
  if (!confirm(`Hapus akun "${row.username}"?`)) return
  try {
    await penggunaService.remove(row.id)
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus akun.')
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton v-if="perm.canInsert" variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">person_add</span>
        <span>Daftarkan Akun</span>
      </BaseButton>
    </div>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Kode Identitas</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Username</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Email</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Login Terakhir</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.kode_identitas }}</td>
        <td class="px-6 py-4 text-sm text-on-surface">{{ row.username }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.email ?? '-' }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.last_login_at ? new Date(row.last_login_at).toLocaleString('id-ID') : 'Belum pernah' }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="row.is_active ? 'success' : 'neutral'">{{ row.is_active ? 'Aktif' : 'Nonaktif' }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <button v-if="perm.canDelete" class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removePengguna(row)">
            Hapus
          </button>
        </td>
      </tr>
    </BaseTable>

    <BaseModal v-if="showFormModal" title="Daftarkan Akun" @close="showFormModal = false">
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Kode Identitas</label>
          <input v-model="form.kode_identitas" type="text" required placeholder="Samakan dengan kode identitas karyawan" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Nama Lengkap</label>
          <input v-model="form.nama_lengkap" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Username</label>
          <input v-model="form.username" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Email</label>
          <input v-model="form.email" type="email" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Password (min. 8 karakter)</label>
          <input v-model="form.password" type="password" required minlength="8" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <p v-if="formError" class="text-sm text-error">{{ formError }}</p>
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showFormModal = false">Batal</BaseButton>
        <BaseButton variant="primary" :disabled="formSaving" @click="submitForm">
          {{ formSaving ? 'Menyimpan...' : 'Daftarkan' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
