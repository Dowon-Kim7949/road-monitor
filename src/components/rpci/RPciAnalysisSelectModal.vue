<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import RButton from '../common/atom/RButton.vue'
import RIcon from '../common/atom/RIcon.vue'
import RCheckbox from '../common/atom/RCheckbox.vue'
import RModal from '../common/RModal.vue'

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
  items: RoadItem[]
  visible: boolean
  analysisTitle: string
}>()

defineEmits<{
  (e: 'prev'): void
  (e: 'close'): void
  (e: 'request'): void
}>()

const expanded = ref<string[]>([])
const selected = ref<string[]>([])
const updateBatchName = ref('')
const isUpdateBatchName = ref(false)
const showUpdateConfirm = ref(false)
const showCompleteConfirm = ref(false)
const showCancelConfirm = ref(false)

watchEffect(() => {
  if (props.visible) {
    // 모든 도로 펼치기
    expanded.value = props.items.map((i) => i.roadname)
    // 모든 노드 선택하기
    selected.value = props.items.flatMap((i) => i.nodelinks.map((n) => n.linkname))
    updateBatchName.value = props.analysisTitle
  } else {
    expanded.value = []
    selected.value = []
    updateBatchName.value = ''
  }
})

const toggleExpand = (road: string) => {
  if (expanded.value.includes(road)) {
    expanded.value = expanded.value.filter((r) => r !== road)
  } else {
    expanded.value.push(road)
  }
}

const isAllSelected = (road: RoadItem) =>
  road.nodelinks.every((n) => selected.value.includes(n.linkname))

const toggleRoad = (road: RoadItem) => {
  const isSelected = isAllSelected(road)
  if (isSelected) {
    road.nodelinks.forEach((link) => {
      selected.value = selected.value.filter((l) => l !== link.linkname)
    })
  } else {
    road.nodelinks.forEach((link) => {
      if (!selected.value.includes(link.linkname)) {
        selected.value.push(link.linkname)
      }
    })
  }
}

const toggleSelect = (linkname: string) => {
  if (selected.value.includes(linkname)) {
    selected.value = selected.value.filter((l) => l !== linkname)
  } else {
    selected.value.push(linkname)
  }
}

// ✅ 전체 선택 체크 여부
const isAllChecked = computed(() =>
  props.items
    .flatMap((i) => i.nodelinks.map((n) => n.linkname))
    .every((name) => selected.value.includes(name)),
)

const toggleAll = () => {
  if (isAllChecked.value) {
    selected.value = []
  } else {
    selected.value = props.items.flatMap((i) => i.nodelinks.map((n) => n.linkname))
  }
}

const actionEditButton = () => {
  if (!isUpdateBatchName.value) {
    showUpdateConfirm.value = true
  } else {
    showCompleteConfirm.value = true
  }
}

const onUpdateBatchName = () => {
  isUpdateBatchName.value = true
  showUpdateConfirm.value = false
}

const onCompleteBatchName = () => {
  isUpdateBatchName.value = false
  showCompleteConfirm.value = false
}

const onCancelBatchName = () => {
  isUpdateBatchName.value = false
  showCancelConfirm.value = false
}
</script>

