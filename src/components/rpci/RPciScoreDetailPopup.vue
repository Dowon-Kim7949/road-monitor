<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '@/stores/settings' // Store 경로 확인
import type { PropType } from 'vue' // PropType 임포트
import RIcon from '../common/atom/RIcon.vue'
// RColumnIcon 컴포넌트 임포트 (경로 확인!)
import RColumnIcon from '../common/atom/RColumnIcon.vue'
import RButton from '../common/atom/RButton.vue'

// --- Store ---
const settingsStore = useSettingsStore()

// --- Types ---
interface TitleData {
  level?: string | number
  status?: number
  coverage?: string
}

interface TableHeader {
  key: string
  text: string
  filterable?: boolean
  sortable?: boolean // 정렬 가능 여부 추가 (선택적)
}

interface TableRow {
  [key: string]: any
  score?: number
  action?: string
}

interface LevelDetails {
  color: string
  textColor: string
  label: string
}

// --- Props ---
const props = defineProps({
  visible: { type: Boolean, default: false },
  titleData: {
    type: Object as PropType<TitleData>,
    default: () => ({
      level: '등급',
      status: 90,
      coverage: '커버리지 12km',
    }),
  },
  tableHeaders: {
    type: Array as PropType<TableHeader[]>,
    default: () => [
      // sortable 속성 추가 예시 (필요한 컬럼에 true 설정)
      { text: '도로명', key: 'roadName', sortable: true },
      { text: '노드링크', key: 'nodeLink', sortable: true },
      { text: '점수', key: 'score', sortable: true },
      { text: '파손 유형', key: 'action', sortable: false }, // 예시: 파손 유형은 정렬 불가
    ],
  },
  tableData: { type: Array as PropType<TableRow[]>, default: () => [] },
  itemsPerPage: { type: Number, default: 10 },
  initialPosition: {
    type: Object as PropType<{ top?: string; left?: string; right?: string; bottom?: string }>,
    default: () => ({ top: '9%', left: '16px' }),
  },
})

// --- Emits ---
const emit = defineEmits(['update:visible', 'filter', 'action'])

// --- Refs ---
const popupContainerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const initialTranslateX = ref(0)
const initialTranslateY = ref(0)
const currentTranslateX = ref(0)
const currentTranslateY = ref(0)
const currentPage = ref(1)

// --- Sorting Refs ---
const sortKey = ref<string>('') // 현재 정렬 기준 컬럼 key
const sortDirection = ref<'asc' | 'desc'>('asc') // 정렬 방향

// --- Computed Styles ---
const popupStyle = computed(() => ({
  transform: `translate(${currentTranslateX.value}px, ${currentTranslateY.value}px)`,
  userSelect: isDragging.value ? 'none' : ('auto' as 'none' | 'auto'),
}))

// --- Computed Data ---

// 정렬된 데이터
const sortedData = computed(() => {
  if (!sortKey.value) {
    // 정렬 기준이 없으면 원본 데이터 복사본 반환
    return [...props.tableData]
  }

  const key = sortKey.value
  const direction = sortDirection.value === 'asc' ? 1 : -1

  // 원본 배열을 변경하지 않기 위해 복사본 생성 후 정렬
  return [...props.tableData].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]

    // 타입에 따른 비교 로직 (숫자, 문자열 등)
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA - valueB) * direction
    } else if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.localeCompare(valueB) * direction
    } else {
      // 다른 타입 또는 null/undefined 처리 (간단한 예: 문자열 변환 후 비교)
      const strA = String(valueA ?? '') // null/undefined를 빈 문자열로 처리
      const strB = String(valueB ?? '')
      return strA.localeCompare(strB) * direction
    }
  })
})

const totalPages = computed(() => {
  // sortedData 기준으로 계산
  if (!sortedData.value || sortedData.value.length === 0 || props.itemsPerPage <= 0) {
    return 1
  }
  return Math.ceil(sortedData.value.length / props.itemsPerPage)
})

// 페이지네이션 데이터 (정렬된 데이터를 사용)
const paginatedData = computed(() => {
  if (!sortedData.value || sortedData.value.length === 0 || props.itemsPerPage <= 0) {
    return []
  }
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return sortedData.value.slice(start, end) // sortedData 사용
})

