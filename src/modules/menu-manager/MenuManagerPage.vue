<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { menuManagerService } from './menu-manager.service'
import { roleService } from '../role/role.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

function emptyForm() {
  return { parent_id: '', kode_menu: '', nama_menu: '', icon: '', route: '', urutan: 0, is_active: true }
}

const rows = ref([])
const loading = ref(false)
const error = ref('')

const sortedRows = computed(() => [...rows.value].sort((a, b) => a.urutan - b.urutan))

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const editingId = ref(null)
const form = ref(emptyForm())

const showPermModal = ref(false)
const permError = ref('')
const permMenu = ref(null)
const permLoading = ref(false)
const permSavingRoleId = ref(null)
const permRows = ref([])

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await menuManagerService.list()
    rows.value = data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data menu.'
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
    parent_id: row.parent_id ?? '',
    kode_menu: row.kode_menu,
    nama_menu: row.nama_menu,
    icon: row.icon ?? '',
    route: row.route ?? '',
    urutan: row.urutan,
    is_active: row.is_active,
  }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formSaving.value = true
  formError.value = ''
  try {
    const payload = { ...form.value, parent_id: form.value.parent_id || null }
    if (editingId.value) {
      await menuManagerService.update(editingId.value, payload)
    } else {
      await menuManagerService.create(payload)
    }
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan menu.'
  } finally {
    formSaving.value = false
  }
}

async function removeMenu(row) {
  if (!confirm(`Hapus menu "${row.nama_menu}"?`)) return
  try {
    await menuManagerService.remove(row.id)
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus menu.')
  }
}

async function openPermModal(row) {
  permMenu.value = row
  permError.value = ''
  showPermModal.value = true
  permLoading.value = true
  try {
    const [rolesRes, permsRes] = await Promise.all([roleService.list(), menuManagerService.getPermissions(row.id)])
    permRows.value = rolesRes.data.map((role) => {
      const existing = permsRes.data.find((p) => p.role_id === role.id)
      return {
        role_id: role.id,
        nama_role: role.nama_role,
        can_show: existing?.can_show ?? false,
        can_read: existing?.can_read ?? false,
        can_insert: existing?.can_insert ?? false,
        can_update: existing?.can_update ?? false,
        can_delete: existing?.can_delete ?? false,
      }
    })
  } catch (err) {
    permError.value = err.message ?? 'Gagal memuat permission.'
  } finally {
    permLoading.value = false
  }
}

async function savePermission(perm) {
  permSavingRoleId.value = perm.role_id
  permError.value = ''
  try {
    await menuManagerService.setPermission(permMenu.value.id, perm)
  } catch (err) {
    permError.value = err.message ?? 'Gagal menyimpan permission.'
  } finally {
    permSavingRoleId.value = null
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton v-if="perm.canInsert" variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Menu</span>
      </BaseButton>
    </div>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Menu</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Route</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Urutan</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in sortedRows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">
          <span v-if="row.parent_id" class="text-outline">— </span>{{ row.nama_menu }}
        </td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.route ?? '-' }}</td>
        <td class="px-6 py-4 text-sm text-outline text-center">{{ row.urutan }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="row.is_active ? 'success' : 'neutral'">{{ row.is_active ? 'Aktif' : 'Nonaktif' }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button v-if="perm.canUpdate" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openPermModal(row)">
              Permission
            </button>
            <button v-if="perm.canUpdate" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openEditForm(row)">
              Edit
            </button>
            <button v-if="perm.canDelete" class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removeMenu(row)">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <BaseModal
      v-if="showFormModal"
      :title="editingId ? 'Edit Menu' : 'Tambah Menu'"
      @close="showFormModal = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Menu Induk</label>
          <select v-model="form.parent_id" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="">— Menu Utama —</option>
            <option v-for="m in rows" :key="m.id" :value="m.id" :disabled="m.id === editingId">{{ m.nama_menu }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Kode Menu</label>
            <input v-model="form.kode_menu" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Nama Menu</label>
            <input v-model="form.nama_menu" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Icon (Material Symbols)</label>
            <input v-model="form.icon" type="text" placeholder="dashboard" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Route</label>
            <input v-model="form.route" type="text" placeholder="/presensi" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Urutan</label>
          <input v-model.number="form.urutan" type="number" min="0" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
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
      v-if="showPermModal"
      :title="`Permission — ${permMenu?.nama_menu}`"
      @close="showPermModal = false"
    >
      <p v-if="permLoading" class="text-sm text-outline">Memuat...</p>
      <div v-else class="space-y-4 max-h-96 overflow-y-auto">
        <div v-for="perm in permRows" :key="perm.role_id" class="border-b border-outline-variant/20 pb-3">
          <p class="text-sm font-semibold text-on-surface mb-2">{{ perm.nama_role }}</p>
          <div class="flex flex-wrap gap-4 mb-2">
            <label class="flex items-center gap-1 text-xs text-on-surface-variant">
              <input v-model="perm.can_show" type="checkbox" class="rounded border-outline-variant" /> Show
            </label>
            <label class="flex items-center gap-1 text-xs text-on-surface-variant">
              <input v-model="perm.can_read" type="checkbox" class="rounded border-outline-variant" /> Read
            </label>
            <label class="flex items-center gap-1 text-xs text-on-surface-variant">
              <input v-model="perm.can_insert" type="checkbox" class="rounded border-outline-variant" /> Insert
            </label>
            <label class="flex items-center gap-1 text-xs text-on-surface-variant">
              <input v-model="perm.can_update" type="checkbox" class="rounded border-outline-variant" /> Update
            </label>
            <label class="flex items-center gap-1 text-xs text-on-surface-variant">
              <input v-model="perm.can_delete" type="checkbox" class="rounded border-outline-variant" /> Delete
            </label>
          </div>
          <button
            class="px-3 py-1 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            :disabled="permSavingRoleId === perm.role_id"
            @click="savePermission(perm)"
          >
            {{ permSavingRoleId === perm.role_id ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
      <p v-if="permError" class="text-sm text-error mt-3">{{ permError }}</p>
      <template #footer>
        <BaseButton variant="ghost" @click="showPermModal = false">Tutup</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
