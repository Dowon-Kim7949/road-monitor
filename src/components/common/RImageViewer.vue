<script setup lang="ts">
import { ref } from 'vue'
import RButton from './atom/RButton.vue';
import RImageModal from './RImageModal.vue';
import RPciAnalysisModal from '../rpci/RPciAnalysisModal.vue';
import RPciAnalysisSelectModal from '../rpci/RPciAnalysisSelectModal.vue';
import RModal from './RModal.vue';

defineProps<{
  src?: string
}>()

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'upload'): void
  (e: 'fullscreen'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

const showModal = ref(false)
const showAlert = ref(false)
const showConfirm = ref(false)
const imageUrl = 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'
const analysisTitle = ref('')
const modalTitle = ref('')
const modalContent = ref('')

const historyImages = [
  { src: imageUrl, date: '2024-11-20 14:58' },
  { src: imageUrl, date: '2024-11-19 14:58' },
  { src: imageUrl, date: '2024-11-18 14:58' },
  { src: imageUrl, date: '2024-11-17 14:58' },
  { src: imageUrl, date: '2024-11-16 14:58' },
  { src: imageUrl, date: '2024-11-15 14:58' },
  { src: imageUrl, date: '2024-11-14 14:58' },
  { src: imageUrl, date: '2024-11-13 14:58' },
  { src: imageUrl, date: '2024-11-12 14:58' },
  { src: imageUrl, date: '2024-11-11 14:58' },
  { src: imageUrl, date: '2024-11-10 14:58' },
  { src: imageUrl, date: '2024-11-09 14:58' },
]

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

const handleUpload = () => {
  if (showModal.value) showModal.value = false
  showRPciModal.value = !showRPciModal.value
}
const handlePlay = () => emit('play')
const handlePrev = () => emit('prev')
const handleNext = () => emit('next')

const showRPciModal = ref(false)
const showSelectRPciModal = ref(false)
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

</script>

<template>
  <div class="relative w-full bg-black rounded overflow-hidden">
    <!-- 이미지 -->
    <img
      :src="src || 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'"
      alt="Road Image" class="w-full h-auto object-cover cursor-pointer" @click="showModal = true" />

    <RImageModal :visible="showModal" :images="historyImages" @close="showModal = false" @upload="handleUpload" />
    <!-- 좌측 하단 ▶ play -->
    <RButton type="icon" class="bg-white shadow absolute bottom-4 left-4 rounded-full" icon="play" size="small"
      @click="$emit('play')" />

    <!-- 우측 상단 ⬆ upload -->
    <RButton type="icon" class="bg-white shadow absolute top-4 right-4 rounded-full" icon="upload" size="small"
      @click="handleUpload" />

    <!-- 우측 하단 ◀ ▶ ⛶ -->
    <div class="absolute bottom-2 right-2 flex space-x-5 bg-transparent p-2 rounded-full">
      <RButton type="icon" class="bg-white shadow rounded-full" icon="chevron-left" size="small"
        @click="$emit('prev')" />
      <RButton type="icon" class="bg-white shadow rounded-full" icon="chevron-right" size="small"
        @click="$emit('next')" />
      <RButton type="icon" class="bg-white shadow rounded-full" icon="maximize" size="small"
        @click="showModal = true" />
    </div>
    <RPciAnalysisModal :visible="showRPciModal" @close="showRPciModal = false" @submit="onSubmit" />
    <RPciAnalysisSelectModal :analysisTitle="analysisTitle" :items="selelctItems" :visible="showSelectRPciModal"
      @close="selectModalClose" @request="onRequest" />
    <RModal :visible="showConfirm" type="confirm" title="분석 요청 취소" content="분석 요청을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      okText="확인" cancelText="취소" @onCancel="showConfirm = false" @onConfirm="onCancel" />
    <RModal :visible="showAlert" :title="modalTitle" :content="modalContent" type="alert" okText="확인" @onOk="onOk" />
  </div>

</template>
