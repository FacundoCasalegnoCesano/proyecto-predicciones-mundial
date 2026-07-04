<script setup lang="ts">
import { computed } from 'vue'
import { buttonVariants } from './button'
import { cn } from '@/lib/utils'

const props = defineProps<{
  variant?: 'default' | 'gold' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
}>()

const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class))
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
