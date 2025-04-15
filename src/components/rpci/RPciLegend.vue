<script setup lang="ts">
import { ref } from 'vue'
import RIcon from '@/components/common/atom/RIcon.vue'

const isOpen = ref(false)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const grades = [
  { label: 'Good', range: '100~85', color: '#007e12', textColor: 'white' },
  { label: 'Satisfactory', range: '85~70', color: '#00c853', textColor: 'white' },
  { label: 'Fair', range: '70~55', color: '#ffff00', textColor: 'black' },
  { label: 'Poor', range: '55~40', color: '#ff5722', textColor: 'white' },
  { label: 'Very Poor', range: '40~25', color: '#bf360c', textColor: 'white' },
  { label: 'Serious', range: '25~10', color: '#5d4037', textColor: 'white' },
  { label: 'Failed', range: '10~0', color: '#9e9e9e', textColor: 'white' },
]
</script>

<template>
  <div class="fixed top-5 right-5 z-50">
    <!-- 접힌 상태 버튼 -->
    <button v-if="!isOpen"
      class="flex items-center bg-white shadow px-3 py-1 text-md font-bold rounded-sm cursor-pointer"
      @click="toggleOpen">
      <RIcon name="ChevronLeft" class="w-4 h-4 mr-2 mt-1" />
      <span class="pr-2 pt-1">등급</span>
    </button>

    <!-- 펼친 상태 레전드 -->
    <div v-else class="bg-white rounded-xl shadow p-4 space-y-2 w-55 relative transition-all">
      <!-- 닫기 버튼 -->
      <button
        class="absolute top-3 left-[-20px] text-md text-gray-600 bg-white px-1 py-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
        @click="toggleOpen">
        <RIcon name="ChevronRight" class="w-4 h-4" />
      </button>

      <!-- 등급 리스트 -->
      <div v-for="(grade, idx) in grades" :key="idx" class="flex items-center justify-between px-2">
        <span class="text-sm font-semibold px-2 py-0.5 rounded-full"
          :style="{ backgroundColor: grade.color, color: grade.textColor }">
          {{ grade.label }}
        </span>
        <span class="text-md text-gray-700 font-semibold">{{ grade.range }}</span>
      </div>
    </div>
  </div>
</template>
