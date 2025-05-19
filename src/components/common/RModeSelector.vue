<script setup lang="ts">
import RButton from '@/components/common/atom/RButton.vue'
import IconBridge from '@/assets/image/bridge.svg'
import IconSignal from '@/assets/image/directions.svg'

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
  { mode: 'alert', icon: 'triangle-alert', type: 'icon' },
  { mode: 'signal', imgSrc: IconSignal, type: 'img' },
  { mode: 'bridge', imgSrc: IconBridge, type: 'img' },
  { mode: 'wave', icon: 'waves', type: 'icon' },
]

const selectMode = (mode: string) => {
  emit('change-mode', mode)
}
</script>

<template>
  <div class="floating-top-right fixed top-4 z-[4] space-y-2 flex flex-col items-end">
    <template v-for="btn in buttons" :key="btn.mode">
      <RButton v-if="btn.type === 'icon'" type="select" size="small" class="shadow rounded-sm w-9 h-9" :icon="btn.icon"
        :class="{
          'text-white bg-gray-80': btn.mode === props.activeMode,
          'text-black bg-white': btn.mode !== activeMode,
        }" @click="selectMode(btn.mode)" />

      <button v-else-if="btn.type === 'img'" type="button" @click="selectMode(btn.mode)"
        class="group rounded transition-colors focus:outline-none w-9 h-9 cursor-pointer flex justify-center items-center"
        :class="[
          'hover:bg-gray-80', btn.mode === activeMode ? 'bg-gray-80' : 'bg-white'
        ]">
        <img :src="btn.imgSrc" alt="" class="w-6 h-6 filter transition duration-200 group-hover:invert"
          :class="{ 'invert': btn.mode === activeMode }" />
      </button>
    </template>
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
