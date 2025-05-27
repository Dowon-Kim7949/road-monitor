<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DevicesService } from '@/utils/api/index'
import RMap from '@/components/common/RMap/RMap.vue'
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
  const center = [14151779.7, 4497672.02] // EPSG:3857 좌표계에서 수내역 근처 좌표 (예시)
  window.dispatchEvent(new CustomEvent('reset-map-center', { detail: center }))
}

const zoomIn = () => window.dispatchEvent(new CustomEvent('zoom-in-map'))
const zoomOut = () => window.dispatchEvent(new CustomEvent('zoom-out-map'))

const deviceSelected = () => {}
const isCompleted = ref(false)
const deviceList = ref<any>([])
const getDevicesList = async () => {
  const cust_id = localStorage.getItem('cust_id')
  let res
  try {
    res = await DevicesService.getDevices(Number(cust_id))
    console.log(res)
  } catch (err: any) {
    console.log(err)
  }

  if (res && res.data && res.data > 0) deviceList.value = res.data.devices
}

onMounted(async () => {
  await getDevicesList()
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 좌측 사이드바 -->
    <RLeftDrawer v-model="leftDrawer" />
    <RDeviceMenu @device-selected="deviceSelected" @toggle-left="leftDrawer = true" />
    <RFloatingList :items="testList" type="cover" v-if="isCompleted" />
    <!-- 지도 영역 -->
    <RMap :leftDrawer="leftDrawer" type="cover" @completed-load="isCompleted = true" />

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
