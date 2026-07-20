<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { karyawanService } from './karyawan.service'
import { divisiService } from '../divisi/divisi.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

const STATUS_TONE = { aktif: 'success', nonaktif: 'neutral', resign: 'error' }

function emptyForm() {
  return {
    kode_identitas: '',
    nama_lengkap: '',
    division_id: '',
    jabatan: '',
    no_hp: '',
    email: '',
    alamat: '',
    tanggal_masuk: '',
    status_karyawan: 'aktif',
    foto_profile: '',
  }
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
    const [karyawanRes, divisionRes] = await Promise.all([karyawanService.list(), divisiService.list()])
    rows.value = karyawanRes.data
    divisions.value = divisionRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data karyawan.'
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
    kode_identitas: row.kode_identitas,
    nama_lengkap: row.nama_lengkap,
    division_id: row.division_id,
    jabatan: row.jabatan ?? '',
    no_hp: row.no_hp ?? '',
    email: row.email ?? '',
    alamat: row.alamat ?? '',
    tanggal_masuk: row.tanggal_masuk ? row.tanggal_masuk.slice(0, 10) : '',
    status_karyawan: row.status_karyawan ?? 'aktif',
    foto_profile: row.foto_profile ?? '',
  }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formSaving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await karyawanService.update(editingId.value, form.value)
    } else {
      await karyawanService.create(form.value)
    }
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan karyawan.'
  } finally {
    formSaving.value = false
  }
}

async function removeKaryawan(row) {
  if (!confirm(`Hapus karyawan "${row.nama_lengkap}"?`)) return
  try {
    await karyawanService.remove(row.id)
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus karyawan.')
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton v-if="perm.canInsert" variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Karyawan</span>
      </BaseButton>
    </div>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Kode</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Divisi</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jabatan</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.kode_identitas }}</td>
        <td class="px-6 py-4 text-sm text-on-surface">{{ row.nama_lengkap }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ divisionMap[row.division_id] ?? '-' }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.jabatan ?? '-' }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="STATUS_TONE[row.status_karyawan] ?? 'neutral'">{{ row.status_karyawan }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button v-if="perm.canUpdate" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openEditForm(row)">
              Edit
            </button>
            <button v-if="perm.canDelete" class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removeKaryawan(row)">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <BaseModal
      v-if="showFormModal"
      :title="editingId ? 'Edit Karyawan' : 'Tambah Karyawan'"
      @close="showFormModal = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Kode Identitas</label>
          <input v-model="form.kode_identitas" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Nama Lengkap</label>
          <input v-model="form.nama_lengkap" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Divisi</label>
            <select v-model="form.division_id" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="" disabled>Pilih divisi</option>
              <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.nama_divisi }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Jabatan</label>
            <input v-model="form.jabatan" type="text" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">No. HP</label>
            <input v-model="form.no_hp" type="text" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Email</label>
            <input v-model="form.email" type="email" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Alamat</label>
          <textarea v-model="form.alamat" rows="2" class="w-full px-4 py-2 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Tanggal Masuk</label>
            <input v-model="form.tanggal_masuk" type="date" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Status</label>
            <select v-model="form.status_karyawan" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="resign">Resign</option>
            </select>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">URL Foto Profil</label>
          <input v-model="form.foto_profile" type="text" placeholder="https://..." class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
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
