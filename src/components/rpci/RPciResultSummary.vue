<template>
  <div class="text-sm text-black space-y-2">
    <!-- 상단 텍스트 -->
    <div class="font-bold text-md">
      {{ start }} → <span class="font-bold">{{ end }}</span> ({{ distance }}) {{ t('rpciResult') }} -
      <span class="font-bold">{{ round }}</span>
    </div>

    <!-- 하단 결과 정보 -->
    <div class="flex items-center space-x-4">
      <!-- PCI 등급 -->
      <div class="text-xs font-semibold px-2 py-1 rounded-full text-white" :style="{ backgroundColor: pciColor }">
        {{ pciLabel }}
      </div>

      <!-- 점수 -->
      <div class="text-green-700 font-bold">{{ score }}점</div>

      <!-- 포트홀 -->
      <div class="text-red-500 text-md font-bold flex items-center space-x-1">
        <RIcon name="AlertTriangle" class="w-4 h-4" />
        <span>{{ t('hazard.pothole') }} {{ potholes }}개</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RIcon from '../common/atom/RIcon.vue'

defineProps<{
  start: string
  end: string
  distance: string // 예: "878m"
  round: string    // 예: "2025년 1차 분석"
  score: number
  pciLabel: string // 예: "Satisfactory"
  pciColor: string // 예: "#00C853"
  potholes: number
}>()
const { t } = useI18n()
</script>
