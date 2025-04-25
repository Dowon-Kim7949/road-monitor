<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import RIcon from '@/components/common/atom/RIcon.vue'

const props = defineProps<{
  isOpen?: boolean | null
}>()

const { t } = useI18n()
const isOpen = ref(props.isOpen ? true : false)
const settingsStore = useSettingsStore()

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const grades = settingsStore.getLegendLevels
</script>

<template>
  <div class="floating-top-right fixed top-[24px] z-[2] border-1 border-gray-200 rounded-sm">
    <!-- 접힌 상태 버튼 -->
    <button
      v-if="!isOpen"
      class="flex items-center bg-white shadow px-3 py-1 text-md font-bold rounded-sm cursor-pointer"
      @click="toggleOpen"
    >
      <RIcon name="ChevronLeft" class="w-4 h-4 mr-2 mt-1" />
      <span class="pr-2 pt-1">{{ t('button.grade') }}</span>
    </button>

    <!-- 펼친 상태 레전드 -->
    <div
      v-else
      class="bg-white rounded-sm rounded-tl-none shadow p-4 space-y-2 w-55 relative transition-all"
    >
      <!-- 닫기 버튼 -->
      <button
        class="absolute top-[-1px] left-[-25px] text-md text-gray-600 bg-white px-1 py-2 rounded-tl-sm rounded-bl-sm cursor-pointer border-b-1 border-t-1 border-l-1 border-r-0 border-gray-200"
        @click="toggleOpen"
      >
        <RIcon name="ChevronRight" class="w-4 h-4" />
      </button>
      <!-- 등급 리스트 -->
      <div
        v-for="(grade, idx) in grades"
        :key="idx"
        class="flex items-center justify-between px-0 space-x-5"
      >
        <div class="w-full">
          <p
            class="text-sm font-semibold px-3 py-1 rounded-full text-center"
            :style="{ backgroundColor: grade.color, color: grade.textColor }"
          >
            {{ grade.label }}
          </p>
        </div>
        <div class="w-20 text-right">
          <span class="text-[14px] font-semibold text-shadow" :style="{ color: grade.color }">
            {{ grade.minScore }}~{{ grade.maxScore }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.text-shadow {
  text-shadow: 1px 1px 3px #888888;
}

.floating-top-right {
  right: 1rem;
  transition: right 0.3s ease;
}

body.drawer-open .floating-top-right {
  right: 51%;
}
</style>
