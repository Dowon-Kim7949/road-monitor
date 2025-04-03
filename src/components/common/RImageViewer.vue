<script setup lang="ts">
import { ref } from 'vue'
import RButton from './atom/RButton.vue';
import RImageModal from './RImageModal.vue';
import RPciAnalysisModal from '../rpci/RPciAnalysisModal.vue';
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
const imageUrl = 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'
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

const handleUpload = () => showRPciModal.value = !showRPciModal.value
const handlePlay = () => emit('play')
const handlePrev = () => emit('prev')
const handleNext = () => emit('next')

const showRPciModal = ref(false)
const onSubmit = (data: { name: string; selectedRoads: string[] }) => {
  console.log('분석 회차:', data.name)
  console.log('선택된 도로:', data.selectedRoads)
}

</script>

<template>
  <div class="relative w-full bg-black rounded overflow-hidden">
    <!-- 이미지 -->
    <img
      :src="src || 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'"
      alt="Road Image" class="w-full h-auto object-cover cursor-pointer" @click="showModal = true" />

    <RImageModal :visible="showModal" :images="historyImages" @close="showModal = false" />
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
        @click="$emit('fullscreen')" />
    </div>
    <RPciAnalysisModal :visible="showRPciModal" @close="showRPciModal = false" @submit="onSubmit" />
  </div>

</template>
