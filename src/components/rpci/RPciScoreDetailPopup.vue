<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '@/stores/settings' // Store 경로 확인
import type { PropType } from 'vue' // PropType 임포트
import RIcon from '../common/atom/RIcon.vue'

// --- Store ---
const settingsStore = useSettingsStore()

// --- Types ---
// 부모로부터 받을 props의 타입 정의 (필요에 따라 확장)
interface TitleData {
  level?: string | number
  status?: number // status가 점수라고 가정
  coverage?: string
}

interface TableHeader {
  key: string
  text: string
  filterable?: boolean
}

// tableData의 row 객체 타입을 정의 (실제 데이터 구조에 맞게 수정)
interface TableRow {
  [key: string]: any // 모든 키를 허용하거나 더 구체적인 타입 정의
  score?: number // score 키가 있다면 number 타입
  action?: string // action 키가 있다면 string 타입
}

// getLevelDetailsByScore가 반환하는 객체 타입 (settingsStore에서 가져오거나 여기서 정의)
interface LevelDetails {
  color: string
  textColor: string
  label: string
}

// --- Props ---
const props = defineProps({
  visible: { type: Boolean, default: false },
  // PropType을 사용하여 더 명확한 타입 지정
  titleData: {
    type: Object as PropType<TitleData>, default: () => ({
      level: '등급',
      status: 90,
      coverage: '커버리지 12km',
    })
  },
  tableHeaders: {
    type: Array as PropType<TableHeader[]>, default: () => [
      { text: '도로명', key: 'roadName', filterable: true },
      { text: '노드링크', key: 'nodeLink' },
      { text: '점수', key: 'score' },
      { text: '파손 유형', key: 'action' },
    ]
  },
  tableData: { type: Array as PropType<TableRow[]>, default: () => [] },
  // closeOnOutsideClick prop 제거 (외부 클릭 시 닫히지 않음)
  itemsPerPage: { type: Number, default: 10 },
  initialPosition: { type: Object as PropType<{ top?: string; left?: string; right?: string; bottom?: string }>, default: () => ({ top: '50px', left: '50px' }) } // 초기 위치 prop 추가
})

// --- Emits ---
const emit = defineEmits(['update:visible', 'filter', 'action'])

// --- Refs ---
const popupContainerRef = ref<HTMLElement | null>(null) // 타입 명시
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
// transform 대신 top/left 직접 제어 방식으로 변경 (또는 transform 유지)
// 여기서는 transform 방식을 유지하되, 초기 위치는 CSS로 설정
const initialTranslateX = ref(0)
const initialTranslateY = ref(0)
const currentTranslateX = ref(0)
const currentTranslateY = ref(0)
const currentPage = ref(1)

// --- Computed Styles ---
// 드래그를 위한 transform 스타일과 초기 위치 스타일 결합
const popupStyle = computed(() => ({
  // 초기 위치는 CSS 클래스 또는 style 속성으로 설정하고, 드래그는 transform으로 처리
  transform: `translate(${currentTranslateX.value}px, ${currentTranslateY.value}px)`,
  userSelect: isDragging.value ? 'none' : 'auto' as 'none' | 'auto', // 타입 명시
  // 초기 위치 적용 (옵션 1: CSS 클래스 사용 / 옵션 2: 여기서 style 객체에 top/left 추가)
  // top: props.initialPosition.top, // 옵션 2 예시
  // left: props.initialPosition.left // 옵션 2 예시
}))

// --- Computed Data ---
const totalPages = computed(() => {
  if (!props.tableData || props.tableData.length === 0 || props.itemsPerPage <= 0) {
    return 1 // 데이터가 없거나 페이지당 항목 수가 유효하지 않으면 1페이지
  }
  return Math.ceil(props.tableData.length / props.itemsPerPage)
})

const paginatedData = computed(() => {
  if (!props.tableData || props.tableData.length === 0 || props.itemsPerPage <= 0) {
    return []
  }
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.tableData.slice(start, end)
})

