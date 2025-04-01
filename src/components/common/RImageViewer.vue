<template>
  <div class="relative w-full bg-black rounded overflow-hidden">
    <!-- 이미지 -->
    <img
      :src="src || 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'"
      alt="Road Image" class="w-full h-auto object-cover" />

    <!-- 좌측 하단 ▶ play -->
    <RButton class="bg-white shadow absolute bottom-2 left-2 p-1 rounded-full" icon="play" icon-color="black"
      size="small" @click="$emit('play')" />

    <!-- 우측 상단 ⬆ upload -->
    <RButton class="bg-white shadow absolute top-2 right-2 p-1 rounded-full" icon="upload" icon-color="black"
      size="small" @click="$emit('upload')" />

    <!-- 우측 하단 ◀ ▶ ⛶ -->
    <div class="absolute bottom-2 right-2 flex space-x-5 bg-transparent p-1 rounded-full">
      <RButton class="bg-white shadow p-1 rounded-full" icon="chevron-left" icon-color="black" size="small"
        @click="$emit('prev')" />
      <RButton class="bg-white shadow p-1 rounded-full" icon="chevron-right" icon-color="black" size="small"
        @click="$emit('next')" />
      <RButton class="bg-white shadow p-1 rounded-full" icon="maximize" icon-color="black" size="small"
        @click="$emit('fullscreen')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import RButton from './atom/RButton.vue';
defineProps<{
  src?: string
}>()

defineEmits<{
  (e: 'play'): void
  (e: 'upload'): void
  (e: 'fullscreen'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>
