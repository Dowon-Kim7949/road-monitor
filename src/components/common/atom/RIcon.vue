<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  name: keyof typeof icons
  size?: number
  color?: string
  strokeWidth?: number
}>()

const iconComponent = computed(() => icons[props.name] || null)
const attrs = useAttrs()

const mergedProps = computed(() => ({
  ...attrs,
  size: props.size || 20,
  color: props.color || 'currentColor',
  strokeWidth: props.strokeWidth || 2
})) as any
</script>

<template>
  <component :is="iconComponent" v-bind="mergedProps" />
</template>
