<script setup>
import { ref } from 'vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import BaseTable from '../../shared/components/BaseTable.vue'

const requests = ref([
  {
    id: 1,
    name: 'Dewi Anggraini',
    tanggal: '12 Okt 2023',
    jenis: 'Sakit',
    durasi: '1 hari',
    status: 'Menunggu',
    tone: 'warning',
  },
  {
    id: 2,
    name: 'Eko Wibowo',
    tanggal: '10 Okt 2023',
    jenis: 'Cuti Tahunan',
    durasi: '3 hari',
    status: 'Disetujui',
    tone: 'success',
  },
  {
    id: 3,
    name: 'Fitri Handayani',
    tanggal: '08 Okt 2023',
    jenis: 'Ijin Pribadi',
    durasi: '1 hari',
    status: 'Ditolak',
    tone: 'error',
  },
])

function approve(request) {
  request.status = 'Disetujui'
  request.tone = 'success'
}

function reject(request) {
  request.status = 'Ditolak'
  request.tone = 'error'
}
</script>

<template>
  <BaseTable>
    <template #head>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Tgl Pengajuan</th>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Jenis Ijin</th>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Durasi</th>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Status</th>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline text-right">Aksi</th>
    </template>
    <tr v-for="request in requests" :key="request.id" class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ request.name }}</td>
      <td class="px-6 py-4 text-sm text-outline">{{ request.tanggal }}</td>
      <td class="px-6 py-4 text-sm text-on-surface-variant">{{ request.jenis }}</td>
      <td class="px-6 py-4 text-sm text-on-surface-variant">{{ request.durasi }}</td>
      <td class="px-6 py-4">
        <BaseBadge :tone="request.tone">{{ request.status }}</BaseBadge>
      </td>
      <td class="px-6 py-4 text-right">
        <div v-if="request.status === 'Menunggu'" class="flex justify-end gap-2">
          <button
            class="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
            @click="approve(request)"
          >
            Setujui
          </button>
          <button
            class="px-4 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors"
            @click="reject(request)"
          >
            Tolak
          </button>
        </div>
      </td>
    </tr>
  </BaseTable>
</template>
