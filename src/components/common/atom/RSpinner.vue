<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  size: {
    type: String,
    default: "medium",
    validator: (val: string) => ["xsmall", "small", "medium", "large", "xlarge"].includes(val),
  },
  color: { type: String, default: "currentColor" },
  isLoaded: { type: Boolean, default: false },
});

const sizeClasses = computed(() => {
  return {
    xsmall: "h-[12px] w-[12px] border-[0.1rem]",
    small: "h-[16px] w-[16px] border-[0.15rem]",
    medium: "h-[20px] w-[20px] border-[0.2rem]",
    large: "h-[24px] w-[24px] border-[0.25rem]",
    xlarge: "h-[28px] w-[28px] border-[0.3rem]",
  }[props.size];
});

</script>

<template>
  <div class="krds-spinner" :class="[sizeClasses]" role="status">
    <span class="sr-only">로딩 중</span>
  </div>
</template>

<style lang="css" scoped>
.krds-spinner {
  display: inline-flex;
  content: "";
  /* border-width: 0.1rem; */
  border-style: solid;
  border-color: #ffffff;
  border-top-color: #0000ff;
  border-radius: 100%;
  animation: spin 0.9s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(359deg);
  }
}
</style>
