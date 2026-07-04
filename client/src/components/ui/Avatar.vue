<script setup lang="ts">
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: 'sm' | 'md' | 'lg'
  class?: string
}>()

const sizeClass = computed(() => ({
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
}[props.size || 'md']))

const initial = computed(() => (props.name || '?').charAt(0).toUpperCase())
</script>

<template>
  <div :class="cn('rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center font-bold text-gold shrink-0 ring-2 ring-gold/20 transition-all duration-200 hover:ring-gold/40', sizeClass, props.class)">
    {{ initial }}
  </div>
</template>
