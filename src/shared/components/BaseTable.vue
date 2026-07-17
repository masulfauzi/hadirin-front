<template>
  <div class="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-outline-variant/30">
            <slot name="head" />
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/20">
          <slot />
        </tbody>
      </table>
    </div>
  </div>
</template>