// 페이지네이션 숫자 로직 (이전과 동일)
const displayedPageNumbers = computed<Array<number | string>>(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisibleButtons = 5 // 양 옆으로 표시될 최대 숫자 버튼 수 (현재 페이지 제외)
  const delta = Math.floor(maxVisibleButtons / 2)

  if (total <= 1) return []

  let startPage = Math.max(1, current - delta)
  let endPage = Math.min(total, current + delta)

  // 페이지 범위 조정 (항상 최대 버튼 수를 유지하도록 시도)
  if (endPage - startPage + 1 < maxVisibleButtons) {
    if (current < total / 2) {
      endPage = Math.min(total, startPage + maxVisibleButtons - 1);
    } else {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
  }
  // 항상 최소 5개 버튼 보장 (전체 페이지 수가 5보다 작지 않다면)
  if (total > maxVisibleButtons) {
    if (current <= delta + 1) { // Adjust start range if current page is near the beginning
      endPage = maxVisibleButtons;
    }
    if (current >= total - delta) { // Adjust end range if current page is near the end
      startPage = total - maxVisibleButtons + 1;
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
});

// --- Drag Handlers ---
const startDrag = (event: MouseEvent) => { // 타입 명시: MouseEvent
  // 왼쪽 마우스 버튼만 반응
  if (event.button !== 0) return

  // 드래그 대상이 헤더인지 확인 (더 정확하게 하려면 event.target 검사)
  // 예: if (!(event.target as HTMLElement).closest('.popup-header')) return;

  isDragging.value = true
  startX.value = event.clientX
  startY.value = event.clientY

  // 현재 transform 값을 초기값으로 저장
  initialTranslateX.value = currentTranslateX.value
  initialTranslateY.value = currentTranslateY.value

  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag, { once: true }) // once: true 옵션 추가 고려
}

const doDrag = (event: MouseEvent) => { // 타입 명시: MouseEvent
  if (!isDragging.value) return

  const dx = event.clientX - startX.value
  const dy = event.clientY - startY.value

  currentTranslateX.value = initialTranslateX.value + dx
  currentTranslateY.value = initialTranslateY.value + dy
}

const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  // mousemove 리스너는 여기서 제거
  document.removeEventListener('mousemove', doDrag)
  // mouseup 리스너는 {once: true} 옵션으로 자동 제거되거나 여기서 명시적 제거
  // document.removeEventListener('mouseup', stopDrag);
}

// --- Lifecycle and Watchers ---
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // 팝업이 표시될 때 위치 초기화 (필요하다면)
    // currentTranslateX.value = 0 // 필요 시 초기화
    // currentTranslateY.value = 0
    // initialTranslateX.value = 0
    // initialTranslateY.value = 0
    currentPage.value = 1 // 페이지는 1로 초기화
  } else {
    // 팝업이 닫힐 때 드래그 상태 강제 종료 및 리스너 제거
    if (isDragging.value) {
      stopDrag() // 확실하게 드래그 종료 및 리스너 제거
    }
  }
})

watch(() => props.tableData, () => {
  // 테이블 데이터가 변경되면 첫 페이지로 리셋
  currentPage.value = 1
}, { deep: true }) // deep watch 유지

// --- Methods ---
const closePopup = () => emit('update:visible', false)

// 외부 클릭 관련 로직 제거

const emitFilter = (columnKey: string) => { // 타입 명시
  if (isDragging.value) return // 드래그 중에는 필터 이벤트 방지
  emit('filter', columnKey)
}

const emitAction = (rowData: TableRow) => { // 타입 명시
  if (isDragging.value) return // 드래그 중에는 액션 이벤트 방지
  emit('action', rowData)
}

// --- Pagination Methods ---
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

const goToPage = (pageNumber: number | string) => { // string ('...') 처리
  if (typeof pageNumber === 'number' && pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber
  }
}

// 스토어의 함수를 직접 사용 (이전 답변의 함수 시그니처에 맞게 호출)
const getLevelDetails = (score: number | undefined): LevelDetails | null => {
  if (typeof score !== 'number') return null; // 점수가 없거나 숫자가 아니면 null 반환
  // settingsStore의 getLevelDetailsByScore는 score만 인자로 받는다고 가정
  return settingsStore.getLevelDetailsByScore(score);
}


// --- Cleanup ---
onBeforeUnmount(() => {
  // 컴포넌트 제거 시 확실하게 이벤트 리스너 제거
  if (isDragging.value) {
    stopDrag();
  }
  // 추가적으로 document에 등록했을 수 있는 다른 리스너도 여기서 제거
})
</script>

