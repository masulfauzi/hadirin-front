<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'
import BaseModal from '../../shared/components/BaseModal.vue'
import { divisiService } from './divisi.service'

const HARI_LIST = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
const HARI_LABEL = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
}

const rows = ref([])
const loading = ref(false)
const error = ref('')

const showFormModal = ref(false)
const formError = ref('')
const formSaving = ref(false)
const editingId = ref(null)
const form = ref({ kode_divisi: '', nama_divisi: '', deskripsi: '', is_active: true })

const showScheduleModal = ref(false)
const scheduleError = ref('')
const scheduleSaving = ref(false)
const scheduleLoading = ref(false)
const scheduleDivisionId = ref(null)
const scheduleDivisionName = ref('')
const schedule = ref([])

async function loadDivisions() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await divisiService.list()
    rows.value = data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data divisi.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  form.value = { kode_divisi: '', nama_divisi: '', deskripsi: '', is_active: true }
  formError.value = ''
  showFormModal.value = true
}

function openEditForm(row) {
  editingId.value = row.id
  form.value = {
    kode_divisi: row.kode_divisi,
    nama_divisi: row.nama_divisi,
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
      await divisiService.update(editingId.value, form.value)
    } else {
      await divisiService.create(form.value)
    }
    showFormModal.value = false
    await loadDivisions()
  } catch (err) {
    formError.value = err.message ?? 'Gagal menyimpan divisi.'
  } finally {
    formSaving.value = false
  }
}

async function removeDivisi(row) {
  if (!confirm(`Hapus divisi "${row.nama_divisi}"?`)) return
  try {
    await divisiService.remove(row.id)
    await loadDivisions()
  } catch (err) {
    alert(err.message ?? 'Gagal menghapus divisi.')
  }
}

function emptySchedule(hari) {
  return { hari, is_hari_kerja: false, jam_masuk: '', jam_keluar: '', toleransi_menit: 0 }
}

async function openScheduleModal(row) {
  scheduleDivisionId.value = row.id
  scheduleDivisionName.value = row.nama_divisi
  scheduleError.value = ''
  showScheduleModal.value = true
  scheduleLoading.value = true
  try {
    const { data } = await divisiService.getSchedules(row.id)
    schedule.value = HARI_LIST.map((hari) => {
      const existing = data.find((d) => d.hari === hari)
      if (!existing) return emptySchedule(hari)
      return {
        hari,
        is_hari_kerja: existing.is_hari_kerja,
        jam_masuk: existing.jam_masuk ? existing.jam_masuk.slice(0, 5) : '',
        jam_keluar: existing.jam_keluar ? existing.jam_keluar.slice(0, 5) : '',
        toleransi_menit: existing.toleransi_menit ?? 0,
      }
    })
  } catch (err) {
    scheduleError.value = err.message ?? 'Gagal memuat jadwal.'
  } finally {
    scheduleLoading.value = false
  }
}

async function submitSchedule() {
  scheduleSaving.value = true
  scheduleError.value = ''
  try {
    const payload = schedule.value.map((day) => ({
      hari: day.hari,
      is_hari_kerja: day.is_hari_kerja,
      jam_masuk: day.is_hari_kerja && day.jam_masuk ? day.jam_masuk : null,
      jam_keluar: day.is_hari_kerja && day.jam_keluar ? day.jam_keluar : null,
      toleransi_menit: day.is_hari_kerja ? day.toleransi_menit : 0,
    }))
    await divisiService.saveSchedules(scheduleDivisionId.value, payload)
    showScheduleModal.value = false
  } catch (err) {
    scheduleError.value = err.message ?? 'Gagal menyimpan jadwal.'
  } finally {
    scheduleSaving.value = false
  }
}

onMounted(loadDivisions)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <BaseButton variant="primary" @click="openCreateForm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Divisi</span>
      </BaseButton>
    </div>

    <p v-if="error" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>

    <BaseTable v-else>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Kode</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama Divisi</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Deskripsi</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.kode_divisi }}</td>
        <td class="px-6 py-4 text-sm text-on-surface">{{ row.nama_divisi }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.deskripsi ?? '-' }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="row.is_active ? 'success' : 'neutral'">{{ row.is_active ? 'Aktif' : 'Nonaktif' }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openScheduleModal(row)">
              Jadwal
            </button>
            <button class="px-3 py-1.5 text-xs font-bold rounded-lg border border-outline-variant hover:bg-slate-50 transition-colors" @click="openEditForm(row)">
              Edit
            </button>
            <button class="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors" @click="removeDivisi(row)">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    </BaseTable>

    <!-- Modal Tambah/Edit Divisi -->
    <BaseModal
      v-if="showFormModal"
      :title="editingId ? 'Edit Divisi' : 'Tambah Divisi'"
      @close="showFormModal = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Kode Divisi</label>
          <input v-model="form.kode_divisi" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Nama Divisi</label>
          <input v-model="form.nama_divisi" type="text" required class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
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

    <!-- Modal Jadwal -->
    <BaseModal
      v-if="showScheduleModal"
      :title="`Jadwal Kerja — ${scheduleDivisionName}`"
      @close="showScheduleModal = false"
    >
      <p v-if="scheduleLoading" class="text-sm text-outline">Memuat jadwal...</p>
      <div v-else class="space-y-3">
        <div v-for="day in schedule" :key="day.hari" class="grid grid-cols-12 gap-2 items-center">
          <label class="col-span-3 flex items-center gap-2 text-sm text-on-surface">
            <input v-model="day.is_hari_kerja" type="checkbox" class="rounded border-outline-variant" />
            {{ HARI_LABEL[day.hari] }}
          </label>
          <input v-model="day.jam_masuk" type="time" :disabled="!day.is_hari_kerja" class="col-span-3 h-9 px-2 bg-slate-50 border border-outline-variant rounded-lg text-sm disabled:opacity-40" />
          <input v-model="day.jam_keluar" type="time" :disabled="!day.is_hari_kerja" class="col-span-3 h-9 px-2 bg-slate-50 border border-outline-variant rounded-lg text-sm disabled:opacity-40" />
          <input
            v-model.number="day.toleransi_menit"
            type="number"
            min="0"
            :disabled="!day.is_hari_kerja"
            placeholder="Toleransi (menit)"
            class="col-span-3 h-9 px-2 bg-slate-50 border border-outline-variant rounded-lg text-sm disabled:opacity-40"
          />
        </div>
      </div>
      <p v-if="scheduleError" class="text-sm text-error mt-3">{{ scheduleError }}</p>
      <template #footer>
        <BaseButton variant="ghost" @click="showScheduleModal = false">Batal</BaseButton>
        <BaseButton variant="primary" :disabled="scheduleSaving" @click="submitSchedule">
          {{ scheduleSaving ? 'Menyimpan...' : 'Simpan Jadwal' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
