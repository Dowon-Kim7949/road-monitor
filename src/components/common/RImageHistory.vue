<template>
  <div class="space-y-2">
    <h3 class="text-lg font-semibold">{{ t(type === 'rpci' ? 'RPciHistory' : 'Roadhistory') }}</h3>

    <div class="max-h-[300px] overflow-y-auto pr-1">
      <div v-for="(item, index) in items" :key="index"
        class="flex items-center space-x-4 cursor-pointer hover:bg-gray-30 px-2 py-4 rounded"
        @click="$emit('select', item)">
        <!-- 썸네일 -->
        <img :src="item.image || 'https://via.placeholder.com/120x72?text=No+Image'" alt="history"
          class="w-28 h-16 object-cover rounded" />

        <!-- 우측 텍스트 -->
        <div class="text-sm text-gray-800 whitespace-nowrap">
          <template v-if="type === 'rpci'">
            <div class="font-semibold">{{ item.label }}</div>
            <div class="flex items-center space-x-1 text-xs text-gray-500 mb-1">
              <RIcon name="Camera" class="w-4 h-4" />
              <span>{{ item.timestamp }}</span>
            </div>
            <div class="flex items-center space-x-3 text-sm">
              <span class="text-xs font-semibold px-2 py-0.5 rounded"
                :style="{ backgroundColor: item.pciColor || '#ccc', color: '#000' }">
                {{ item.pciLabel }}
              </span>
              <span class="text-red-500 font-bold">{{ item.score }}점</span>
              <span class="text-red-500 text-xs flex items-center space-x-1">
                <RIcon name="AlertTriangle" class="w-4 h-4" />
                <span>포트홀 {{ item.potholes }}개</span>
              </span>
            </div>
          </template>

          <template v-else>
            <span>{{ item.timestamp }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 더 보기 버튼 -->
    <div class="flex w-full items-center justify-center py-2">
      <RButton class="rounded-b-full rounded-t-full bg-gray-40 text-white border-0 hover:bg-gray-60 active:bg-gray-80"
        type="tertiary" :label="t('button.more')" size="small" icon="chevron-down" icon-pos="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import RButton from './atom/RButton.vue'
import RIcon from './atom/RIcon.vue'

const { t } = useI18n()

defineProps<{
  items: {
    image: string
    timestamp: string
    label?: string
    pciLabel?: string
    pciColor?: string
    score?: number
    potholes?: number
  }[]
  type: 'road' | 'rpci'
}>()

defineEmits<{
  (e: 'select', item: any): void
}>()
</script>
