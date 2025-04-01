<template>
  <div class="grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-800 mt-3">
    <!-- 도로명 -->
    <div class="flex items-center space-x-2">
      <span class="font-medium">{{ roadName || '-' }}</span>
    </div>

    <!-- 좌표 + 복사 -->
    <div class="flex items-center space-x-2">
      <span>{{ lat?.toFixed(6) }}, {{ lon?.toFixed(6) }}</span>
      <button @click="$emit('copy-coord')">
      </button>
    </div>

    <!-- 노드링크 -->
    <div class="flex items-center space-x-2">
      <!-- <span>{{ nodeLink || '-' }}</span> -->
      <span>test</span>
    </div>

    <!-- 날짜/시간 -->
    <div class="flex items-center space-x-2">
      <!-- <span>{{ timestamp || '-' }}</span> -->
      <span>test</span>
    </div>
  </div>
</template>

<script setup lang="ts">
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
