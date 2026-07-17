<script setup>
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseButton from '../../shared/components/BaseButton.vue'

const rows = [
  { name: 'Adelia Putri', dept: 'IT Development', hadir: 20, telat: 2, ijin: 1, alpa: 0 },
  { name: 'Budi Santoso', dept: 'Human Resource', hadir: 18, telat: 3, ijin: 0, alpa: 1 },
  { name: 'Citra Lestari', dept: 'Marketing', hadir: 15, telat: 1, ijin: 4, alpa: 2 },
]
</script>

<template>
  <div class="space-y-6">
    <BaseCard>
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Periode</label>
            <select class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option>Oktober 2023</option>
              <option>September 2023</option>
              <option>Agustus 2023</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-outline block">Departemen</label>
            <select class="w-full h-10 px-4 bg-slate-50 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option>Semua Departemen</option>
              <option>IT Development</option>
              <option>Human Resource</option>
              <option>Marketing</option>
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
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama Karyawan</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Departemen</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Hadir</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Terlambat</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Ijin</th>
        <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-center">Alpa</th>
      </template>
      <tr v-for="row in rows" :key="row.name" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.name }}</td>
        <td class="px-6 py-4 text-sm text-outline">{{ row.dept }}</td>
        <td class="px-6 py-4 text-center">
          <BaseBadge tone="success">{{ row.hadir }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-center">
          <BaseBadge tone="warning">{{ row.telat }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-center">
          <BaseBadge tone="neutral">{{ row.ijin }}</BaseBadge>
        </td>
        <td class="px-6 py-4 text-center">
          <BaseBadge tone="error">{{ row.alpa }}</BaseBadge>
        </td>
      </tr>
    </BaseTable>
  </div>
</template>
