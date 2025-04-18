<script setup lang="ts">
import { ref, watch } from 'vue'
import RImageViewer from './RImageViewer.vue'
import RImageInfo from './RImageInfo.vue'
import RImageHistory from './RImageHistory.vue'
import RPciResultSummary from '../rpci/RPciResultSummary.vue'
import RImageModal from './RImageModal.vue'
import RPciAnalysisModal from '../rpci/RPciAnalysisModal.vue'
import RPciAnalysisSelectModal from '../rpci/RPciAnalysisSelectModal.vue'
import RModal from './RModal.vue'
import { type history, type testData } from '@/types'

const selelctItems = [
  {
    roadname: '도로명1',
    nodelinks: [
      { linkname: '노드링크1-1', captured_at: '2025-04-14' },
      { linkname: '노드링크1-2', captured_at: '2025-04-14' }
    ]
  },
  {
    roadname: '도로명2',
    nodelinks: [
      { linkname: '노드링크2-1', captured_at: '2025-04-13' },
      { linkname: '노드링크2-2', captured_at: '2025-04-13' },
      { linkname: '노드링크2-3', captured_at: '2025-04-13' },
      { linkname: '노드링크2-4', captured_at: '2025-04-13' },
      { linkname: '노드링크2-5', captured_at: '2025-04-13' },
    ]
  },
  {
    roadname: '도로명3',
    nodelinks: [
      { linkname: '노드링크3-1', captured_at: '2025-04-13' },
      { linkname: '노드링크3-2', captured_at: '2025-04-13' },
      { linkname: '노드링크3-3', captured_at: '2025-04-13' },
      { linkname: '노드링크3-4', captured_at: '2025-04-13' },
      { linkname: '노드링크3-5', captured_at: '2025-04-13' },
    ]
  },
  {
    roadname: '도로명4',
    nodelinks: [
      { linkname: '노드링크4-1', captured_at: '2025-04-12' },
      { linkname: '노드링크4-2', captured_at: '2025-04-12' },
      { linkname: '노드링크4-3', captured_at: '2025-04-12' },
      { linkname: '노드링크4-4', captured_at: '2025-04-12' },
      { linkname: '노드링크4-5', captured_at: '2025-04-12' },
    ]
  },
  {
    roadname: '도로명5',
    nodelinks: [
      { linkname: '노드링크5-1', captured_at: '2025-04-12' },
      { linkname: '노드링크5-2', captured_at: '2025-04-12' },
      { linkname: '노드링크5-3', captured_at: '2025-04-12' },
      { linkname: '노드링크5-4', captured_at: '2025-04-12' },
      { linkname: '노드링크5-5', captured_at: '2025-04-12' },
    ]
  }
]

const modelValue = defineModel<boolean>()

const props = defineProps<{
  type: 'road' | 'rpci'
  data: testData | null
  histories: history[]
}>()

const showModal = ref(false)
const showAlert = ref(false)
const showConfirm = ref(false)
const analysisTitle = ref('')
const modalTitle = ref('')
const modalContent = ref('')
const isFullHistoryMode = ref(false) // 🔥 RImageHistory 확장 여부
const showRPciModal = ref(false)
const showSelectRPciModal = ref(false)

const onFullScreen = () => {
  showModal.value = true
}

const handleUpload = () => {
  if (showModal.value) showModal.value = false
  showRPciModal.value = !showRPciModal.value
}
const onSubmit = (data: { name: string; }) => {
  showRPciModal.value = false
  showSelectRPciModal.value = true
  if (data.name) analysisTitle.value = data.name
}
const onRequest = () => {
  showSelectRPciModal.value = false

  modalTitle.value = '요청 확인'
  modalContent.value = 'rPCI 분석이 시작되었습니다. 진행 상황은 [Rapid-PCI] 메뉴에서 확인하실 수 있습니다.'
  showAlert.value = true
}
const selectModalClose = () => {
  showConfirm.value = true
}
const onCancel = () => {
  showConfirm.value = false
  showSelectRPciModal.value = false
}
const onOk = () => {
  showAlert.value = false
}


