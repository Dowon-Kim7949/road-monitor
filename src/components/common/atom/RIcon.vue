<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  name?: keyof typeof icons  // lucide 아이콘 이름
  imgSrc?: string               // 이미지 경로
  size?: number              // 아이콘 또는 이미지 크기
  color?: string             // 아이콘 색상
  strokeWidth?: number
}>()

const attrs = useAttrs()

// 아이콘 컴포넌트 (lucide)
const iconComponent = computed(() => props.name ? icons[props.name] : null)

const mergedProps = computed(() => ({
  ...attrs,
  size: props.size || 20,
  color: props.color || 'currentColor',
  strokeWidth: props.strokeWidth || 2
})) as any
</script>

<template>
  <!-- lucide 아이콘 사용 시 -->
  <component v-if="iconComponent && !props.imgSrc" :is="iconComponent" v-bind="mergedProps" />

  <!-- 이미지 아이콘 사용 시 -->
  <img v-else-if="props.imgSrc" :src="props.imgSrc" :alt="props.imgSrc.split('/').pop()" :width="props.size"
    :height="props.size" class="inline-block object-contain" v-bind="attrs" />

  <!-- fallback -->
  <span v-else class="text-red-500 text-xs">Invalid icon</span>
</template>
