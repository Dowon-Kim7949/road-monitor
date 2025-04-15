<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import RButton from './atom/RButton.vue'
import RIcon from './atom/RIcon.vue';

const props = defineProps<{
  visible: boolean
  images: { src: string; date: string, title?: string }[]
  type: 'road' | 'rpci'
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'upload'): void
  (e: 'play'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

const image = ref(document.getElementById('zoomableImage'))
const selectDate = ref('')
const scale = ref(1)
const startX = ref(0)
const startY = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)

const updateImageTransform = () => {
  if (!image.value) image.value = document.getElementById('zoomableImage')
  else image.value.style.transform = `translate(calc(-50% + ${translateX.value}px), calc(-50% + ${translateY.value}px)) scale(${scale.value})`;
}

const initTransform = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  startX.value = 0
  startY.value = 0
  isDragging.value = false
  nextTick(() => {
    updateImageTransform()
  })
}

const getBounds = () => {
  const container = document.querySelector('.main-content')
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  if (!image.value) return
  const imageWidth = image.value.offsetWidth * scale.value
  const imageHeight = image.value.offsetHeight * scale.value
  return {
    minX: (containerRect.width - imageWidth) / 2,
    maxX: (imageWidth - containerRect.width) / 2,
    minY: (containerRect.height - imageHeight) / 2,
    maxY: (imageHeight - containerRect.height) / 2,
  }
}

const selectedIndex = ref(0)

const selectedImage = computed(() => {
  return props.images[selectedIndex.value]
})

const selectImage = (index: number) => {
  selectedIndex.value = index
  selectDate.value = props.images[selectedIndex.value].date
}

const prev = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
    selectDate.value = props.images[selectedIndex.value].date
  }
}

const next = () => {
  if (selectedIndex.value < props.images.length - 1) {
    selectedIndex.value++
    selectDate.value = props.images[selectedIndex.value].date
  }
}

watch(() => selectedImage, () => {
  if (image.value) initTransform()
})

watch(() => scale.value, (scale) => {
  if (scale <= 1) {
    initTransform()
  }
})

watch(() => props.visible, (value: boolean) => {
  if (value) {
    nextTick(() => {
      image.value = document.getElementById('zoomableImage')
      const container = document.querySelector('.main-content') as HTMLElement
      if (!container) return
      container.onmousedown = (e) => {
        isDragging.value = true
        startX.value = e.clientX - translateX.value
        startY.value = e.clientY - translateY.value
        if (image.value) image.value.style.cursor = 'grabbing'
      }

      container.onmouseup = () => {
        isDragging.value = false
        if (image.value) image.value.style.cursor = 'grab'
      }

      container.onmouseleave = () => {
        isDragging.value = false
        if (image.value) image.value.style.cursor = 'grab'
      }

      container.onmousemove = (e) => {
        if (!isDragging.value) return
        translateX.value = e.clientX - startX.value
        translateY.value = e.clientY - startY.value
        const bounds = getBounds() // 이동 범위 제한 (컨테이너 안에서만 움직이도록)
        if (bounds) {
          translateX.value = Math.min(Math.max(translateX.value, bounds.minX), bounds.maxX)
          translateY.value = Math.min(Math.max(translateY.value, bounds.minY), bounds.maxY)
        }
        updateImageTransform()
      }

      container.onwheel = (e) => {
        e.preventDefault()
        const zoomSpeed = 0.1
        if (e.deltaY < 0) scale.value = Math.min(scale.value + zoomSpeed, 3) // 최대 3배
        else scale.value = Math.max(scale.value - zoomSpeed, 1) // 최소 1배
        updateImageTransform()
      }
      selectDate.value = props.images[selectedIndex.value].date
    })
  }
})
</script>

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
        <div class="pt-1 text-md font-semibold flex justify-center space-x-2 items-center">
          <template v-if="type === 'rpci'">
            <span>{{ image.title }}</span>
          </template>
          <template v-else>
            <RIcon name="Camera" />
            <span>{{ image.date }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 우측 메인 이미지 -->
    <div class="flex-1 relative flex items-center justify-center">
      <div
        class="absolute top-5 left-5 bg-white z-[4] text-black px-2 py-1 rounded flex items-center space-x-2 flex-col">
        <div v-if="type === 'rpci'" class="font-bold">{{ props.images[selectedIndex].title }}</div>
        <div class="flex items-center space-x-2">
          <RIcon name="Camera" />
          <span class="text-md">{{ props.images[selectedIndex].date }}</span>
        </div>
      </div>
      <div class="main-content">
        <img :src="selectedImage?.src" id="zoomableImage" alt="Selected" class="max-h-full max-w-full object-contain"
          draggable="false" />
      </div>

      <!-- 좌측 하단 ▶ play -->
      <RButton type="icon" class="bg-white shadow absolute bottom-4 left-4 rounded-full" icon="play" size="small"
        @click="$emit('play')" />

      <!-- 우측 상단 ⬆ upload -->
      <RButton type="icon" class="bg-white shadow absolute top-4 right-4 rounded-full" icon="upload" size="small"
        @click="$emit('upload')" v-if="type === 'road'" />

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

<style scoped>
.main-content {
  width: calc(100vw - 300px);
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: #000;
  display: inline-block;
}

.main-content img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
}
</style>
