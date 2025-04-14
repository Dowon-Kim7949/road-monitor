<template>
  <div class="grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-800 mt-3">
    <!-- 도로명 -->
    <div class="flex items-center space-x-2">
      <RIcon imgSrc="src/assets/image/road.webp" :size="20" />
      <span class="font-bold w-fit">{{ t('Roadname') }}</span>
      <span class="font-medium">{{ roadName || '-' }}</span>
    </div>

    <!-- 좌표 + 복사 -->
    <div class="flex items-center space-x-2">
      <RIcon imgSrc="src/assets/image/place.webp" :size="20" />
      <span class="font-bold w-fit">{{ t('Coordinates') }}</span>
      <span>{{ lat?.toFixed(6) }}, {{ lon?.toFixed(6) }}</span>
      <RButton @click="$emit('copy-coord')" size="xsmall" type="icon" icon-color="black" icon="copy"
        class="rounded-sm hover:rounded-sm" />
    </div>

    <!-- 노드링크 -->
    <div class="flex items-center space-x-2">
      <RIcon imgSrc="src/assets/image/linear_scale.webp" :size="20" />
      <span class="font-bold w-fit">{{ t('Roadsegment') }}</span>
      <span>남양교차로 → 송림리145-4 (878m)</span>
    </div>

    <!-- 날짜/시간 -->
    <div class="flex items-center space-x-2">
      <RIcon imgSrc="src/assets/image/time.webp" :size="20" />
      <span class="font-bold w-fit">{{ t('Capture_at') }}</span>
      <span>2025-04-11 14:58:35</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import RIcon from '@/components/common/atom/RIcon.vue'
import RButton from './atom/RButton.vue'

const { t } = useI18n()
defineProps<{
  roadName?: string
  lat?: number
  lon?: number
  nodeLink?: string
  timestamp?: string
}>()

defineEmits<{
  (e: 'copy-coord'): void
}>()
</script>
