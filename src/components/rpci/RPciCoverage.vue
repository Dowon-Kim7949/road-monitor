<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RIcon from '@/components/common/atom/RIcon.vue'

const { t } = useI18n()
const isOpen = ref(true)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <!-- 접힌 상태 버튼 -->
  <div v-if="!isOpen" class="floating-top-right fixed bottom-62 right-1 z-50 shadow">
    <button
      class="flex items-center bg-white shadow px-3 py-1 text-md font-bold rounded-sm cursor-pointer"
      @click="toggleOpen"
    >
      <RIcon name="ChevronLeft" class="w-4 h-4 mr-2 mt-1" />
      <span class="pr-2 pt-1">{{ t('button.coverage') }}</span>
    </button>
  </div>
  <!-- 펼친 상태 레전드 -->
  <div
    v-else
    class="floating-top-right fixed bottom-62 right-1 bg-white rounded-sm rounded-tl-none shadow py-4 px-7 w-55"
  >
    <!-- 닫기 버튼 -->
    <button
      class="absolute top-0 left-[-20px] text-md text-gray-600 bg-white px-1 py-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
      @click="toggleOpen"
    >
      <RIcon name="ChevronRight" class="w-4 h-4" />
    </button>

    <!-- 등급 리스트 -->
    <div class="flex flex-col items-center justify-between font-bold">
      <div class="text-lg">rPCI {{ t('button.coverage') }}</div>
      <div class="">
        <span class="text-5xl">321</span>
        <span class="text-lg font-medium">km</span>
      </div>
    </div>
  </div>
</template>

<style>
.floating-top-right {
  right: 1rem;
  transition: right 0.3s ease;
}
</style>
