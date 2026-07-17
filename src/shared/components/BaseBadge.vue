<script setup>
defineProps({
  tone: { type: String, default: 'neutral' },
})

const tones = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-600',
}
</script>

<template>
  <span :class="[tones[tone], 'inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider']">
    <slot />
  </span>
</template>
