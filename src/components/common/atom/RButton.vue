<script setup lang="ts">
import { computed } from "vue";
import * as rawIcons from "lucide-vue-next";
import Spinner from '@/components/common/atom/RSpinner.vue'

const icons = rawIcons as Record<string, any>

const props = defineProps({
  label: String,
  type: {
    type: String,
    default: "primary",
    validator: (val: string) => ["primary", "secondary", "tertiary", "icon", "select"].includes(val),
  },
  size: {
    type: String,
    default: "medium",
    validator: (val: string) => ["xsmall", "small", "medium", "large", "xlarge"].includes(val),
  },
  icon: String,
  iconSize: { type: Number, default: 20 },
  iconColor: { type: String, default: "currentColor" },
  strokeWidth: { type: Number, default: 2 },
  iconPos: {
    type: String,
    default: "left",
    validator: (val: string) => ["left", "right"].includes(val),
  },
  isLoaded: { type: Boolean, default: false },
});

const isIconOnly = computed(() => !props.label && props.icon);

const selectedIcon = computed(() => {
  if (!props.icon) return null;
  const iconName = props.icon.replace(/(^\w|-\w)/g, (match) => match.replace("-", "").toUpperCase());
  return icons[iconName] || null;
});

const sizeClasses = computed(() => {
  return isIconOnly.value
    ? {
      xsmall: "h-fit p-1.5",
      small: "h-fit p-2",
      medium: "h-fit p-2.5",
      large: "h-fit p-3",
      xlarge: "h-fit p-3.5",
    }[props.size]
    : {
      xsmall: "h-[24px] px-2 py-1 text-xs rounded-xs",
      small: "h-[32px] px-3 py-1.5 text-sm rounded-sm",
      medium: "h-[40px] px-4 py-2 text-base rounded-md",
      large: "h-[48px] px-5 py-2.5 text-lg rounded-lg",
      xlarge: "h-[56px] px-6 py-3 text-xl rounded-xl",
    }[props.size];
});

const typeClasses = computed(() =>
({
  primary: "bg-primary text-white hover:bg-primary-60 active:bg-primary-70 focus-visible:ring-2 focus-visible:ring-primary-40",
  secondary:
    "bg-primary-5 text-primary border border-primary hover:bg-primary-10 active:bg-primary-20 focus-visible:ring-2 focus-visible:ring-primary-40",
  tertiary:
    "text-gray-90 border border-gray-50 hover:bg-gray-10 active:bg-gray-20 focus-visible:ring-2 focus-visible:ring-gray-60",
  icon: "bg-white text-black hover:text-white hover:bg-gray-80 active:bg-black-70 focus-visible:ring-2 focus-visible:ring-primary-40",
  select: "hover:text-white hover:bg-gray-80 active:bg-black-70 focus-visible:ring-2 focus-visible:ring-primary-40"
}[props.type])
);
</script>

<template>
  <button type="button" :class="[
    'krds-btn font-sans font-medium transition-colors duration-200 cursor-pointer',
    'inline-flex items-center justify-center self-auto focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    typeClasses,
    sizeClasses,
    { 'rounded-full aspect-square': isIconOnly, 'gap-2': !isIconOnly }
  ]" :aria-label="label">
    <template v-if="iconPos === 'left'">
      <component v-if="selectedIcon" :is="selectedIcon" :size="iconSize" :stroke-width="strokeWidth"
        class="stroke-current" />
      <template v-if="isLoaded">
        <Spinner :size="size" />
      </template>
    </template>
    <span v-if="!isIconOnly" class="whitespace-nowrap">{{ label }}</span>
    <template v-if="iconPos === 'right'">
      <component v-if="selectedIcon" :is="selectedIcon" :size="iconSize" :stroke-width="strokeWidth"
        class="stroke-current" />
      <template v-if="isLoaded">
        <Spinner :size="size" />
      </template>
    </template>
  </button>
</template>
