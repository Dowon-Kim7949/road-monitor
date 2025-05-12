<script setup lang="ts">
import RButton from '@/components/common/atom/RButton.vue'
const props = defineProps({
  activeMode: {
    type: String,
    default: 'alert',
  }
})
const emit = defineEmits<{
  (e: 'change-mode', mode: string): void
}>()

const buttons = [
  { mode: 'alert', icon: 'triangle-alert' },
  { mode: 'block', icon: 'octagon-minus' },
  { mode: 'wave', icon: 'waves' },
]

const selectMode = (mode: string) => {
  emit('change-mode', mode)
}
</script>

<template>
  <div class="floating-top-right fixed top-4 z-[4] space-y-2 flex flex-col items-end">
    <RButton v-for="btn in buttons" :key="btn.mode" type="select" size="small" class="shadow rounded-sm"
      :icon="btn.icon" :class="{
        'text-white bg-gray-80': btn.mode === props.activeMode,
        'text-black bg-white': btn.mode !== activeMode,
      }" @click="selectMode(btn.mode)" />
  </div>
</template>

<style scoped>
.floating-top-right {
  right: 1rem;
  transition: right 0.3s ease;
}

body.drawer-open .floating-top-right {
  right: 51%;
}
</style>
