<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { dataPresensiService } from './data-presensi.service'
import { karyawanService } from '../karyawan/karyawan.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

const STATUS_HADIR_TONE = { tepat_waktu: 'success', terlambat: 'warning' }

function emptyForm() {
  return {
    karyawan_id: '',
    tanggal: '',
    jam_hadir: '',
    jam_pulang: '',
    status_hadir: 'tepat_waktu',
    status_pulang: '',
  }
}

const rows = ref([])
const karyawanList = ref([])
const loading = ref(false)
const error = ref('')

const filterDari = ref('')
const filterSampai = ref('')
const filterStatus = ref('')

const karyawanMap = computed(() => Object.fromEntries(karyawanList.value.map((k) => [k.id, k])))

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    const tanggal = row.tanggal.slice(0, 10)
    if (filterDari.value && tanggal < filterDari.value) return false
    if (filterSampai.value && tanggal > filterSampai.value) return false
    if (filterStatus.value && row.status_hadir !== filterStatus.value) return false
    return true
  })
})

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const editingId = ref(null)
const form = ref(emptyForm())

function formatJam(iso) {
  if (!iso) return '--:--:--'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [presensiRes, karyawanRes] = await Promise.all([dataPresensiService.list(), karyawanService.list()])
    rows.value = presensiRes.data
    karyawanList.value = karyawanRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data presensi.'
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
    karyawan_id: row.karyawan_id,
    tanggal: row.tanggal.slice(0, 10),
    jam_hadir: toDatetimeLocal(row.jam_hadir),
    jam_pulang: toDatetimeLocal(row.jam_pulang),
    status_hadir: row.status_hadir ?? 'tepat_waktu',
    status_pulang: row.status_pulang ?? '',
  }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formSaving.value = true
  formError.value = ''
  try {
    const payload = {
      karyawan_id: form.value.karyawan_id,
      tanggal: form.value.tanggal,
      jam_hadir: form.value.jam_hadir ? new Date(form.value.jam_hadir).toISOString() : null,
      jam_pulang: form.value.jam_pulang ? new Date(form.value.jam_pulang).toISOString() : null,
      status_hadir: form.value.status_hadir || null,
      status_pulang: form.value.status_pulang || null,
    }
    if (editingId.value) {
      await dataPresensiService.update(editingId.value, payload)
    } else {
      await dataPresensiService.create(payload)
    }
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan presensi.'
  } finally {
    formSaving.value = false
  }
}

async function removePresensi(row) {
  const nama = karyawanMap.value[row.karyawan_id]?.nama_lengkap ?? row.karyawan_id
  if (!confirm(`Hapus presensi "${nama}" tanggal ${row.tanggal.slice(0, 10)}?`)) return
  try {
    await dataPresensiService.remove(row.id)
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus presensi.')
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <BaseCard>
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Dari Tanggal</label>
            <input v-model="filterDari" type="date" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Sampai Tanggal</label>
            <input v-model="filterSampai" type="date" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Status</label>
            <select v-model="filterStatus" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option value="">Semua Status</option>
              <option value="tepat_waktu">Tepat Waktu</option>
              <option value="terlambat">Terlambat</option>
            </select>
          </div>
        </div>
        <BaseButton v-if="perm.canInsert" variant="primary" @click="openCreateForm">
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Tambah Presensi</span>
        </BaseButton>
      </div>
    </BaseCard>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Tanggal</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jam Masuk</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jam Keluar</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in filteredRows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-on-surface">{{ karyawanMap[row.karyawan_id]?.nama_lengkap ?? '-' }}</span>
            <span class="text-xs text-outline">ID: {{ karyawanMap[row.karyawan_id]?.kode_identitas ?? '-' }}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-on-surface-variant">{{ row.tanggal.slice(0, 10) }}</td>
        <td class="px-6 py-4 text-sm font-medium">{{ formatJam(row.jam_hadir) }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ formatJam(row.jam_pulang) }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="STATUS_HADIR_TONE[row.status_hadir] ?? 'neutral'">{{ row.status_hadir ?? '-' }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button v-if="perm.canUpdate" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openEditForm(row)">
              Edit
            </button>
            <button v-if="perm.canDelete" class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removePresensi(row)">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <BaseModal
      v-if="showFormModal"
      :title="editingId ? 'Edit Presensi' : 'Tambah Presensi'"
      @close="showFormModal = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Karyawan</label>
          <select v-model="form.karyawan_id" required :disabled="!!editingId" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-60">
            <option value="" disabled>Pilih karyawan</option>
            <option v-for="k in karyawanList" :key="k.id" :value="k.id">{{ k.nama_lengkap }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Tanggal</label>
          <input v-model="form.tanggal" type="date" required :disabled="!!editingId" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-60" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Jam Hadir</label>
            <input v-model="form.jam_hadir" type="datetime-local" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Status Hadir</label>
            <select v-model="form.status_hadir" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="tepat_waktu">Tepat Waktu</option>
              <option value="terlambat">Terlambat</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Jam Pulang</label>
            <input v-model="form.jam_pulang" type="datetime-local" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Status Pulang</label>
            <select v-model="form.status_pulang" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">-</option>
              <option value="normal">Normal</option>
              <option value="pulang_cepat">Pulang Cepat</option>
            </select>
          </div>
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
