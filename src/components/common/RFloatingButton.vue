<script setup lang="ts">
import { computed, ref } from 'vue'
import RButton from '@/components/common/atom/RButton.vue'
import RModeSelector from '@/components/common/RModeSelector.vue'
import RPciLegend from '../rpci/RPciLegend.vue'
import RDatePicker from './atom/RDatePicker.vue'
import RSelect from './atom/RSelect.vue'

const props = defineProps<{
  type: 'road' | 'rpci' | 'cover' | 'report'
}>()

defineEmits<{
  (e: 'toggle-left'): void
  (e: 'reset-center'): void
  (e: 'change-mode', mode: string): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
}>()

const datePickerStyle = computed(() => {
  return {
    left: props.type === 'cover' ? '26% !important' : ''
  }
})

const activeMode = ref('alert')

const handleChangeMode = (mode: string) => {
  activeMode.value = mode
}

const selectOptions = ref([
  { value: '2025년_1차', label: '2025년 1차 분석' },
  { value: '2024년_6차', label: '2024년 6차 분석' },
  { value: '2024년_5차', label: '2024년 5차 분석' },
  { value: '2024년_4차', label: '2024년 4차 분석' },
  { value: '2024년_3차', label: '2024년 3차 분석' },
  { value: '2024년_2차', label: '2024년 2차 분석' },
  { value: '2024년_1차', label: '2024년 1차 분석' },
  { value: '2023년_4차', label: '2023년 4차 분석' },
  { value: '2023년_3차', label: '2023년 3차 분석' },
  { value: '2023년_2차', label: '2023년 2차 분석' },
  { value: '2023년_1차', label: '2023년 1차 분석' },
  { value: '2022년_1차', label: '2022년 1차 분석' },
])
const selectModel = ref<string | null>(null)
</script>

<template>
  <!-- 좌측 상단 로고 버튼 -->
  <button class="fixed top-4 left-4 z-[4] bg-transparent p-3 cursor-pointer" @click="$emit('toggle-left')">
    <div class="flex">
      <img src="../../assets/image/CI.webp" alt="logo" class="h-15" />
      <div class="text-left pl-2">
        <div class="text-red-60 font-bold text-lg">RoadMonitor</div>
        <div class="text-gray-70 font-bold text-xs">ver1.0.0</div>
      </div>
    </div>
  </button>

  <div class="fixed top-8 left-60 z-[4] bg-white text-sm rounded" :style="datePickerStyle">
    <RDatePicker v-if="props.type === 'road' || props.type === 'cover'" />
    <div v-else-if="props.type === 'rpci' || props.type === 'report'" class="min-w-[200px]">
      <RSelect v-model="selectModel" :options="selectOptions" placeholder="회차 선택" id="round-select" />
    </div>
  </div>

  <!-- 좌측 하단 초기화 버튼 -->
  <RButton type="icon" size="small" class="fixed bottom-4 left-4 bg-white shadow rounded-sm"
    @click="$emit('reset-center')" icon="locate-fixed" :style="datePickerStyle" />

  <!-- 우측 상단 모드 선택 버튼 -->
  <RModeSelector v-if="type === 'road'" :activeMode="activeMode" @change-mode="handleChangeMode" />
  <RPciLegend v-else-if="type === 'rpci' || type === 'report'" />

  <!-- 우측 하단 버튼들 -->
  <div class="floating-bottom-right fixed bottom-4 z-[4] space-x-2">
    <RButton type="icon" size="small" class="bg-white shadow rounded-sm" @click="$emit('zoom-in')" icon="plus" />
    <RButton type="icon" size="small" class="bg-white shadow rounded-sm" @click="$emit('zoom-out')" icon="minus" />
  </div>
</template>

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