const onSelectHistory = (item: any) => {
  showModal.value = true
}

const onCopyLatLon = () => {
  console.log('copy')
}

const onToggleHistoryFull = (expand: boolean) => {
  isFullHistoryMode.value = expand
}

// drawer 상태에 따라 body class 적용
watch(modelValue, (val) => {
  if (typeof window !== 'undefined') {
    document.body.classList.toggle('drawer-open', val)
  }
}, { immediate: true })
</script>

<template>
  <Transition name="slide-right">
    <aside v-if="modelValue" class="fixed top-0 right-0 h-full w-[40%] bg-white shadow z-40 overflow-hidden">
      <!-- 기본 화면 -->
      <Transition name="slide-fade">
        <div v-if="!isFullHistoryMode" class="p-6 space-y-2 h-full overflow-hidden">
          <RImageViewer :src="props.data?.image" :type="type" :histories="histories" @fullscreen="onFullScreen"
            @upload="handleUpload" />
          <RImageInfo :roadName="data?.roadName" :lat="data?.lat" :lon="data?.lon" :nodeLink="data?.nodeLink"
            :timestamp="data?.timestamp" @copy-coord="onCopyLatLon" :type="type" />

          <template v-if="type === 'rpci'">
            <hr class="border-gray-30" />
            <RPciResultSummary start="남양교차로" end="승리리145-4" distance="878m" round="2025년 1차 분석" :score="80"
              pciLabel="Satisfactory" pciColor="#00C853" :potholes="2" />
          </template>

          <hr class="border-gray-30" />
          <RImageHistory :type="type" :items="histories" @select="onSelectHistory" @expand="onToggleHistoryFull(true)"
            :full="isFullHistoryMode" />
        </div>
      </Transition>

      <!-- 확장된 History 전용 화면 -->
      <Transition name="slide-up-down">
        <div v-if="isFullHistoryMode" class="p-6 h-full overflow-y-auto">
          <RImageHistory :type="type" :items="histories" @select="onSelectHistory"
            @collapse="() => onToggleHistoryFull(false)" :full="isFullHistoryMode" />
        </div>
      </Transition>
    </aside>
  </Transition>


  <RImageModal :visible="showModal" :type="type" :images="histories" @close="showModal = false"
    @upload="handleUpload" />
  <RPciAnalysisModal :visible="showRPciModal" @close="showRPciModal = false" @submit="onSubmit" />
  <RPciAnalysisSelectModal :analysisTitle="analysisTitle" :items="selelctItems" :visible="showSelectRPciModal"
    @close="selectModalClose" @request="onRequest" />
  <RModal :visible="showConfirm" type="confirm" title="분석 요청 취소" content="분석 요청을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    okText="확인" cancelText="취소" @onCancel="showConfirm = false" @onConfirm="onCancel" />
  <RModal :visible="showAlert" :title="modalTitle" :content="modalContent" type="alert" okText="확인" @onOk="onOk" />
</template>

<style scoped>
.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* fade slide (일반 컴포넌트 스위치) */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* slide-up-down: history 확장 시 */
.slide-up-down-enter-active,
.slide-up-down-leave-active {
  transition: all 0.3s ease;
}

.slide-up-down-enter-from {
  transform: translateY(100%);
  opacity: 1;
}

.slide-up-down-enter-to {
  transform: translateY(0);
  opacity: 0;
}

.slide-up-down-leave-to {
  transform: translateY(100%);
  opacity: 1;
}
</style>


<style>
/* RFloatingButton 내 우측 버튼 위치 조정용 */
body.drawer-open .floating-top-right {
  right: 41% !important;
}

body.drawer-open .floating-bottom-right {
  right: 41% !important;
}
</style>
