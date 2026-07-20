<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import { karyawanService } from '../karyawan/karyawan.service'
import { divisiService } from '../divisi/divisi.service'
import { dataPresensiService } from '../data-presensi/data-presensi.service'
import { ijinService } from '../manajemen-ijin/manajemen-ijin.service'
import { useAuthStore } from '../login/login.store'

const auth = useAuthStore()

const DAY_LABEL = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const karyawanList = ref([])
const divisions = ref([])
const presensiList = ref([])
const ijinList = ref([])
const statusIjinList = ref([])
const loading = ref(false)
const error = ref('')

async function loadAdminDashboard() {
  loading.value = true
  error.value = ''
  try {
    const [karyawanRes, presensiRes, ijinRes, statusRes] = await Promise.all([
      karyawanService.list(),
      dataPresensiService.list(),
      ijinService.list(),
      ijinService.statusList(),
    ])
    karyawanList.value = karyawanRes.data
    presensiList.value = presensiRes.data
    ijinList.value = ijinRes.data
    statusIjinList.value = statusRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data dashboard.'
  } finally {
    loading.value = false
  }
}

async function loadMyProfile() {
  loading.value = true
  error.value = ''
  try {
    const [karyawanRes, divisiRes] = await Promise.all([karyawanService.list(), divisiService.list()])
    karyawanList.value = karyawanRes.data
    divisions.value = divisiRes.data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data profil.'
  } finally {
    loading.value = false
  }
}

const myKaryawan = computed(
  () => karyawanList.value.find((k) => k.kode_identitas === auth.user?.kode_identitas) ?? null,
)
const myDivisiNama = computed(
  () => divisions.value.find((d) => d.id === myKaryawan.value?.division_id)?.nama_divisi ?? '-',
)

const presensiHariIni = computed(() => presensiList.value.filter((p) => p.tanggal.slice(0, 10) === todayStr()))

const totalKaryawan = computed(() => karyawanList.value.length)
const hadirHariIni = computed(() => presensiHariIni.value.filter((p) => p.status_hadir === 'tepat_waktu').length)
const terlambatHariIni = computed(() => presensiHariIni.value.filter((p) => p.status_hadir === 'terlambat').length)

const ijinHariIni = computed(() => {
  const today = todayStr()
  const kodeDitolakDibatalkan = statusIjinList.value
    .filter((s) => s.kode_status === 'DITOLAK' || s.kode_status === 'DIBATALKAN')
    .map((s) => s.id)
  return ijinList.value.filter((i) => {
    if (kodeDitolakDibatalkan.includes(i.status_ijin_id)) return false
    return i.tanggal_mulai.slice(0, 10) <= today && i.tanggal_selesai.slice(0, 10) >= today
  }).length
})

const stats = computed(() => [
  { label: 'TOTAL KARYAWAN', value: totalKaryawan.value, icon: 'groups', tone: 'bg-primary/10 text-primary' },
  { label: 'HADIR HARI INI', value: hadirHariIni.value, icon: 'how_to_reg', tone: 'bg-green-500/10 text-green-600' },
  { label: 'TERLAMBAT', value: terlambatHariIni.value, icon: 'history', tone: 'bg-error/10 text-error' },
  { label: 'IJIN / SAKIT', value: ijinHariIni.value, icon: 'event_busy', tone: 'bg-amber-500/10 text-amber-600' },
])

const karyawanMap = computed(() => Object.fromEntries(karyawanList.value.map((k) => [k.id, k])))

const recent = computed(() =>
  [...presensiHariIni.value]
    .filter((p) => p.jam_hadir)
    .sort((a, b) => new Date(b.jam_hadir) - new Date(a.jam_hadir))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      nama: karyawanMap.value[p.karyawan_id]?.nama_lengkap ?? '-',
      divisi: karyawanMap.value[p.karyawan_id]?.jabatan ?? '-',
      jam: new Date(p.jam_hadir).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: p.status_hadir === 'terlambat' ? 'TERLAMBAT' : 'TEPAT WAKTU',
      tone: p.status_hadir === 'terlambat' ? 'error' : 'success',
    })),
)

const weekly = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const pad = (n) => String(n).padStart(2, '0')
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const dayRows = presensiList.value.filter((p) => p.tanggal.slice(0, 10) === dateStr)
    days.push({
      day: DAY_LABEL[d.getDay()],
      hadir: dayRows.filter((p) => p.status_hadir === 'tepat_waktu').length,
      telat: dayRows.filter((p) => p.status_hadir === 'terlambat').length,
    })
  }
  const max = Math.max(1, ...days.map((d) => d.hadir + d.telat))
  return days.map((d) => ({
    ...d,
    hadirPct: (d.hadir / max) * 100,
    telatPct: (d.telat / max) * 100,
  }))
})

onMounted(() => {
  if (auth.isAdmin) {
    loadAdminDashboard()
  } else {
    loadMyProfile()
  }
})
</script>

<template>
  <div class="space-y-6">
    <p v-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseCard v-else-if="!auth.isAdmin">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-primary" style="font-size: 32px">person</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-on-surface">{{ myKaryawan?.nama_lengkap ?? auth.user?.username ?? '-' }}</h3>
          <p class="text-sm text-outline mt-1">{{ myDivisiNama }}</p>
          <p class="text-sm text-outline">{{ myKaryawan?.jabatan ?? '-' }}</p>
        </div>
      </div>
    </BaseCard>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BaseCard v-for="stat in stats" :key="stat.label" class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-outline mb-1">{{ stat.label }}</p>
            <h3 class="text-3xl font-bold text-on-surface">{{ stat.value }}</h3>
          </div>
          <div :class="[stat.tone, 'w-12 h-12 rounded-lg flex items-center justify-center']">
            <span class="material-symbols-outlined" style="font-size: 28px">{{ stat.icon }}</span>
          </div>
        </BaseCard>
      </div>

      <BaseCard>
        <div class="flex items-center justify-between mb-8">
          <div>
            <h4 class="text-lg font-semibold text-on-surface">Tren Kehadiran Mingguan</h4>
            <p class="text-sm text-outline">Statistik perbandingan Hadir vs Terlambat, 7 hari terakhir</p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-primary"></span>
              <span class="text-xs font-semibold uppercase tracking-wider text-outline">Hadir</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-error/40"></span>
              <span class="text-xs font-semibold uppercase tracking-wider text-outline">Terlambat</span>
            </div>
          </div>
        </div>
        <div class="h-64 flex items-end justify-between gap-4 px-4">
          <div v-for="d in weekly" :key="d.day" class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div class="w-full flex flex-col-reverse h-full">
              <div class="bg-error/20 w-full rounded-t-sm" :style="{ height: d.telatPct + '%' }"></div>
              <div class="bg-primary w-full rounded-t-lg" :style="{ height: d.hadirPct + '%' }"></div>
            </div>
            <span class="text-xs font-semibold uppercase tracking-wider text-outline">{{ d.day }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseTable>
        <template #head>
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Waktu</th>
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Status</th>
        </template>
        <tr v-if="recent.length === 0">
          <td colspan="3" class="px-6 py-6 text-sm text-outline text-center">Belum ada presensi hari ini.</td>
        </tr>
        <tr v-for="person in recent" :key="person.id" class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-on-surface">{{ person.nama }}</span>
              <span class="text-xs text-outline">{{ person.divisi }}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-on-surface-variant">{{ person.jam }}</td>
          <td class="px-6 py-4">
            <BaseBadge :tone="person.tone">{{ person.status }}</BaseBadge>
          </td>
        </tr>
      </BaseTable>
    </template>
  </div>
</template>
