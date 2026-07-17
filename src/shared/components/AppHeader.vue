<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <header class="sticky top-0 h-16 w-full flex items-center justify-between border-b border-outline-variant/30 bg-white px-8 z-40">
    <h2 class="text-xl font-semibold text-on-surface">{{ title }}</h2>
    <div class="flex items-center gap-4">
      <button class="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined">notifications</span>
        <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
      </button>
    </div>
  </header>
</template>
