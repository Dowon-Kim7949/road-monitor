<script setup lang="ts">
import { ref } from 'vue'
import RButton from './atom/RButton.vue'
import { type history } from '@/types'
import RViewToggleButton from './RViewToggleButton.vue'
import type { ViewMode } from './RViewToggleButton.vue'

defineProps<{
  src?: string
  type: 'road' | 'rpci' | 'surrounding'
  histories: history[]
}>()

defineEmits<{
  (e: 'play'): void
  (e: 'upload'): void
  (e: 'fullscreen'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

const currentView = ref<ViewMode>('road') // 초기값 설정
const handleViewChange = (newView: ViewMode): void => {
  currentView.value = newView // 부모 상태 업데이트
  // 여기서 이미지 로딩 등 추가 작업 수행 가능
}
</script>

<template>
  <div class="relative w-full rounded overflow-hidden">
    <!-- 이미지 -->
    <img :src="src ||
      'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'
      " alt="Road Image" class="w-full h-auto object-cover cursor-pointer" @click="$emit('fullscreen')" />

    <!-- 좌측 하단 ▶ play -->
    <RButton type="icon" :strokeWidth="2"
      class="bg-gray-100/0 text-white rounded-full absolute bottom-4 left-4 px-1 py-1" :icon-size="30"
      :stroke-shadow="true" icon="circle-play" @click="$emit('play')" />

    <!-- 우측 상단 ⬆ upload -->
    <RButton type="icon" :strokeWidth="3" class="bg-gray-100/0 text-white rounded-full absolute top-4 right-4"
      :stroke-shadow="true" icon="upload" size="small" @click="$emit('upload')" v-if="type === 'road'" />

    <!-- 좌측 상단 사진 토글 버튼-->
    <RViewToggleButton v-if="type === 'rpci'" class="bg-white shadow absolute top-4 left-4 rounded-full"
      :initial-view="currentView" @update:selected-view="handleViewChange" />

    <!-- 우측 하단 ◀ ▶ ⛶ -->
    <div class="absolute bottom-2 right-2 flex space-x-5 bg-transparent p-2 rounded-full">
      <RButton type="icon" :strokeWidth="3" class="bg-gray-100/0 text-white rounded-full" icon="chevron-left"
        :stroke-shadow="true" size="small" @click="$emit('prev')" />
      <RButton type="icon" :strokeWidth="3" class="bg-gray-100/0 text-white rounded-full" icon="chevron-right"
        :stroke-shadow="true" size="small" @click="$emit('next')" />
      <RButton type="icon" :strokeWidth="3" class="bg-gray-100/0 text-white rounded-full" icon="maximize" size="small"
        :stroke-shadow="true" @click="$emit('fullscreen')" />
    </div>
  </div>
</template>
