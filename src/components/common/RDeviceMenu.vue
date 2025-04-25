<template>
  <div class="fixed top-0 left-0 h-full w-[25%] bg-white shadow-md z-[6] overflow-y-none">
    <button class="z-50 bg-transparent p-7 cursor-pointer" @click="$emit('toggle-left')">
      <div class="flex">
        <img src="../../assets/image/CI.webp" alt="logo" class="h-15" />
        <div class="text-left pl-2">
          <div class="text-red-60 font-bold text-lg">RoadMonitor</div>
          <div class="text-gray-70 font-bold text-xs">ver1.0.0</div>
        </div>
      </div>
    </button>
    <div class="px-4 pt-4">
      <h2 class="text-lg font-semibold text-black mb-4">{{ t('deviceList') }}</h2>
    </div>
    <div class="p-4 flex flex-row h-[80%]">
      <div class="col-auto w-[50%] space-y-2 pr-4 pt-4 border-r-1 border-gray-40 text-center">
        <button
          class="w-[80%] py-2 px-4 rounded-md text-sm text-white bg-gray-40 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 cursor-pointer"
          :class="selectedDeviceId === 'all' ? 'bg-gray-100' : ''" @click="selectAllDevices">
          {{ t('all') }}
        </button>
        <button v-for="device in devices" :key="device.id"
          class="w-[80%] py-2 px-4 rounded-md text-sm text-white bg-gray-40 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 cursor-pointer"
          :class="selectedDeviceId === device.id ? 'bg-gray-100' : ''" @click="selectDevice(device.id)">
          {{ device.model }}
        </button>
      </div>
      <div class="col w-[50%] pl-7 pt-5 space-y-4">
        <div class="w-full flex flex-row">
          <div class="text-md w-17">{{ t('modelname') }}</div>
          <div class="text-md w-17">ARA_30</div>
        </div>
        <div class="w-full flex flex-row">
          <div class="text-md w-17">ID</div>
          <div class="text-md w-17">01225367219</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
// 단말기 데이터 타입 정의
interface Device {
  id: string
  model: string
}

// 단말기 목록 (API 호출 또는 props로 받을 수 있습니다.)
const devices = ref<Device[]>([])
const selectedDeviceId = ref<string>('all')

// 단말기 목록을 가져오는 함수 (가짜 데이터 사용)
const fetchDevices = () => {
  // 실제 API 호출 로직으로 대체
  devices.value = [
    { id: '001', model: '00다 0001' },
    { id: '002', model: '00다 0002' },
    { id: '003', model: '00다 0003' },
    { id: '004', model: '00다 0004' },
  ]
}

// '전체' 버튼 클릭 시 모든 단말기 커버리지 표시
const selectAllDevices = () => {
  selectedDeviceId.value = 'all'
  emit('device-selected', 'all')
}

// 특정 단말기 클릭 시 해당 단말기 커버리지 표시
const selectDevice = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  emit('device-selected', deviceId)
}

// 컴포넌트가 마운트될 때 단말기 목록을 가져옵니다.
onMounted(() => {
  fetchDevices()
  // 초기 로딩 시 '전체' 버튼이 선택되어 있으므로 'all' 이벤트를 발생시킵니다.
  emit('device-selected', 'all')
})

// 부모 컴포넌트로 선택된 단말기 ID를 전달하는 이벤트
const emit = defineEmits(['device-selected', 'toggle-left'])
</script>

<style scoped>
/* 필요하다면 추가적인 스타일링 */
</style>
