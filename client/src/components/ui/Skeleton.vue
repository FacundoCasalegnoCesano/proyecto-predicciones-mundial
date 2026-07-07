<script setup lang="ts">
import { cn } from '@/lib/utils'
defineProps<{ class?: string }>()
</script>
<template>
  <div :class="cn('rounded-lg bg-muted animate-pulse', $attrs.class)" />
</template>
