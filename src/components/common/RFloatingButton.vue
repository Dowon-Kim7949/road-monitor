<template>
  <!-- 좌측 상단 로고 버튼 -->
  <button class="fixed top-4 left-4 z-50 bg-white p-2 rounded shadow" @click="$emit('toggle-left')">
    <img src="../../assets/image/logo.svg" alt="logo" class="h-6" />
  </button>

  <!-- 좌측 하단 초기화 버튼 -->
  <RButton class="fixed bottom-4 left-4 bg-white shadow" @click="$emit('reset-center')" icon="locate-fixed"
    icon-color="black" />

  <!-- 우측 상단 버튼들 -->
  <div class="floating-top-right fixed top-4 z-50 space-y-2 flex flex-col items-end">
    <RButton class="bg-white shadow" icon="camera" icon-color="black" />
    <RButton class="bg-white shadow" icon="waves" icon-color="black" />
  </div>

  <!-- 우측 하단 버튼들 -->
  <div class="floating-bottom-right fixed bottom-4 z-50 space-x-2">
    <RButton class="bg-white shadow" icon="plus" icon-color="black" />
    <RButton class="bg-white shadow" icon="minus" icon-color="black" />
  </div>
</template>

<script setup lang="ts">
import RButton from '@/components/common/atom/RButton.vue'
defineEmits<{
  (e: 'toggle-left'): void
  (e: 'reset-center'): void
}>()
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