<template>
  <div v-show="visible" ref="popupContainerRef"
    class="fixed z-50 bg-white rounded-lg shadow-lg w-4/5 max-w-[700px] min-h-[300px] max-h-[70vh] flex flex-col overflow-hidden"
    :style="[popupStyle, { top: props.initialPosition.top, left: props.initialPosition.left, right: props.initialPosition.right, bottom: props.initialPosition.bottom }]"
    :class="{ 'select-none': isDragging, 'shadow-xl': isDragging }">
    <div class="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-100/5 select-none"
      :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }" @mousedown.prevent="startDrag">
      <div class="flex items-center gap-2">
        <RIcon name="GripVertical" :size="15" />
        <span class="text-xs font-medium text-gray-600">{{ titleData.level }}:</span>
        <span v-if="typeof titleData.status === 'number'">
          <p class="text-xs font-semibold px-2 py-0.5 rounded-full text-center"
            :style="{ backgroundColor: getLevelDetails(titleData.status)?.color ?? '#ccc', color: getLevelDetails(titleData.status)?.textColor ?? '#000' }">
            {{ getLevelDetails(titleData.status)?.label ?? 'N/A' }}
          </p>
        </span>
        <span class="text-xs font-medium text-gray-600">{{ titleData.coverage }}</span>
      </div>
      <button type="button"
        class="p-1 rounded-full cursor-pointer text-gray-500 hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
        @click="closePopup" aria-label="Close popup">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="overflow-y-auto flex-grow">
      <table class="w-full border-collapse">
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th v-for="header, index in tableHeaders" :key="`header-${index}`"
              class="p-3 text-center border-b border-gray-200 text-sm font-semibold whitespace-nowrap"
              :class="{ 'text-center': index === tableHeaders.length - 1 }">
              {{ header.text }}
              <button v-if="header.filterable" type="button"
                class="bg-transparent border-none p-0 ml-1 align-middle cursor-pointer text-gray-500 hover:text-gray-800 focus:outline-none"
                @click="emitFilter(header.key)" aria-label="Filter column">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="tableHeaders.length" class="text-center text-gray-500 p-5">데이터가 없습니다.</td>
          </tr>
          <tr v-for="(row, rowIndex) in paginatedData" :key="`row-${rowIndex}`" class="hover:bg-gray-200">
            <td v-for="(header, colIndex) in tableHeaders" :key="`cell-${rowIndex}-${colIndex}`"
              class="p-3 border-b border-gray-200 text-sm align-middle"
              :class="{ 'text-center': colIndex === tableHeaders.length - 1 }">
              <template v-if="header.key === 'score' && typeof row[header.key] === 'number'">
                <div class="inline-block font-medium text-center w-full"
                  :style="{ color: getLevelDetails(row[header.key])?.color ?? 'inherit' }">
                  {{ row[header.key] }}
                </div>
              </template>
              <template v-else-if="header.key === 'action'">
                <button type="button"
                  class="bg-transparent border-none text-blue-600 hover:text-blue-800 cursor-pointer p-0 underline text-sm focus:outline-none focus:bg-blue-400 focus:ring-blue-400 rounded"
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
        class="text-xs px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
        :disabled="currentPage === 1" @click="prevPage" aria-label="Previous page">
        이전
      </button>

      <template v-for="(page, index) in displayedPageNumbers" :key="`page-${index}`">
        <button v-if="typeof page === 'number'" type="button"
          class="text-xs px-3 py-1 rounded hover:bg-blue-700 hover:text-white disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
          :class="{ 'bg-blue-500 text-white hover:bg-blue-700 cursor-default': page === currentPage, 'bg-white': page !== currentPage }"
          :disabled="page === currentPage" @click="goToPage(page)" :aria-label="`Go to page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined">
          {{ page }}
        </button>
        <span v-else class="px-2 py-1 text-gray-500" aria-hidden="true">
          {{ page }} </span>
      </template>

      <button type="button"
        class="text-xs px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
        :disabled="currentPage === totalPages" @click="nextPage" aria-label="Next page">
        다음
      </button>
    </div>
  </div>
</template>