<template>
  <transition name="slide-down">
    <div
      v-if="visible"
      class="fixed top-0 right-0 bg-white p-6 w-[40%] h-full z-[40] flex flex-col"
    >
      <div class="flex flex-col">
        <div class="flex flex-row justify-between items-center align-middle mb-4">
          <div class="relative w-[95%]">
            <div class="flex h-2 overflow-hidden rounded bg-gray-30 text-xs">
              <div
                style="width: 100%"
                class="bg-gray-80 transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>
          <button class="text-black cursor-pointer" @click="$emit('close')">
            <RIcon name="X" />
          </button>
        </div>
        <p class="font-semibold mb-2">rPCI를 분석할 도로를 선택해주세요.</p>
        <div class="flex space-x-2 items-center pb-4">
          <input
            v-model="updateBatchName"
            type="text"
            class="min-w-60 max-w-full border rounded px-3 py-2 text-sm focus:ring focus:outline-none not-valid:opacity-50 not-valid:cursor-not-allowed"
            :disabled="!isUpdateBatchName"
          />
          <RButton
            @click="actionEditButton"
            size="xsmall"
            type="icon"
            icon-color="black"
            :icon="!isUpdateBatchName ? 'pencil' : 'file-pen-line'"
            class="rounded-sm hover:rounded-sm"
          />
          <RButton
            v-if="isUpdateBatchName"
            @click="showCancelConfirm = true"
            size="xsmall"
            type="icon"
            icon-color="black"
            icon="x"
            class="rounded-sm hover:rounded-sm"
          />
        </div>

        <!-- 전체 선택 체크박스 -->
        <div class="mb-4 flex items-center">
          <RCheckbox
            id="all"
            :modelValue="isAllChecked"
            @update:modelValue="toggleAll"
            :label="t('button.allSelect')"
          />
        </div>
      </div>

      <div class="flex flex-1 flex-col h-[70%]">
        <div class="grid grid-cols-2 bg-gray-10 text-xs font-semibold px-4 py-2 rounded">
          <div>{{ t('Roadname') }}/{{ t('Roadsegment') }}</div>
          <div class="pl-10">{{ t('Capture_at') }}</div>
        </div>

        <div class="overflow-y-auto">
          <div v-for="(road, idx) in items" :key="idx" class="rounded">
            <!-- 도로명 -->
            <div class="flex items-center px-4 py-2 border-b border-gray-10 hover:bg-blue-50">
              <RCheckbox
                :id="`road-${idx}`"
                :modelValue="isAllSelected(road)"
                @update:modelValue="toggleRoad(road)"
              />
              <button class="ml-2 mr-2" @click="toggleExpand(road.roadname)">
                <RIcon :name="expanded.includes(road.roadname) ? 'ChevronDown' : 'ChevronRight'" />
              </button>
              <span class="font-medium text-sm">{{ road.roadname }}</span>
            </div>

            <!-- 노드링크 -->
            <div v-if="expanded.includes(road.roadname)">
              <div
                v-for="(link, i) in road.nodelinks"
                :key="i"
                class="grid grid-cols-2 px-6 py-2 hover:bg-blue-50 text-sm border-b border-gray-10 last:border-0 rounded items-center"
              >
                <div class="flex items-center space-x-2 pl-5">
                  <RCheckbox
                    :id="`node-${idx}-${i}`"
                    :modelValue="selected.includes(link.linkname)"
                    :label="link.linkname"
                    @update:modelValue="toggleSelect(link.linkname)"
                  />
                </div>
                <div class="pl-12">{{ link.captured_at }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 flex justify-end space-x-2 border-t-1 border-gray-10">
        <RButton type="tertiary" size="small" :label="t('button.cancel')" @click="$emit('close')" />
        <RButton
          type="primary"
          size="small"
          :label="t('button.request')"
          @click="$emit('request')"
        />
      </div>
    </div>
  </transition>
  <RModal
    :visible="showUpdateConfirm"
    type="confirm"
    title="분석 회차명 변경"
    content="rPCI 분석 회차명을 변경하시겠습니까?"
    okText="확인"
    cancelText="취소"
    @onCancel="showUpdateConfirm = false"
    @onConfirm="onUpdateBatchName"
  />
  <RModal
    :visible="showCancelConfirm"
    type="confirm"
    title="분석 회차명 변경 취소"
    content="rPCI 분석 회차명 변경을 취소하시겠습니까?"
    okText="확인"
    cancelText="취소"
    @onCancel="showCancelConfirm = false"
    @onConfirm="onCancelBatchName"
  />
  <RModal
    :visible="showCompleteConfirm"
    type="confirm"
    title="분석 회차명 확정"
    content="rPCI 분석 회차명을 입력하신 내용으로로 변경하시겠습니까?"
    okText="확인"
    cancelText="취소"
    @onCancel="showCompleteConfirm = false"
    @onConfirm="onCompleteBatchName"
  />
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(100vh);
  opacity: 0;
}

.slide-down-leave-from,
.slide-down-enter-to {
  transform: translateY(0);
  opacity: 1;
}
</style>
