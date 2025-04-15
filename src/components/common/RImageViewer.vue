<script setup lang="ts">
import { ref } from 'vue'
import RButton from './atom/RButton.vue';
import { type history } from '@/types';

defineProps<{
  src?: string,
  type: 'road' | 'rpci'
  histories: history[]
}>()

defineEmits<{
  (e: 'play'): void
  (e: 'upload'): void
  (e: 'fullscreen'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<template>
  <div class="relative w-full rounded overflow-hidden">
    <!-- 이미지 -->
    <img
      :src="src || 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp'"
      alt="Road Image" class="w-full h-auto object-cover cursor-pointer" @click="$emit('fullscreen')" />

    <!-- 좌측 하단 ▶ play -->
    <RButton type="icon" class="bg-white shadow absolute bottom-4 left-4 rounded-full" icon="play" size="small"
      @click="$emit('play')" />

    <!-- 우측 상단 ⬆ upload -->
    <RButton type="icon" class="bg-white shadow absolute top-4 right-4 rounded-full" icon="upload" size="small"
      @click="$emit('upload')" v-if="type === 'road'" />

    <!-- 우측 하단 ◀ ▶ ⛶ -->
    <div class="absolute bottom-2 right-2 flex space-x-5 bg-transparent p-2 rounded-full">
      <RButton type="icon" class="bg-white shadow rounded-full" icon="chevron-left" size="small"
        @click="$emit('prev')" />
      <RButton type="icon" class="bg-white shadow rounded-full" icon="chevron-right" size="small"
        @click="$emit('next')" />
      <RButton type="icon" class="bg-white shadow rounded-full" icon="maximize" size="small"
        @click="$emit('fullscreen')" />
    </div>
  </div>

</template>
