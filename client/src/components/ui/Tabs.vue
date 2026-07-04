<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'radix-vue'

const props = defineProps<{
  modelValue: string
  tabs: { value: string; label: string }[]
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <TabsRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :class="props.class">
    <TabsList :class="cn('inline-flex items-center gap-1 rounded-xl bg-muted p-1', props.class)">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-[color,background-color,border-color] duration-200',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
          'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'cursor-pointer'
        )"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
