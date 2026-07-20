<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { hariLiburService } from './hari-libur.service'
import { divisiService } from '../divisi/divisi.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

function emptyForm() {
  return { tanggal: '', keterangan: '', division_id: '' }
}

const rows = ref([])
const divisions = ref([])
const loading = ref(false)
const error = ref('')

const divisionMap = computed(() => Object.fromEntries(divisions.value.map((d) => [d.id, d.nama_divisi])))

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const editingId = ref(null)
const form = ref(emptyForm())

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [liburRes, divisionRes] = await Promise.all([hariLiburService.list(), divisiService.list()])
    rows.value = liburRes.data
    divisions.value = divisionRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data hari libur.'
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
    tanggal: row.tanggal,
    keterangan: row.keterangan,
    division_id: row.division_id ?? '',
  }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formSaving.value = true
  formError.value = ''
  try {
    const payload = {
      tanggal: form.value.tanggal,
      keterangan: form.value.keterangan,
      division_id: form.value.division_id || null,
    }
    if (editingId.value) {
      await hariLiburService.update(editingId.value, payload)
    } else {
      await hariLiburService.create(payload)
    }
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan hari libur.'
  } finally {
    formSaving.value = false
  }
}

async function removeHariLibur(row) {
  if (!confirm(`Hapus hari libur "${row.keterangan}"?`)) return
  try {
    await hariLiburService.remove(row.id)
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus hari libur.')
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton v-if="perm.canInsert" variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Hari Libur</span>
      </BaseButton>
    </div>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Tanggal</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Keterangan</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Divisi</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.tanggal }}</td>
        <td class="px-6 py-4 text-sm text-on-surface">{{ row.keterangan }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.division_id ? (divisionMap[row.division_id] ?? '-') : 'Semua Divisi' }}</td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button v-if="perm.canUpdate" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openEditForm(row)">
              Edit
            </button>
            <button v-if="perm.canDelete" class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removeHariLibur(row)">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <BaseModal
      v-if="showFormModal"
      :title="editingId ? 'Edit Hari Libur' : 'Tambah Hari Libur'"
      @close="showFormModal = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Tanggal</label>
          <input v-model="form.tanggal" type="date" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Keterangan</label>
          <input v-model="form.keterangan" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Divisi</label>
          <select v-model="form.division_id" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="">Semua Divisi</option>
            <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.nama_divisi }}</option>
          </select>
        </div>
        <p v-if="formError" class="text-sm text-error">{{ formError }}</p>
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showFormModal = false">Batal</BaseButton>
        <BaseButton variant="primary" :disabled="formSaving" @click="submitForm">
          {{ formSaving ? 'Menyimpan...' : 'Simpan' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