// 페이지네이션 숫자 로직 (이전과 동일)
const displayedPageNumbers = computed<Array<number | string>>(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisibleButtons = 5
  const delta = Math.floor(maxVisibleButtons / 2)

  if (total <= 1) return []

  let startPage = Math.max(1, current - delta)
  let endPage = Math.min(total, current + delta)

  if (endPage - startPage + 1 < maxVisibleButtons) {
    if (current < total / 2) {
      endPage = Math.min(total, startPage + maxVisibleButtons - 1)
    } else {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1)
    }
  }
  if (total > maxVisibleButtons) {
    if (current <= delta + 1) {
      endPage = maxVisibleButtons
    }
    if (current >= total - delta) {
      startPage = total - maxVisibleButtons + 1
    }
  }

  const pages: Array<number | string> = []

  if (startPage > 1) {
    pages.push(1)
    if (startPage > 2) {
      pages.push('...')
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  if (endPage < total) {
    if (endPage < total - 1) {
      pages.push('...')
    }
    pages.push(total)
  }

  return pages
})

// --- Drag Handlers --- (이전과 동일)
const startDrag = (event: MouseEvent) => {
  if (event.button !== 0) return
  isDragging.value = true
  startX.value = event.clientX
  startY.value = event.clientY
  initialTranslateX.value = currentTranslateX.value
  initialTranslateY.value = currentTranslateY.value
  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag, { once: true })
}

const doDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  const dx = event.clientX - startX.value
  const dy = event.clientY - startY.value
  currentTranslateX.value = initialTranslateX.value + dx
  currentTranslateY.value = initialTranslateY.value + dy
}

const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', doDrag)
}

// --- Lifecycle and Watchers ---
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      currentPage.value = 1
      // 팝업 열릴 때 정렬 상태 초기화 (선택적)
      // sortKey.value = null;
      // sortDirection.value = 'asc';
    } else {
      if (isDragging.value) {
        stopDrag()
      }
    }
  },
)

watch(
  () => props.tableData,
  () => {
    currentPage.value = 1
    // 데이터 변경 시 정렬 상태 유지 또는 초기화 (선택적)
    // sortKey.value = null;
  },
  { deep: true },
)

// --- Methods ---
const closePopup = () => emit('update:visible', false)

const emitFilter = (columnKey: string) => {
  if (isDragging.value) return
  emit('filter', columnKey)
}

const emitAction = (rowData: TableRow) => {
  if (isDragging.value) return
  emit('action', rowData)
}

// --- Sorting Method ---
const sortBy = (key: string) => {
  if (isDragging.value) return // 드래그 중에는 정렬 방지

  // 정렬 불가능한 컬럼이면 무시 (sortable 속성 사용 시)
  const header = props.tableHeaders.find((h) => h.key === key)
  if (header && header.sortable === false) {
    return
  }

  if (sortKey.value === key) {
    // 같은 컬럼 클릭 시: 방향 변경 (asc -> desc -> 정렬 없음(선택적))
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortKey.value = '' // 다시 클릭하면 정렬 해제 (선택 사항)
      // sortDirection.value = 'asc'; // 또는 오름차순으로 리셋
    }
    // else if (sortDirection.value === 'desc') {
    //   sortKey.value = null; // 세 번째 클릭 시 정렬 해제 (선택 사항)
    // }
  } else {
    // 다른 컬럼 클릭 시: 해당 컬럼으로 오름차순 정렬
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  // 정렬 시 첫 페이지로 이동
  currentPage.value = 1
}

// --- Pagination Methods --- (이전과 동일)
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (pageNumber: number | string) => {
  if (typeof pageNumber === 'number' && pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber
  }
}

const getLevelDetails = (score: number | undefined): LevelDetails | null => {
  if (typeof score !== 'number') return null
  return settingsStore.getLevelDetailsByScore(score)
}

// --- Cleanup ---
onBeforeUnmount(() => {
  if (isDragging.value) {
    stopDrag()
  }
})
</script>

