<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RButton from '../common/atom/RButton.vue'
import RIcon from '../common/atom/RIcon.vue'
import RCheckbox from '../common/atom/RCheckbox.vue'

interface NodeLink {
  linkname: string
  captured_at: string
}

interface RoadItem {
  roadname: string
  nodelinks: NodeLink[]
}

const { t } = useI18n()
const props = defineProps<{
  items: RoadItem[],
  visible: boolean,
  analysisTitle: string
}>()

defineEmits<{
  (e: 'prev'): void
  (e: 'close'): void
  (e: 'request'): void
}>()

const expanded = ref<string[]>([])
const selected = ref<string[]>([])

const toggleExpand = (road: string) => {
  if (expanded.value.includes(road)) {
    expanded.value = expanded.value.filter(r => r !== road)
  } else {
    expanded.value.push(road)
  }
}

const isAllSelected = (road: RoadItem) => {
  return road.nodelinks.every(n => selected.value.includes(n.linkname))
}

const toggleRoad = (road: RoadItem) => {
  const isSelected = isAllSelected(road)
  if (isSelected) {
    road.nodelinks.forEach(link => {
      selected.value = selected.value.filter(l => l !== link.linkname)
    })
  } else {
    road.nodelinks.forEach(link => {
      if (!selected.value.includes(link.linkname)) {
        selected.value.push(link.linkname)
      }
    })
  }
}

const toggleSelect = (linkname: string) => {
  if (selected.value.includes(linkname)) {
    selected.value = selected.value.filter(l => l !== linkname)
  } else {
    selected.value.push(linkname)
  }
}
</script>

<template>
  <div v-if="visible" class="fixed top-0 right-0 bg-white p-6 w-[40%] h-full z-[5]">
    <p class="font-semibold mb-2">rPCI를 분석할 도로를 선택해주세요.</p>
    <p class="text-gray-500 mb-4">{{ analysisTitle }}</p>

    <div class="grid grid-cols-2 bg-gray-10 text-xs font-semibold px-4 py-2 rounded">
      <div>{{ t('Roadname') }}/{{ t('Roadsegment') }}</div>
      <div>{{ t('Capture_at') }}</div>
    </div>

    <div class="overflow-y-auto max-h-[85%]">
      <div v-for="(road, idx) in items" :key="idx" class="rounded">
        <!-- 도로명 행 -->
        <div class="flex items-center px-4 py-2 border-b border-gray-10 hover:bg-blue-50">
          <RCheckbox :id="`road-${idx}`" :modelValue="isAllSelected(road)" @update:modelValue="toggleRoad(road)" />
          <button class="ml-2 mr-2" @click="toggleExpand(road.roadname)">
            <RIcon :name="expanded.includes(road.roadname) ? 'ChevronDown' : 'ChevronRight'" />
          </button>
          <span class="font-medium text-sm">{{ road.roadname }}</span>
        </div>

        <!-- 노드링크들 -->
        <div v-if="expanded.includes(road.roadname)">
          <div v-for="(link, i) in road.nodelinks" :key="i"
            class="grid grid-cols-2 px-6 py-2 hover:bg-blue-50 text-sm border-b border-gray-10 last:border-0 rounded items-center">
            <div class="flex items-center space-x-2 pl-5">
              <RCheckbox :id="`node-${idx}-${i}`" :modelValue="selected.includes(link.linkname)" :label="link.linkname"
                @update:modelValue="toggleSelect(link.linkname)" />
            </div>
            <div>{{ link.captured_at }}</div>
          </div>
        </div>

      </div>
    </div>

    <div class="absolute right-10 bottom-5 flex justify-end space-x-2">
      <RButton type="tertiary" size="small" :label="t('button.prev')" @click="$emit('prev')" />
      <RButton type="tertiary" size="small" :label="t('button.request')" @click="$emit('request')" />
    </div>
  </div>
</template>
