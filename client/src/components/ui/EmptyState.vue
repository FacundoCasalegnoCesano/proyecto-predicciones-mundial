<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  class?: string
}>()
</script>
<template>
  <div :class="cn('flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl px-6', $attrs.class)">
    <div v-if="icon" class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
      <component :is="icon" class="w-6 h-6" />
    </div>
    <h3 class="text-base font-semibold text-foreground mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground max-w-xs">{{ description }}</p>
  </div>
</template>
