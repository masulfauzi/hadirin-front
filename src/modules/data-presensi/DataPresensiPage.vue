<script setup>
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'

const rows = [
  {
    name: 'Adelia Putri',
    id: 'EMP-001',
    masuk: '08:00:12',
    keluar: '17:05:44',
    status: 'Hadir',
    tone: 'success',
    lokasi: 'Kantor Pusat, Lt. 4',
  },
  {
    name: 'Budi Santoso',
    id: 'EMP-002',
    masuk: '08:45:30',
    keluar: '17:00:15',
    status: 'Terlambat',
    tone: 'warning',
    lokasi: 'Workshop A',
  },
  {
    name: 'Citra Lestari',
    id: 'EMP-003',
    masuk: '--:--:--',
    keluar: '--:--:--',
    status: 'Alpa',
    tone: 'error',
    lokasi: 'Tidak Diketahui',
  },
]
</script>

<template>
  <div class="space-y-6">
    <BaseCard>
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Rentang Tanggal</label>
            <input
              type="text"
              value="01 Okt 2023 - 31 Okt 2023"
              class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Departemen</label>
            <select class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option>Semua Departemen</option>
              <option>IT Development</option>
              <option>Human Resource</option>
              <option>Marketing</option>
              <option>Finance</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Status</label>
            <select class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option>Semua Status</option>
              <option>Hadir</option>
              <option>Terlambat</option>
              <option>Alpa</option>
            </select>
          </div>
        </div>
        <BaseButton variant="primary">
          <span class="material-symbols-outlined text-[20px]">download</span>
          <span>Export</span>
        </BaseButton>
      </div>
    </BaseCard>

    <BaseTable>
      <template #head>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jam Masuk</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jam Keluar</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Status</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Lokasi</th>
      </template>
      <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-on-surface">{{ row.name }}</span>
            <span class="text-xs text-outline">ID: {{ row.id }}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-sm font-medium">{{ row.masuk }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.keluar }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge :tone="row.tone">{{ row.status }}</BaseBadge>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-1 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">location_on</span>
            <span>{{ row.lokasi }}</span>
          </div>
        </td>
      </tr>
    </BaseTable>
  </div>
</template>
