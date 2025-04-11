<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 좌측 사이드바 -->
    <RLeftDrawer v-model="leftDrawer" />
    <RFloatingList :items="[
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
      { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
      { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
      { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
      { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
      { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
      { start: '남양교차로', end: '승리리145-4', date: '2024-11-20' },
      { start: '중동초등학교', end: '중동5길', date: '2024-11-20' },
      { start: '중앙초교사거리', end: '정신여고입구삼거리', date: '2024-11-20' },
    ]" />
    <!-- 우측 사이드바 (Suspense + Async) -->
    <Suspense>
      <template #default>
        <RRightDrawer v-model="rightDrawer" :data="selectedData" />
      </template>
      <template #fallback>
        <div class="fixed top-0 right-0 w-1/2 h-full bg-white flex items-center justify-center z-40">
          <span class="text-gray-400 text-sm animate-pulse">데이터를 불러오는 중입니다...</span>
        </div>
      </template>
    </Suspense>

    <!-- 지도 영역 -->
    <RMap :leftDrawer="leftDrawer" :rightDrawer="rightDrawer" @select-marker="handleSelectMarker"
      @close-drawer="rightDrawer = false" />

    <!-- 고정 버튼 모음 -->
    <RFloatingButton @reset-center="resetCenter" @toggle-left="toggleLeftDrawer" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import RMap from '@/components/common/RMap.vue'
import RFloatingButton from '@/components/common/RFloatingButton.vue'
import RLeftDrawer from '@/components/common/RLeftDrawer.vue'
import RFloatingList from '@/components/common/RFloatingList.vue'

const RRightDrawer = defineAsyncComponent(() =>
  import('@/components/common/RRightDrawer.vue')
)

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

const handleSelectMarker = (data: typeof selectedData.value) => {
  selectedData.value = data
  rightDrawer.value = true
  if (leftDrawer.value) leftDrawer.value = false
}
</script>
