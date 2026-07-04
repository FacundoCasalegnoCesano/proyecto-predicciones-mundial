<script setup lang="ts">
import { cn } from '@/lib/utils'
import { computed } from 'vue'
import { ChevronDown } from '@lucide/vue'

const props = defineProps<{
  modelValue?: string | number
  options: { value: string | number; label: string }[]
  placeholder?: string
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="onChange"
      :class="cn(
        'flex h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2.5 pr-8 text-sm text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
    >
      <option v-if="placeholder" :value="''" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
    </select>
    <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
  </div>
</template>