<template>
  <div v-show="visible" ref="popupContainerRef"
    class="fixed z-50 bg-white rounded-lg shadow-lg w-146 max-w-[700px] min-h-[300px] max-h-[70vh] flex flex-col overflow-hidden"
    :style="[
      popupStyle,
      {
        top: props.initialPosition.top,
        left: props.initialPosition.left,
        right: props.initialPosition.right,
        bottom: props.initialPosition.bottom,
      },
    ]" :class="{ 'select-none': isDragging, 'shadow-xl': isDragging }">
    <div class="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-100/5 select-none"
      :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }" @mousedown.prevent="startDrag">
      <div class="flex items-center gap-2">
        <RIcon name="GripVertical" :size="15" />
        <span class="text-xs font-medium text-gray-600">{{ titleData.level }}:</span>
        <span v-if="typeof titleData.status === 'number'">
          <p class="text-xs font-semibold px-2 py-0.5 rounded-full text-center w-25" :style="{
            backgroundColor: getLevelDetails(titleData.status)?.color ?? '#ccc',
            color: getLevelDetails(titleData.status)?.textColor ?? '#000',
          }">
            {{ getLevelDetails(titleData.status)?.label ?? 'N/A' }}
          </p>
        </span>
        <span class="text-xs font-medium text-gray-600">{{ titleData.coverage }}</span>
      </div>
      <div>
        <button type="button"
          class="text-xs px-2 py-2 cursor-pointer rounded bg-gray hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
          @click="closePopup">
          <RIcon name="X" :size="18" />
        </button>
      </div>
    </div>

    <div class="overflow-y-auto flex-grow">
      <table class="w-full border-collapse">
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th v-for="(header, index) in tableHeaders" :key="`header-${index}`"
              class="p-3 text-center border-b border-gray-200 text-sm font-semibold whitespace-nowrap select-none"
              :class="{
                'text-center': index === tableHeaders.length - 1,
                'cursor-pointer': header.sortable !== false, // 정렬 가능할 때만 커서 변경
                'cursor-default': header.sortable === false, // 정렬 불가능하면 기본 커서
              }" @click="sortBy(header.key)">
              <div class="flex items-center justify-center gap-1">
                <span>{{ header.text }}</span>
                <button v-if="header.filterable" type="button"
                  class="bg-transparent border-none p-0 ml-1 align-middle cursor-pointer text-gray-500 hover:text-gray-200 focus:outline-none"
                  @click.stop="emitFilter(header.key)" aria-label="Filter column"></button>
                <RColumnIcon v-if="header.sortable !== false" :column="header.key" :sort-column="sortKey"
                  :sort-direction="sortDirection" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="tableHeaders.length" class="text-center text-gray-500 p-5">
              데이터가 없습니다.
            </td>
          </tr>
          <tr v-for="(row, rowIndex) in paginatedData" :key="`row-${rowIndex}`" class="hover:bg-gray-200">
            <td v-for="(header, colIndex) in tableHeaders" :key="`cell-${rowIndex}-${colIndex}`"
              class="p-3 border-b border-gray-200 text-sm align-middle" :class="{
                'text-center': colIndex === tableHeaders.length - 1 || header.key === 'score',
              }">
              <template v-if="header.key === 'score' && typeof row[header.key] === 'number'">
                <div class="inline-block font-medium text-center"
                  :style="{ color: getLevelDetails(row[header.key])?.color ?? 'inherit' }">
                  {{ row[header.key] }}
                </div>
              </template>
              <template v-else-if="header.key === 'action'">
                <button type="button"
                  class="bg-transparent border-none text-blue-600 hover:text-blue-800 cursor-pointer p-0 underline text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                  @click="emitAction(row)">
                  {{ row[header.key] || '상세 보기' }}
                </button>
              </template>
              <template v-else>
                {{ row[header.key] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="p-3 border-t border-gray-200 bg-white flex justify-center items-center gap-1">
      <button type="button"
        class="text-xs px-3 py-1 border cursor-pointer border-gray-300 rounded bg-white hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
        :disabled="currentPage === 1" @click="prevPage" aria-label="Previous page">
        이전
      </button>
      <template v-for="(page, index) in displayedPageNumbers" :key="`page-${index}`">
        <button v-if="typeof page === 'number'" type="button"
          class="text-xs px-3 py-1 rounded cursor-pointer border border-transparent hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-400"
          :class="{
            'bg-blue-500 text-white hover:bg-blue-600 border-blue-500 cursor-default':
              page === currentPage,
            'bg-white text-gray-700 border-gray-300': page !== currentPage,
          }" :disabled="page === currentPage" @click="goToPage(page)" :aria-label="`Go to page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined">
          {{ page }}
        </button>
        <span v-else class="px-2 py-1 text-gray-500" aria-hidden="true">
          {{ page }}
        </span>
      </template>
      <button type="button"
        class="text-xs px-3 py-1 border cursor-pointer border-gray-300 rounded bg-white hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
        :disabled="currentPage === totalPages" @click="nextPage" aria-label="Next page">
        다음
      </button>
    </div>
  </div>
</template>
