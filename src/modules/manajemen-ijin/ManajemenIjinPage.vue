<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { ijinService } from './manajemen-ijin.service'
import { karyawanService } from '../karyawan/karyawan.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

const WARNA_BADGE_TONE = { yellow: 'warning', green: 'success', red: 'error', gray: 'neutral' }

function emptyForm() {
  return {
    karyawan_id: '',
    jenis_ijin_id: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: '',
    file_lampiran: '',
  }
}

const rows = ref([])
const karyawanList = ref([])
const jenisList = ref([])
const statusList = ref([])
const loading = ref(false)
const error = ref('')

const karyawanMap = computed(() => Object.fromEntries(karyawanList.value.map((k) => [k.id, k])))
const jenisMap = computed(() => Object.fromEntries(jenisList.value.map((j) => [j.id, j])))
const statusMap = computed(() => Object.fromEntries(statusList.value.map((s) => [s.id, s])))
const statusIdByKode = computed(() => Object.fromEntries(statusList.value.map((s) => [s.kode_status, s.id])))

const jumlahHari = computed(() => {
  if (!form.value.tanggal_mulai || !form.value.tanggal_selesai) return 0
  const start = new Date(form.value.tanggal_mulai)
  const end = new Date(form.value.tanggal_selesai)
  if (end < start) return 0
  return Math.round((end - start) / 86400000) + 1
})

const jenisTerpilih = computed(() => jenisMap.value[form.value.jenis_ijin_id])

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const form = ref(emptyForm())

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [ijinRes, karyawanRes, jenisRes, statusRes] = await Promise.all([
      ijinService.list(),
      karyawanService.list(),
      ijinService.jenisList(),
      ijinService.statusList(),
    ])
    rows.value = ijinRes.data
    karyawanList.value = karyawanRes.data
    jenisList.value = jenisRes.data
    statusList.value = statusRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data ijin.'
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
  if (jenisTerpilih.value?.perlu_lampiran && !form.value.file_lampiran) {
    formError.value = 'Jenis ijin ini wajib menyertakan lampiran.'
    return
  }
  if (form.value.tanggal_selesai < form.value.tanggal_mulai) {
    formError.value = 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
    return
  }
  formSaving.value = true
  formError.value = ''
  try {
    const payload = {
      karyawan_id: form.value.karyawan_id,
      jenis_ijin_id: form.value.jenis_ijin_id,
      status_ijin_id: statusIdByKode.value.MENUNGGU,
      tanggal_mulai: form.value.tanggal_mulai,
      tanggal_selesai: form.value.tanggal_selesai,
      jumlah_hari: jumlahHari.value,
      alasan: form.value.alasan,
      file_lampiran: form.value.file_lampiran || null,
    }
    await ijinService.create(payload)
    showFormModal.value = false
    await loadAll()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan pengajuan ijin.'
  } finally {
    formSaving.value = false
  }
}

// TODO: backend belum punya endpoint approval khusus (yang otomatis mengisi
// disetujui_oleh/tanggal_approval/catatan_approval). Sementara, setuju/tolak
// diimplementasikan dengan PUT /ijin/:id mengganti status_ijin_id saja.
// Ganti ke endpoint approval begitu tersedia di backend.
async function setStatus(row, kodeStatus) {
  try {
    await ijinService.update(row.id, {
      karyawan_id: row.karyawan_id,
      jenis_ijin_id: row.jenis_ijin_id,
      status_ijin_id: statusIdByKode.value[kodeStatus],
      tanggal_mulai: row.tanggal_mulai.slice(0, 10),
      tanggal_selesai: row.tanggal_selesai.slice(0, 10),
      jumlah_hari: row.jumlah_hari,
      alasan: row.alasan,
      file_lampiran: row.file_lampiran,
    })
    await loadAll()
  } catch (err) {
    alert(err.message ?? 'Gagal mengubah status ijin.')
  }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton v-if="perm.canInsert" variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Ajukan Ijin</span>
      </BaseButton>
    </div>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Tgl Mulai</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Tgl Selesai</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jenis Ijin</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Durasi</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ karyawanMap[row.karyawan_id]?.nama_lengkap ?? '-' }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.tanggal_mulai.slice(0, 10) }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.tanggal_selesai.slice(0, 10) }}</td>
        <td class="px-6 py-4 text-sm text-on-surface-variant">{{ jenisMap[row.jenis_ijin_id]?.nama_jenis ?? '-' }}</td>
        <td class="px-6 py-4 text-sm text-on-surface-variant">{{ row.jumlah_hari }} hari</td>
        <td class="px-6 py-4">
          <BaseBadge :tone="WARNA_BADGE_TONE[statusMap[row.status_ijin_id]?.warna_badge] ?? 'neutral'">
            {{ statusMap[row.status_ijin_id]?.nama_status ?? '-' }}
          </BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <div v-if="perm.canUpdate && statusMap[row.status_ijin_id]?.kode_status === 'MENUNGGU'" class="flex justify-end gap-2">
            <button
              class="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
              @click="setStatus(row, 'DISETUJUI')"
            >
              Setujui
            </button>
            <button
              class="px-4 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors"
              @click="setStatus(row, 'DITOLAK')"
            >
              Tolak
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <BaseModal v-if="showFormModal" title="Ajukan Ijin" @close="showFormModal = false">
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Karyawan</label>
          <select v-model="form.karyawan_id" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="" disabled>Pilih karyawan</option>
            <option v-for="k in karyawanList" :key="k.id" :value="k.id">{{ k.nama_lengkap }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Jenis Ijin</label>
          <select v-model="form.jenis_ijin_id" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="" disabled>Pilih jenis ijin</option>
            <option v-for="j in jenisList" :key="j.id" :value="j.id">{{ j.nama_jenis }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Tanggal Mulai</label>
            <input v-model="form.tanggal_mulai" type="date" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Tanggal Selesai</label>
            <input v-model="form.tanggal_selesai" type="date" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>
        <p class="text-sm text-outline">Jumlah hari: <span class="font-semibold text-on-surface">{{ jumlahHari }}</span></p>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Alasan</label>
          <textarea v-model="form.alasan" rows="2" required class="w-full px-4 py-2 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">
            URL Lampiran <span v-if="jenisTerpilih?.perlu_lampiran" class="text-error">(wajib)</span>
          </label>
          <input v-model="form.file_lampiran" type="text" placeholder="https://..." class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <p v-if="formError" class="text-sm text-error">{{ formError }}</p>
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="showFormModal = false">Batal</BaseButton>
        <BaseButton variant="primary" :disabled="formSaving" @click="submitForm">
          {{ formSaving ? 'Menyimpan...' : 'Ajukan' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
