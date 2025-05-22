<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import RMap from '@/components/common/RMap/RMap.vue'
import RFloatingButton from '@/components/common/RFloatingButton.vue'
import RLeftDrawer from '@/components/common/RLeftDrawer.vue'
import RFloatingList from '@/components/common/RFloatingList.vue'

const RRightDrawer = defineAsyncComponent(() => import('@/components/common/RRightDrawer.vue'))

const imageUrl =
  'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'
const leftDrawer = ref(false)
const rightDrawer = ref(false)
const selectedData = ref<null | {
  lat: number
  lon: number
  roadName: string
  image: string
  nodeLink: string
  timestamp: string
}>(null)

const testList = [
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
  { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
  { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
  { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
]

const testhistories = [
  { src: imageUrl, date: '2024-11-20 14:58', title: '2025년 1차 분석' },
  { src: imageUrl, date: '2024-11-19 14:58', title: '2024년 6차 분석' },
  { src: imageUrl, date: '2024-11-18 14:58', title: '2024년 5차 분석' },
  { src: imageUrl, date: '2024-11-17 14:58', title: '2024년 4차 분석' },
  { src: imageUrl, date: '2024-11-16 14:58', title: '2024년 3차 분석' },
  { src: imageUrl, date: '2024-11-15 14:58', title: '2024년 2차 분석' },
  { src: imageUrl, date: '2024-11-14 14:58', title: '2024년 1차 분석' },
  { src: imageUrl, date: '2024-11-13 14:58', title: '2023년 4차 분석' },
  { src: imageUrl, date: '2024-11-12 14:58', title: '2023년 3차 분석' },
  { src: imageUrl, date: '2024-11-11 14:58', title: '2023년 2차 분석' },
  { src: imageUrl, date: '2024-11-10 14:58', title: '2023년 1차 분석' },
  { src: imageUrl, date: '2024-11-09 14:58', title: '2022년 1차 분석' },
]

const toggleLeftDrawer = () => {
  leftDrawer.value = !leftDrawer.value
}

const resetCenter = () => {
  // 수내역 근처로 지도 이동 이벤트 발생
  const center = [14150000, 4510000] // EPSG:3857 좌표계에서 수내역 근처 좌표 (예시)
  window.dispatchEvent(new CustomEvent('reset-map-center', { detail: center }))
}

const zoomIn = () => window.dispatchEvent(new CustomEvent('zoom-in-map'))
const zoomOut = () => window.dispatchEvent(new CustomEvent('zoom-out-map'))

const handleSelectMarker = (data: any) => {
  selectedData.value = data
  if (selectedData.value) {
    selectedData.value.roadName = `${data.roadName ? data.roadName : '-'} (${data.length}m)`
  }
  rightDrawer.value = true
  if (leftDrawer.value) leftDrawer.value = false
}
const isCompleted = ref(false)
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 좌측 사이드바 -->
    <RLeftDrawer v-model="leftDrawer" />
    <RFloatingList :items="testList" v-if="isCompleted" />
    <!-- 우측 사이드바 (Suspense + Async) -->
    <Suspense>
      <template #default>
        <RRightDrawer v-model="rightDrawer" :data="selectedData" type="road" :histories="testhistories" />
      </template>
      <template #fallback>
        <div class="fixed top-0 right-0 w-1/2 h-full bg-white flex items-center justify-center z-40">
          <span class="text-gray-400 text-sm animate-pulse">데이터를 불러오는 중입니다...</span>
        </div>
      </template>
    </Suspense>

    <!-- 지도 영역 -->
    <RMap :leftDrawer="leftDrawer" :rightDrawer="rightDrawer" @select-feature="handleSelectMarker"
      @close-drawer="rightDrawer = false" type="road" @completed-load="isCompleted = true" />

    <!-- 고정 버튼 모음 -->
    <RFloatingButton @reset-center="resetCenter" @zoom-in="zoomIn" @zoom-out="zoomOut" type="road"
      @toggle-left="toggleLeftDrawer" />
  </div>
</template>
