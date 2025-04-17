<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RIcon from '@/components/common/atom/RIcon.vue'

const props = defineProps<{
  isOpen?: boolean | null
}>()

const { t } = useI18n()
const isOpen = ref(props.isOpen ? true : false)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const grades = [
  { label: 'Good', range: '100~85', color: '#007e12', textColor: 'white' },
  { label: 'Satisfactory', range: '85~70', color: '#00CC25', textColor: 'white' },
  { label: 'Fair', range: '70~55', color: '#FEFD33', textColor: 'black' },
  { label: 'Poor', range: '55~40', color: '#FF2B06', textColor: 'white' },
  { label: 'Very Poor', range: '40~25', color: '#AB1803', textColor: 'white' },
  { label: 'Serious', range: '25~10', color: '#690B02', textColor: 'white' },
  { label: 'Failed', range: '10~0', color: '#979797', textColor: 'white' },
]
</script>

<template>
  <div class="floating-top-right fixed top-[33px] z-50 shadow rounded-xl">
    <!-- 접힌 상태 버튼 -->
    <button v-if="!isOpen"
      class="flex items-center bg-white shadow px-3 py-1 text-md font-bold rounded-sm cursor-pointer"
      @click="toggleOpen">
      <RIcon name="ChevronLeft" class="w-4 h-4 mr-2 mt-1" />
      <span class="pr-2 pt-1">{{ t('button.grade') }}</span>
    </button>

    <!-- 펼친 상태 레전드 -->
    <div v-else class="bg-white rounded-xl shadow py-6 px-4 space-y-2 w-60 relative transition-all">
      <!-- 닫기 버튼 -->
      <button
        class="absolute top-3 left-[-20px] text-md text-gray-600 bg-white px-1 py-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
        @click="toggleOpen">
        <RIcon name="ChevronRight" class="w-4 h-4" />
      </button>

      <!-- 등급 리스트 -->
      <div v-for="(grade, idx) in grades" :key="idx" class="flex items-center justify-between px-2">
        <span class="text-sm font-semibold px-2 py-1 rounded-full w-[65%] text-center"
          :style="{ backgroundColor: grade.color, color: grade.textColor }">
          {{ grade.label }}
        </span>
        <span class="text-md text-gray-700 font-semibold">{{ grade.range }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.floating-top-right {
  right: 1rem;
  transition: right 0.3s ease;
}

body.drawer-open .floating-top-right {
  right: 51%;
}
</style>
