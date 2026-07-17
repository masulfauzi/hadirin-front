<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
})

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90 active:scale-[98%]',
  ghost: 'text-primary hover:bg-primary/5 border border-primary',
  danger: 'bg-error text-white hover:bg-error/90 active:scale-[98%]',
}
</script>

<template>
  <button
    :class="[variants[variant], 'flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all']"
  >
    <slot />
  </button>
</template>
