<script setup lang="ts">
import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw } from '@lucide/vue'

defineProps<{
  message?: string
  onRetry?: () => void
  class?: string
}>()
</script>
<template>
  <div :class="cn('flex flex-col items-center justify-center py-16 text-center', $attrs.class)">
    <div class="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-4">
      <AlertTriangle class="w-6 h-6 text-destructive-foreground" />
    </div>
    <p class="text-sm text-muted-foreground mb-4">{{ message || 'Ocurrió un error al cargar los datos' }}</p>
    <button v-if="onRetry" @click="onRetry" class="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition cursor-pointer">
      <RefreshCw class="w-3.5 h-3.5" /> Intentar de nuevo
    </button>
  </div>
</template>
