<script setup lang="ts">
import { computed } from 'vue'
import * as rawIcons from 'lucide-vue-next'
import Spinner from '@/components/common/atom/RSpinner.vue'

const icons = rawIcons as Record<string, any>

const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'primary',
    validator: (val: string) =>
      ['primary', 'secondary', 'tertiary', 'icon', 'select'].includes(val),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val: string) => ['xsmall', 'small', 'medium', 'large', 'xlarge'].includes(val),
  },
  icon: String,
  iconSize: { type: Number, default: 20 },
  iconColor: { type: String, default: 'currentColor' },
  strokeWidth: { type: Number, default: 2 },
  strokeShadow: { type: Boolean, default: false },
  iconPos: {
    type: String,
    default: 'left',
    validator: (val: string) => ['left', 'right'].includes(val),
  },
  isLoaded: { type: Boolean, default: false },
  imageSrc: String,              // ← 추가: 이미지 소스 URL
})

const isIconOnly = computed(() => !props.label && props.icon && !props.imageSrc)
const hasImage = computed(() => !!props.imageSrc)

const selectedIcon = computed(() => {
  if (!props.icon) return null
  const iconName = props.icon.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase())
  return icons[iconName] || null
})

const sizeClasses = computed(() => {
  // 이미지 버튼일 때는 정사각 비율로
  if (hasImage.value) {
    return {
      xsmall: 'h-6 w-6 p-1',
      small: 'h-8 w-8 p-1.5',
      medium: 'h-10 w-10 p-2',
      large: 'h-12 w-12 p-2.5',
      xlarge: 'h-14 w-14 p-3',
    }[props.size]
  }
  // 기존 버튼 크기
  return isIconOnly.value
    ? {
      xsmall: 'h-fit p-1',
      small: 'h-fit p-2',
      medium: 'h-fit p-2.5',
      large: 'h-fit p-3',
      xlarge: 'h-fit p-3.5',
    }[props.size]
    : {
      xsmall: 'h-[24px] px-2 py-1 text-xs rounded-xs',
      small: 'h-[32px] px-3 py-1.5 text-sm rounded-sm',
      medium: 'h-[40px] px-4 py-2 text-base rounded-md',
      large: 'h-[48px] px-5 py-2.5 text-lg rounded-lg',
      xlarge: 'h-[56px] px-6 py-3 text-xl rounded-xl',
    }[props.size]
})

const typeClasses = computed(
  () =>
    ({
      primary:
        'bg-primary text-white hover:bg-primary-60 active:bg-primary-70 focus-visible:ring-2 focus-visible:ring-primary-40',
      secondary:
        'bg-primary-5 text-primary border border-primary hover:bg-primary-10 active:bg-primary-20 focus-visible:ring-2 focus-visible:ring-primary-40',
      tertiary:
        'text-gray-90 border border-gray-50 hover:bg-gray-10 active:bg-gray-20 focus-visible:ring-2 focus-visible:ring-gray-60',
      icon: 'text-black hover:text-white hover:bg-gray-80 active:bg-black-70 focus-visible:ring-2 focus-visible:ring-primary-40',
      select:
        'hover:text-white hover:bg-gray-80 active:bg-black-70 focus-visible:ring-2 focus-visible:ring-primary-40',
    })[props.type],
)
</script>

<template>
  <button type="button" :class="[
    'krds-btn font-sans font-medium transition-colors duration-200 cursor-pointer',
    'inline-flex items-center justify-center self-auto focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    typeClasses,
    sizeClasses,
    {
      'rounded-full aspect-square': isIconOnly || hasImage,
      'gap-2': !isIconOnly && !hasImage
    },
  ]" :aria-label="label">
    <!-- 왼쪽 이미지/아이콘 -->
    <template v-if="iconPos === 'left'">
      <img v-if="hasImage" :src="imageSrc" :alt="label || 'button image'" class="object-contain" />
      <component v-else-if="selectedIcon" :is="selectedIcon" :size="iconSize" :stroke-width="strokeWidth"
        class="stroke-current" :class="strokeShadow ? 'filter drop-shadow-[0_0_2px_#0f0f0f]' : ''" />
      <Spinner v-if="isLoaded && !hasImage" :size="size" />
    </template>

    <!-- 텍스트 -->
    <span v-if="!isIconOnly && !hasImage" class="whitespace-nowrap">{{ label }}</span>

    <!-- 오른쪽 이미지/아이콘 -->
    <template v-if="iconPos === 'right'">
      <img v-if="hasImage" :src="imageSrc" :alt="label || 'button image'" class="object-contain" />
      <component v-else-if="selectedIcon" :is="selectedIcon" :size="iconSize" :stroke-width="strokeWidth"
        class="stroke-current" :class="strokeShadow ? 'filter drop-shadow-[0_0_2px_#0f0f0f]' : ''" />
      <Spinner v-if="isLoaded && !hasImage" :size="size" />
    </template>
  </button>
</template>
