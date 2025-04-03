<template>
  <!-- 좌측 상단 로고 버튼 -->
  <button class="fixed top-4 left-4 z-[4] bg-transparent p-3" @click="$emit('toggle-left')">
    <div class="flex">
      <img src="../../assets/image/CI.webp" alt="logo" class="h-10" />
      <div class="text-left pl-2">
        <div class="text-red-60 font-bold text-lg">RoadMonitor</div>
        <div class="text-gray-50 text-xs">ver1.0.0</div>
      </div>
    </div>
  </button>

  <!-- 좌측 하단 초기화 버튼 -->
  <RButton type="icon" size="small" class="fixed bottom-4 left-4 bg-white shadow rounded-sm"
    @click="$emit('reset-center')" icon="locate-fixed" />

  <!-- 우측 상단 모드 선택 버튼 -->
  <RModeSelector :activeMode="activeMode" @change-mode="handleChangeMode" />

  <!-- 우측 하단 버튼들 -->
  <div class="floating-bottom-right fixed bottom-4 z-[4] space-x-2">
    <RButton type="icon" size="small" class="bg-white shadow rounded-sm" icon="plus" />
    <RButton type="icon" size="small" class="bg-white shadow rounded-sm" icon="minus" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RButton from '@/components/common/atom/RButton.vue'
import RModeSelector from '@/components/common/RModeSelector.vue'

defineEmits<{
  (e: 'toggle-left'): void
  (e: 'reset-center'): void
  (e: 'change-mode', mode: string): void
}>()

const activeMode = ref('alert')

const handleChangeMode = (mode: string) => {
  activeMode.value = mode
}
</script>

<style scoped>
.floating-top-right,
.floating-bottom-right {
  right: 1rem;
  transition: right 0.3s ease;
}

body.drawer-open .floating-top-right,
body.drawer-open .floating-bottom-right {
  right: 51%;
}
</style>
