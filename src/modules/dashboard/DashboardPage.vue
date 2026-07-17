<script setup>
import BaseCard from '../../shared/components/BaseCard.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'

const stats = [
  { label: 'TOTAL KARYAWAN', value: '1,250', icon: 'groups', tone: 'bg-primary/10 text-primary' },
  { label: 'HADIR HARI INI', value: '1,100', icon: 'how_to_reg', tone: 'bg-green-500/10 text-green-600' },
  { label: 'TERLAMBAT', value: '45', icon: 'history', tone: 'bg-error/10 text-error' },
  { label: 'IJIN / SAKIT', value: '105', icon: 'event_busy', tone: 'bg-amber-500/10 text-amber-600' },
]

const weekly = [
  { day: 'Sen', hadir: 85, telat: 10 },
  { day: 'Sel', hadir: 80, telat: 12 },
  { day: 'Rab', hadir: 90, telat: 8 },
  { day: 'Kam', hadir: 75, telat: 15 },
  { day: 'Jum', hadir: 92, telat: 5 },
]

const recent = [
  { initials: 'AS', name: 'Aditya Saputra', dept: 'Engineering', time: '08:02:45', status: 'TEPAT WAKTU', tone: 'success' },
  { initials: 'RM', name: 'Rina Maharani', dept: 'Human Resources', time: '08:15:20', status: 'TERLAMBAT', tone: 'error' },
  { initials: 'BP', name: 'Budi Prasetyo', dept: 'Finance', time: '07:55:10', status: 'TEPAT WAKTU', tone: 'success' },
]
</script>

<template>
  <div class="space-y-6">
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
          <p class="text-sm text-outline">Statistik perbandingan Hadir vs Terlambat</p>
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
            <div class="bg-error/20 w-full rounded-t-sm" :style="{ height: d.telat + '%' }"></div>
            <div class="bg-primary w-full rounded-t-lg" :style="{ height: d.hadir + '%' }"></div>
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
      <tr v-for="person in recent" :key="person.name" class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {{ person.initials }}
            </div>
            <div>
              <p class="text-sm font-semibold text-on-surface">{{ person.name }}</p>
              <p class="text-xs text-outline">{{ person.dept }}</p>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-on-surface-variant">{{ person.time }}</td>
        <td class="px-6 py-4">
          <BaseBadge :tone="person.tone">{{ person.status }}</BaseBadge>
        </td>
      </tr>
    </BaseTable>
  </div>
</template>
