<template>
  <div v-if="visible" class="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex text-white">
    <!-- 좌측 이미지 리스트 -->
    <div class="w-[300px] overflow-y-auto space-y-0 bg-gray-900 thin-scrollbar">
      <div v-for="(image, index) in images" :key="index" @click="selectImage(index)"
        class="cursor-pointer border-2 rounded overflow-hidden transition-all duration-200" :class="{
          'border-blue-500': selectedIndex === index,
          'border-transparent': selectedIndex !== index
        }">
        <img :src="image.src" alt="history" class="w-full h-[150px] object-cover" />
        <div class="text-center py-1 text-sm font-semibold">{{ image.date }}</div>
      </div>
    </div>

    <!-- 우측 메인 이미지 -->
    <div class="flex-1 relative flex items-center justify-center">
      <img :src="selectedImage?.src" alt="Selected" class="max-h-full max-w-full object-contain" />

      <!-- 좌측 하단 ▶ play -->
      <RButton type="icon" class="bg-white shadow absolute bottom-4 left-4 rounded-full" icon="play" size="small"
        @click="$emit('play')" />

      <!-- 우측 상단 ⬆ upload -->
      <RButton type="icon" class="bg-white shadow absolute top-4 right-4 rounded-full" icon="upload" size="small"
        @click="$emit('upload')" />

      <!-- 우측 하단 ◀ ▶ ✕ -->
      <div class="absolute bottom-4 right-4 flex space-x-3">
        <RButton type="icon" class="bg-white shadow rounded-full" icon="chevron-left" size="small" @click="prev" />
        <RButton type="icon" class="bg-white shadow rounded-full" icon="chevron-right" size="small" @click="next" />
        <RButton type="icon" class="bg-white shadow rounded-full" icon="minimize" size="small"
          @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import RButton from './atom/RButton.vue'

const props = defineProps<{
  visible: boolean
  images: { src: string; date: string }[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'upload'): void
  (e: 'play'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

const selectedIndex = ref(0)

const selectedImage = computed(() => {
  return props.images[selectedIndex.value]
})

const selectImage = (index: number) => {
  selectedIndex.value = index
}

const prev = () => {
  if (selectedIndex.value > 0) selectedIndex.value--
}

const next = () => {
  if (selectedIndex.value < props.images.length - 1) selectedIndex.value++
}
</script>
