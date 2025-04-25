<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RButton from './atom/RButton.vue'
import RIcon from './atom/RIcon.vue'
import type { history } from '@/types'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const { t } = useI18n()

const props = defineProps<{
  type: 'road' | 'rpci'
  items: history[]
  full?: boolean
}>()

defineEmits<{
  (e: 'select', item: any): void
  (e: 'expand'): void
  (e: 'collapse'): void
}>()

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(props.items.length / itemsPerPage))

const displayedItems = computed(() => {
  if (!props.full) {
    return props.items.slice(0, 3)
  } else {
    return props.items
  }
})

const getLevelDetailsByScore = (score: number) => {
  return settingsStore.getLevelDetailsByScore(score, settingsStore.getLegendLevels)
}
</script>

<template>
  <div class="space-y-2 flex flex-col overflow-y-auto min-h-[300px] max-h-[300px]">
    <!-- 리스트 -->
    <div class="flex flex-1 flex-col overflow-y-auto pr-1">
      <div v-for="(item, index) in displayedItems" :key="index" @click="$emit('select', item)"
        class="flex items-center space-x-4 cursor-pointer hover:bg-gray-30 px-2 py-2 rounded">
        <!-- 썸네일 -->
        <img v-if="type === 'road'" :src="item.src || 'https://via.placeholder.com/120x72?text=No+Image'" alt="history"
          class="w-28 h-16 object-cover rounded" />

        <!-- 텍스트 -->
        <div class="text-sm text-gray-800 whitespace-nowrap">
          <template v-if="type === 'rpci'">
            <div class="font-semibold">{{ item.label }}</div>
            <div class="flex items-center space-x-3 text-sm text-black mb-1">
              <div v-if="item.title" class="font-bold">
                {{ item.title }}
              </div>
              <span>({{ item.date }})</span>
            </div>
            <div class="flex items-center space-x-3 text-sm">
              <span class="text-sm font-semibold px-2 py-1 rounded-b-full rounded-t-full w-30 text-center" :style="{
                backgroundColor: getLevelDetailsByScore(item.score!)?.color,
                color: getLevelDetailsByScore(item.score!)?.textColor,
              }">
                {{ getLevelDetailsByScore(item.score!)?.label }}
              </span>
              <span class="text-red-500 font-bold" :style="{ color: getLevelDetailsByScore(item.score!)?.color }">
                {{ item.score }}점
              </span>
              <span class="text-red-500 text-xs flex items-center space-x-2 font-bold">
                <RIcon name="AlertTriangle" class="w-4 h-4" />
                <span>{{ t('hazard.pothole') }} {{ item.potholes }}개</span>
              </span>
            </div>
          </template>
          <template v-else>
            <span>{{ item.date }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="flex justify-center py-2">
      <RButton v-if="full" type="tertiary" class="w-30 rounded-b-full rounded-t-full hover:bg-gray-100 hover:text-white"
        size="small" icon="chevron-up" :label="t('button.collapse')" icon-pos="right" @click="$emit('collapse')" />
      <RButton v-else type="tertiary" class="w-30 rounded-b-full rounded-t-full hover:bg-gray-100 hover:text-white"
        size="small" icon="chevron-down" :label="t('button.more')" icon-pos="right" @click="$emit('expand')" />
    </div>
  </div>
</template>
