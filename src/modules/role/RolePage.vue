<script setup>
import { ref, onMounted } from 'vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { roleService } from './role.service'
import { penggunaService } from '../pengguna/pengguna.service'

function emptyForm() {
  return { kode_role: '', nama_role: '', deskripsi: '', is_active: true }
}

const rows = ref([])
const loading = ref(false)
const error = ref('')

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const editingId = ref(null)
const form = ref(emptyForm())

const showMemberModal = ref(false)
const memberError = ref('')
const memberRole = ref(null)
const users = ref([])
const memberBusyId = ref(null)

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await roleService.list()
    rows.value = data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data role.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showFormModal.value = true
}

function openEditForm(row) {
  editingId.value = row.id
  form.value = {
    kode_role: row.kode_role,
    nama_role: row.nama_role,
    deskripsi: row.deskripsi ?? '',
    is_active: row.is_active,
  }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formSaving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await roleService.update(editingId.value, form.value)
    } else {
      await roleService.create(form.value)
    }
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan role.'
  } finally {
    formSaving.value = false
  }
}

async function removeRole(row) {
  if (!confirm(`Hapus role "${row.nama_role}"?`)) return
  try {
    await roleService.remove(row.id)
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus role.')
  }
}

// Catatan: backend tidak punya endpoint untuk melihat user mana saja yang
// sudah punya role ini (tidak ada GET /roles/:id/users). Modal ini karena itu
// menampilkan semua user dengan tombol Assign/Revoke independen, bukan
// checklist status assignment saat ini.
async function openMemberModal(row) {
  memberRole.value = row
  memberError.value = ''
  showMemberModal.value = true
  try {
    const { data } = await penggunaService.list()
    users.value = data
  } catch (err) {
    memberError.value = err.message ?? 'Gagal memuat data user.'
  }
}

async function assign(user) {
  memberBusyId.value = user.id
  memberError.value = ''
  try {
    await roleService.assignUser(memberRole.value.id, user.id)
  } catch (err) {
    memberError.value = err.message ?? 'Gagal menetapkan role.'
  } finally {
    memberBusyId.value = null
  }
}

async function revoke(user) {
  memberBusyId.value = user.id
  memberError.value = ''
  try {
    await roleService.revokeUser(memberRole.value.id, user.id)
  } catch (err) {
    memberError.value = err.message ?? 'Gagal mencabut role.'
  } finally {
    memberBusyId.value = null
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Role</span>
      </BaseButton>
    </div>

    <p v-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Kode</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama Role</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Deskripsi</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.kode_role }}</td>
        <td class="px-6 py-4 text-sm text-on-surface">{{ row.nama_role }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.deskripsi ?? '-' }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="row.is_active ? 'success' : 'neutral'">{{ row.is_active ? 'Aktif' : 'Nonaktif' }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openMemberModal(row)">
              Anggota
            </button>
            <button class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openEditForm(row)">
              Edit
            </button>
            <button class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removeRole(row)">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <BaseModal
      v-if="showFormModal"
      :title="editingId ? 'Edit Role' : 'Tambah Role'"
      @close="showFormModal = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Kode Role</label>
          <input v-model="form.kode_role" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Nama Role</label>
          <input v-model="form.nama_role" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Deskripsi</label>
          <textarea v-model="form.deskripsi" rows="2" class="w-full px-4 py-2 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
        </div>
        <label class="flex items-center gap-2 text-sm text-on-surface">
          <input v-model="form.is_active" type="checkbox" class="rounded border-outline-variant" />
          Aktif
        </label>
        <p v-if="formError" class="text-sm text-error">{{ formError }}</p>
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showFormModal = false">Batal</BaseButton>
        <BaseButton variant="primary" :disabled="formSaving" @click="submitForm">
          {{ formSaving ? 'Menyimpan...' : 'Simpan' }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-if="showMemberModal"
      :title="`Anggota Role — ${memberRole?.nama_role}`"
      @close="showMemberModal = false"
    >
      <p class="text-xs text-outline mb-4">
        Backend belum menyediakan daftar user yang sudah punya role ini — gunakan Assign/Revoke langsung per user.
      </p>
      <div class="space-y-2 max-h-80 overflow-y-auto">
        <div v-for="u in users" :key="u.id" class="flex items-center justify-between py-2 border-b border-outline-variant/20">
          <div>
            <p class="text-sm font-semibold text-on-surface">{{ u.username }}</p>
            <p class="text-xs text-outline">{{ u.kode_identitas }}</p>
          </div>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              :disabled="memberBusyId === u.id"
              @click="assign(u)"
            >
              Assign
            </button>
            <button
              class="px-3 py-1 text-xs font-bold rounded-lg bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-50"
              :disabled="memberBusyId === u.id"
              @click="revoke(u)"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
      <p v-if="memberError" class="text-sm text-error mt-3">{{ memberError }}</p>
      <template #footer>
        <BaseButton variant="ghost" @click="showMemberModal = false">Tutup</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
