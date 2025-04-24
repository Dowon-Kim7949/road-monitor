<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import RButton from '@/components/common/atom/RButton.vue'
import RModeSelector from '@/components/common/RModeSelector.vue'
import RPciLegend from '../rpci/RPciLegend.vue'
import RDatePicker from './atom/RDatePicker.vue'
import RSelect from './atom/RSelect.vue'
import RPciCoverage from '../rpci/RPciCoverage.vue'
import RModal from './RModal.vue'

const { t } = useI18n()
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
const showConfirm = ref(false)
const handleChangeMode = (mode: string) => {
  activeMode.value = mode
}

const selectOptions = ref([
  { value: '2025년_1차', label: '2025년 1차 분석', analyze_at: '2025-01-01 ~ 2025-04-23' },
  { value: '2024년_6차', label: '2024년 6차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_5차', label: '2024년 5차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_4차', label: '2024년 4차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_3차', label: '2024년 3차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_2차', label: '2024년 2차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_1차', label: '2024년 1차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2023년_4차', label: '2023년 4차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2023년_3차', label: '2023년 3차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2023년_2차', label: '2023년 2차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2023년_1차', label: '2023년 1차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2022년_1차', label: '2022년 1차 분석', analyze_at: '2022-01-01 ~ 2022-04-23' },
])
const selectModel = ref<string | null>(null)

const onSavePDF = () => {
  showConfirm.value = false
}
</script>

<template>
  <!-- 좌측 상단 로고 버튼 -->
  <!-- <button class="fixed top-4 left-4 z-[4] bg-transparent p-0 cursor-pointer" @click="$emit('toggle-left')">
    <div class="flex">
      <img src="../../assets/image/CI.webp" alt="logo" class="h-15" />
      <div class="text-left pl-2">
        <div class="text-red-60 font-bold text-lg">RoadMonitor</div>
        <div class="text-gray-70 font-bold text-xs">ver1.0.0</div>
      </div>
    </div>
  </button> -->

  <button
    class="fixed top-4 left-4 z-[4] flex items-center py-2 px-4 border-1 border-gray-200  bg-white bg-opacity-90  rounded-lg shadow-md hover:bg-opacity-100 hover:shadow-lg active:shadow-sm active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out cursor-pointer group"
    @click="$emit('toggle-left')" aria-label="메인 메뉴 열기/닫기">
    <img src="../../assets/image/CI.webp" alt="RoadMonitor 로고" class="h-10 flex-shrink-0" />
    <div class="text-left pl-2">
      <div class="text-red-60 font-bold text-lg leading-tight group-hover:text-red-70 transition-colors">RoadMonitor
      </div>
      <div class="text-gray-70 font-bold text-xs leading-tight">ver1.0.0</div>
    </div>
  </button>

  <div class="fixed top-6 left-60 z-[4] bg-white text-sm rounded" :style="datePickerStyle">
    <RDatePicker v-if="props.type === 'road' || props.type === 'cover'" />
    <div v-else-if="props.type === 'rpci' || props.type === 'report'" class="min-w-90 bg-transparent">
      <RSelect v-model="selectModel" :options="selectOptions" placeholder="회차 선택" id="round-select" />
    </div>
    <div v-if="props.type === 'report'" class="fixed top-7 left-155 z-[4]">
      <RButton type="secondary" size="small" class="text-sm" icon="download" label="PDF" @click="showConfirm = true" />
    </div>
  </div>

  <!-- 좌측 하단 초기화 버튼 -->
  <RButton type=" icon" size="small" class="fixed bottom-4 left-4 bg-white shadow rounded-sm"
    :class="type === 'report' ? 'bottom-50' : ''" @click="$emit('reset-center')" icon="locate-fixed"
    :style="datePickerStyle" />

  <!-- 우측 상단 모드 선택 버튼 -->
  <RModeSelector v-if="type === 'road'" :activeMode="activeMode" @change-mode="handleChangeMode" />
  <RPciLegend v-else-if="type === 'rpci' || type === 'report'" :is-open="type === 'report' ? true : null" />
  <RPciCoverage v-if="type === 'report'" />

  <!-- 우측 하단 버튼들 -->
  <div class="floating-bottom-right fixed bottom-4 z-[4] space-x-2" :class="type === 'report' ? 'bottom-50' : ''">
    <RButton type="icon" size="small" class="bg-white shadow rounded-sm" @click="$emit('zoom-in')" icon="plus" />
    <RButton type="icon" size="small" class="bg-white shadow rounded-sm" @click="$emit('zoom-out')" icon="minus" />
  </div>

  <RModal :visible="showConfirm" type="confirm" title="PDF 파일 저장" content="현재 조회 중인 회차의 리포트를 PDF파일로 저장하시겠습니까?"
    okText="확인" cancelText="취소" @onCancel="showConfirm = false" @onConfirm="onSavePDF" />
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
