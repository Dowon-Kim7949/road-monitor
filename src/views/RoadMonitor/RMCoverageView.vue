<script setup lang="ts">
import { ref } from 'vue'
import RMap from '@/components/common/RMap.vue'
import RFloatingButton from '@/components/common/RFloatingButton.vue'
import RLeftDrawer from '@/components/common/RLeftDrawer.vue'
import RFloatingList from '@/components/common/RFloatingList.vue'
import RDeviceMenu from '@/components/common/RDeviceMenu.vue'

const leftDrawer = ref(false)
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

const deviceSelected = () => {
  console.log('deviceSelected')
}
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 좌측 사이드바 -->
    <RLeftDrawer v-model="leftDrawer" />
    <RDeviceMenu @device-selected="deviceSelected" @toggle-left="leftDrawer = true" />
    <RFloatingList :items="testList" type="cover" />
    <!-- 지도 영역 -->
    <RMap :leftDrawer="leftDrawer" type="cover" />

    <!-- 고정 버튼 모음 -->
    <RFloatingButton
      @reset-center="resetCenter"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      type="cover"
      @toggle-left="toggleLeftDrawer"
    />
  </div>
</template>
