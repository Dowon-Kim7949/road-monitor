<template>
  <div class="w-full">
    <div class="flex gap-4 p-3">
      <RButton label="버튼 : primary" type="primary" size="medium" icon="check" />
      <RButton label="버튼 : secondary" type="secondary" size="medium" icon="settings" icon-pos="right" />
      <RButton label="버튼 : tertiary" type="tertiary" size="medium" icon="check" icon-pos="left" />
    </div>
    <div class="flex gap-4 p-3">
      <RTextInput />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const RButton = defineAsyncComponent(() => import('@/components/common/atom/RButton.vue'))
const RTextInput = defineAsyncComponent(() => import('@/components/common/atom/RTextInput.vue'))
</script>
