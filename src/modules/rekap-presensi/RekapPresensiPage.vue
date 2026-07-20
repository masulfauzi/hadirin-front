<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import { dataPresensiService } from '../data-presensi/data-presensi.service'
import { karyawanService } from '../karyawan/karyawan.service'
import { divisiService } from '../divisi/divisi.service'
import { ijinService } from '../manajemen-ijin/manajemen-ijin.service'
import { useMenuPermission } from '../../shared/composables/useMenuPermission'

const perm = useMenuPermission()

const MONTH_LABEL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function buildPeriodeOptions() {
  const options = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: `${MONTH_LABEL[d.getMonth()]} ${d.getFullYear()}` })
  }
  return options
}

function overlapDays(startISO, endISO, periodStart, periodEnd) {
  const start = new Date(Math.max(new Date(startISO), periodStart))
  const end = new Date(Math.min(new Date(endISO), periodEnd))
  if (start > end) return 0
  return Math.round((end - start) / 86400000) + 1
}

const periodeOptions = buildPeriodeOptions()
const filterPeriode = ref(periodeOptions[0].value)
const filterDivisi = ref('')

const karyawanList = ref([])
const divisions = ref([])
const presensiList = ref([])
const ijinList = ref([])
const statusIjinList = ref([])
const loading = ref(false)
const error = ref('')

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [karyawanRes, divisionRes, presensiRes, ijinRes, statusRes] = await Promise.all([
      karyawanService.list(),
      divisiService.list(),
      dataPresensiService.list(),
      ijinService.list(),
      ijinService.statusList(),
    ])
    karyawanList.value = karyawanRes.data
    divisions.value = divisionRes.data
    presensiList.value = presensiRes.data
    ijinList.value = ijinRes.data
    statusIjinList.value = statusRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data rekap.'
  } finally {
    loading.value = false
  }
}

const rekapRows = computed(() => {
  const [year, month] = filterPeriode.value.split('-').map(Number)
  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0, 23, 59, 59)
  const periodePrefix = filterPeriode.value

  const idDisetujui = statusIjinList.value.find((s) => s.kode_status === 'DISETUJUI')?.id

  const karyawanFiltered = karyawanList.value.filter(
    (k) => !filterDivisi.value || k.division_id === filterDivisi.value,
  )

  return karyawanFiltered.map((k) => {
    const presensiKaryawan = presensiList.value.filter(
      (p) => p.karyawan_id === k.id && p.tanggal.slice(0, 7) === periodePrefix,
    )
    const hadir = presensiKaryawan.filter((p) => p.status_hadir === 'tepat_waktu').length
    const terlambat = presensiKaryawan.filter((p) => p.status_hadir === 'terlambat').length

    const ijinHari = ijinList.value
      .filter((i) => i.karyawan_id === k.id && i.status_ijin_id === idDisetujui)
      .reduce((total, i) => total + overlapDays(i.tanggal_mulai, i.tanggal_selesai, periodStart, periodEnd), 0)

    return {
      id: k.id,
      nama: k.nama_lengkap,
      divisi: divisions.value.find((d) => d.id === k.division_id)?.nama_divisi ?? '-',
      hadir,
      terlambat,
      ijin: ijinHari,
      // TODO: hitung alpa butuh gabungan jadwal kerja divisi (divisions/:id/schedules)
      // + hari libur (harilibur) untuk tahu berapa hari kerja seharusnya dalam periode.
      // Belum dihitung di iterasi ini — sengaja ditampilkan 0 daripada dihitung setengah benar.
      alpa: 0,
    }
  })
})

onMounted(loadAll)
</script>

<template>
  <div class="space-y-6">
    <BaseCard>
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Periode</label>
            <select v-model="filterPeriode" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option v-for="opt in periodeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Departemen</label>
            <select v-model="filterDivisi" class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option value="">Semua Departemen</option>
              <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.nama_divisi }}</option>
            </select>
          </div>
        </div>
      </div>
    </BaseCard>

    <p v-if="!perm.canRead" class="text-sm text-outline">Anda tidak memiliki izin membaca data ini.</p>
    <p v-else-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama Karyawan</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Departemen</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Hadir</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Terlambat</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Ijin</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Alpa</th>
      </template>
      <tr v-for="row in rekapRows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.nama }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.divisi }}</td>
        <td class="px-6 py-4 text-center"><BaseBadge tone="success">{{ row.hadir }}</BaseBadge></td>
        <td class="px-6 py-4 text-center"><BaseBadge tone="warning">{{ row.terlambat }}</BaseBadge></td>
        <td class="px-6 py-4 text-center"><BaseBadge tone="neutral">{{ row.ijin }}</BaseBadge></td>
        <td class="px-6 py-4 text-center"><BaseBadge tone="error">{{ row.alpa }}</BaseBadge></td>
      </tr>
    </BaseTable>
  </div>
</template>
