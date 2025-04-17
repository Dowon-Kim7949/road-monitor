<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import RMap from '@/components/common/RMap.vue'
import RFloatingButton from '@/components/common/RFloatingButton.vue'
import RLeftDrawer from '@/components/common/RLeftDrawer.vue'
import RPciScoreBoard from '@/components/rpci/RPciScoreBoard.vue'
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

const handleSelectMarker = (data: typeof selectedData.value) => {
  selectedData.value = data
  rightDrawer.value = true
  if (leftDrawer.value) leftDrawer.value = false
}
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 좌측 사이드바 -->
    <RLeftDrawer v-model="leftDrawer" />

    <!-- 지도 영역 -->
    <RMap :leftDrawer="leftDrawer" :rightDrawer="rightDrawer" @select-marker="handleSelectMarker"
      @close-drawer="rightDrawer = false" />

    <!-- 고정 버튼 모음 -->
    <RFloatingButton @reset-center="resetCenter" @zoom-in="zoomIn" @zoom-out="zoomOut" type="report"
      @toggle-left="toggleLeftDrawer" />

    <RPciScoreBoard :pci-score="67" />
  </div>
</template>
