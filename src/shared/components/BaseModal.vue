<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  title: { type: String, required: true },
})

const emit = defineEmits(['close'])

function handleKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" @click.self="emit('close')">
    <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4">
        <h3 class="text-lg font-semibold text-on-surface">{{ title }}</h3>
        <button
          class="material-symbols-outlined text-outline hover:text-primary transition-colors"
          @click="emit('close')"
        >
          close
        </button>
      </div>
      <div class="px-6 py-5">
        <slot />
      </div>
      <div v-if="$slots.footer" class="flex justify-end gap-3 border-t border-outline-variant/30 px-6 py-4">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
