<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RButton from './atom/RButton.vue'
import RIcon from './atom/RIcon.vue'
import type { history } from '@/types'

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

const expanded = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() =>
  Math.ceil(props.items.length / itemsPerPage)
)

const displayedItems = computed(() => {
  if (!props.full) {
    return props.items.slice(0, 3)
  }
  const start = (currentPage.value - 1) * itemsPerPage
  return props.items.slice(start, start + itemsPerPage)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<template>
  <div class="space-y-2 flex flex-col" :class="[full ? 'h-full' : '']">
    <h3 class="text-lg font-semibold">{{ t(type === 'rpci' ? 'RPciHistory' : 'Roadhistory') }} </h3>

    <!-- 리스트 -->
    <div class="flex flex-1 flex-col" :class="['overflow-y-auto pr-1', full ? 'max-h-[90vh]' : '']">
      <div v-for="(item, index) in displayedItems" :key="index" @click="$emit('select', item)"
        class="flex items-center space-x-4 cursor-pointer hover:bg-gray-30 px-2 py-2 rounded">
        <!-- 썸네일 -->
        <img :src="item.src || 'https://via.placeholder.com/120x72?text=No+Image'" alt="history"
          class="w-28 h-16 object-cover rounded" />

        <!-- 텍스트 -->
        <div class="text-sm text-gray-800 whitespace-nowrap">
          <template v-if="type === 'rpci'">
            <div class="font-semibold">{{ item.label }}</div>
            <div class="flex items-center space-x-3 text-sm text-black mb-1">
              <div v-if="item.title" class="font-bold">
                {{ item.title }}
              </div>
              <span>{{ item.date }}</span>
            </div>
            <div class="flex items-center space-x-3 text-sm">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-b-full rounded-t-full"
                :style="{ backgroundColor: item.pciColor, color: '#fff' }">
                {{ item.pciLabel }}
              </span>
              <span class="text-red-500 font-bold" :style="{ color: item.pciColor }">{{ item.score }}점</span>
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

    <!-- 페이지네이션 (확장 시) -->
    <div v-if="full" class="flex justify-center items-center gap-4 text-gray-500 w-full pl-[82px]">
      <button @click="prevPage" :disabled="currentPage === 1"
        class="text-sm px-3 py-1 border rounded text-black hover:bg-gray-100 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        {{ t('button.prev') }}
      </button>
      <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages"
        class="text-sm px-3 py-1 border rounded text-black hover:bg-gray-100 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        {{ t('button.next') }}
      </button>

      <RButton v-if="full" type="tertiary" class="rounded-b-full rounded-t-full hover:bg-gray-100 hover:text-white"
        size="small" icon="fold-vertical" :label="t('button.collapse')" icon-pos="right" @click="$emit('collapse')" />
    </div>
    <div v-if="!full" class="flex justify-center py-2">
      <RButton type="tertiary" class="rounded-b-full rounded-t-full hover:bg-gray-100 hover:text-white" size="small"
        icon="unfold-vertical" :label="t('button.more')" icon-pos="right" @click="$emit('expand')" />
    </div>
  </div>
</template>
