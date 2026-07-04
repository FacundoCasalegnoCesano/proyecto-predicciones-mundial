<script setup lang="ts">
import type { Phase } from '@/constants'

defineProps<{
  phases: Phase[]
  active: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()
</script>

<template>
  <div role="tablist" aria-label="Fases del Mundial" class="flex flex-wrap gap-1.5">
    <button
      v-for="p in phases" :key="p.key"
      @click="emit('select', p.key)"
      role="tab"
      :aria-selected="active === p.key"
      :aria-controls="`panel-${p.key}`"
      :id="`tab-${p.key}`"
      :class="active === p.key
        ? 'bg-gold text-pitch font-semibold ring-2 ring-gold/30 scale-105'
        : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:border-gold/30'"
      class="px-4 py-2 rounded-lg text-sm transition-[color,background-color,border-color] duration-200 cursor-pointer"
    >
      {{ p.label }}
    </button>
  </div>
</template>
