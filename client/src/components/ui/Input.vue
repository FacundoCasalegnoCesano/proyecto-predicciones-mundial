<script setup lang="ts">
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const props = defineProps<{
  class?: string
  modelValue?: string | number
  type?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    :value="modelValue"
    @input="onInput"
    :type="type ?? 'text'"
    :class="cn(
      'flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  />
</template>
