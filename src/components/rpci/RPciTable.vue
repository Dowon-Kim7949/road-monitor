<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import RColumnIcon from '../common/atom/RColumnIcon.vue'
import RIcon from '@/components/common/atom/RIcon.vue'
import { stopPropagation } from 'ol/events/Event'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 데이터 타입 정의
interface RoadCoverageData {
  id: number
  roadname: string
  nodelink: string
  rpci_score: number
  hazard_type: string
  captured_at: string
  analysis_at: string
  counts: Record<string, number>
}

// 팝업 열려있는 행 id
const openId = ref<number | null>(null)

// 파손 유형 리스트 및 레이블
const damageTypes = ['Pothole', 'Alligator', 'LongTrans', 'Patch', 'Debris']
const typeLabels: Record<string, string> = {
  Pothole: 'Pothole',
  Alligator: 'Alligator Crack',
  LongTrans: 'Long/Trans Crack',
  Patch: 'Patch',
  Debris: 'Debris',
}

const cellRefs = ref<Record<number, HTMLElement>>({})
const placement = ref<'below' | 'above'>('below')
const cellRect = ref<DOMRect | null>(null)

const toggleDetail = (id: number, e: MouseEvent) => {
  e.stopPropagation()
  openId.value = openId.value === id ? null : id

  nextTick(() => {
    const el = (e.currentTarget as HTMLElement)
    const rect = el.getBoundingClientRect()
    cellRect.value = rect

    // 화면 아래 공간 체크
    const spaceBelow = window.innerHeight - rect.bottom
    const popupHeight = 150  // 대략; 실제 렌더 후 보정도 가능
    placement.value = spaceBelow > popupHeight + 8 ? 'below' : 'above'
  })
}

// 팝업 외부 클릭 감지
const onClickOutside = (e: MouseEvent) => {
  openId.value = null
}

const cellRefsObject = (el: any, id: any) => {
  if (el) cellRefs.value[id] = el
}

// 초기 데이터 (API 호출 등으로 받아올 수 있습니다.)
const data = ref<RoadCoverageData[]>([
  {
    id: 1,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 2,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 3,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 4,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 5,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 6,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 7,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 8,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 9,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 10,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 11,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 12,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 13,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 14,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 15,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 16,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 17,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 18,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 19,
    roadname: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodelink: '남양고가교 → 송현1교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 20,
    roadname: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodelink: '송현1교 → 남양고가교',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 21,
    roadname: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodelink: '운중교 → 판교IC',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
])

const sortColumn = ref<keyof RoadCoverageData>('analysis_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(0)
const pageSize = ref(10)

const sortedData = computed(() => {
  if (!sortColumn.value) {
    return data.value
  }

  return [...data.value].sort((a, b) => {
    const columnA = a[sortColumn.value]
    const columnB = b[sortColumn.value]

    let comparison = 0
    if (typeof columnA === 'string' && typeof columnB === 'string') {
      comparison = columnA.localeCompare(columnB)
    } else if (typeof columnA === 'number' && typeof columnB === 'number') {
      comparison = columnA - columnB
    }

    return sortDirection.value === 'asc' ? comparison : comparison * -1
  })
})

const displayedData = computed(() => {
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value))

const displayedPageNumbers = computed(() => {
  const total = pageCount.value
  const current = currentPage.value
  const maxVisibleButtons = 5
  const delta = Math.floor(maxVisibleButtons / 2)

  if (total <= 1) return []
  const pages = []
  pages.push(1)
  let rangeStart = Math.max(2, current - delta)
  let rangeEnd = Math.min(total - 1, current + delta)

  if (current - delta <= 2) {
    // If current page is close to the start
    rangeEnd = Math.min(total - 1, maxVisibleButtons)
  }
  if (current + delta >= total - 1) {
    // If current page is close to the end
    rangeStart = Math.max(2, total - maxVisibleButtons)
  }
  if (rangeStart > 2) {
    pages.push('...')
  }
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }
  if (rangeEnd < total - 1) {
    pages.push('...')
  }
  if (total > 1) {
    if (!pages.includes(total)) {
      pages.push(total)
    }
  }
  return pages
})

const goToPage = (pageNumber: number) => {
  // Check if the input is actually a number (to ignore clicks on '...')
  if (typeof pageNumber === 'number' && pageNumber !== currentPage.value + 1) {
    currentPage.value = pageNumber - 1
  }
}

const sortTable = (column: keyof RoadCoverageData) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc' // 새로운 컬럼 선택 시 오름차순으로 초기화
  }
  currentPage.value = 0 // 정렬 후 첫 페이지로 이동
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < pageCount.value - 1) {
    currentPage.value++
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year} -${month} -${day}`
}

const getLevelDetailsByScore = (score: number) => {
  return settingsStore.getLevelDetailsByScore(score, settingsStore.getLegendLevels)
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="flex flex-col bg-white rounded overflow-hidden">
    <div class="flex flex-1 max-h-[65vh] overflow-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th scope="col"
              class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider cursor-pointer"
              @click="sortTable('roadname')">
              <div class="flex gap-2 items-center justify-center">
                <div>{{ t('Roadname') }}</div>
                <RColumnIcon :column="'roadname'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
              </div>
            </th>
            <th scope="col"
              class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider cursor-pointer"
              @click="sortTable('nodelink')">
              <div class="flex gap-2 items-center justify-center">
                <div>{{ t('Roadsegment') }}</div>
                <RColumnIcon :column="'nodelink'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
              </div>
            </th>
            <th scope="col" class="px-6 py-3 text-center text-sm font-bold text-black tracking-wider">
              <div class="flex gap-2 items-center justify-center min-w-40">
                <div class="">rPCI {{ t('button.grade') }}</div>
              </div>
            </th>
            <th scope="col"
              class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider cursor-pointer"
              @click="sortTable('rpci_score')">
              <div class="flex gap-2 items-center justify-center">
                <div>{{ t('score') }}</div>
                <RColumnIcon :column="'rpci_score'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
              </div>
            </th>
            <th scope="col" class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider">
              {{ t('Hazard_type') }}
            </th>
            <th scope="col"
              class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider cursor-pointer"
              @click="sortTable('captured_at')">
              <div class="flex gap-2 items-center justify-center">
                <div>{{ t('Capture_at') }}</div>
                <RColumnIcon :column="'captured_at'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
              </div>
            </th>
            <th scope="col"
              class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider cursor-pointer"
              @click="sortTable('analysis_at')">
              <div class="flex gap-2 items-center justify-center">
                <div>{{ t('Analysis_at') }}</div>
                <RColumnIcon :column="'analysis_at'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
              </div>
            </th>
            <th scope="col" class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider">
              {{ t('button.map') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in displayedData" :key="item.id">
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-gray-900">
              {{ item.roadname }}
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">
              {{ item.nodelink }}
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">
              <div class="w-full flex items-center justify-center">
                <p class="text-sm font-semibold px-3 py-1 rounded-full text-center w-35" :style="{
                  backgroundColor: getLevelDetailsByScore(item.rpci_score)?.color,
                  color: getLevelDetailsByScore(item.rpci_score)?.textColor,
                }">
                  {{ getLevelDetailsByScore(item.rpci_score)?.label }}
                </p>
              </div>
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm font-bold"
              :style="{ color: getLevelDetailsByScore(item.rpci_score)?.color }">
              {{ item.rpci_score }}
            </td>
            <td class="relative px-3 py-3 text-center text-sm text-black underline">
              <span class="cursor-pointer" @click.stop="toggleDetail(item.id, $event)"
                :ref="el => cellRefsObject(el, item.id)">
                {{ t('button.detail') }}
              </span>
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">
              {{ formatDate(item.captured_at) }}
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">
              {{ formatDate(item.analysis_at) }}
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm font-medium">
              <div class="flex items-center justify-center">
                <RIcon name="SquareArrowOutUpRight" class="cursor-pointer" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex px-4 py-3 bg-white justify-between items-center border-gray-20 border-t-1">
      <button @click="prevPage" :disabled="currentPage === 0"
        class="text-sm px-3 py-1 border rounded text-black hover:bg-gray-100 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        {{ t('button.prev') }}
      </button>
      <div class="flex space-x-3 items-center flex-1 justify-center">
        <template v-for="(page, index) in displayedPageNumbers" :key="`page-${index}`">
          <button v-if="typeof page === 'number'"
            class="pagination-button text-sm px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            :class="{ 'active-page': page === currentPage + 1 }" @click="goToPage(page)">
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis"> {{ page }} </span>
        </template>
      </div>

      <button @click="nextPage" :disabled="currentPage >= pageCount - 1"
        class="text-sm px-3 py-1 border rounded text-black hover:bg-gray-100 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        {{ t('button.next') }}
      </button>
    </div>
  </div>
  <teleport to="body">
    <div v-if="openId !== null && cellRect" class="fixed z-50 bg-white border rounded shadow-lg w-48" :style="{
      top: placement === 'below'
        ? `${cellRect.bottom + 8}px`
        : `${cellRect.top - 110}px`,
      left: `${cellRect.left - 65}px`
    }" @click.stop>
      <div class="p-2 text-sm">
        <p class="font-semibold mb-1 text-center">{{ t('menu.damageTypeCounts') }}</p>
        <table class="w-full text-left text-xs">
          <tr v-for="type in damageTypes" :key="type">
            <td>{{ typeLabels[type] }}</td>
            <td class="text-right">{{displayedData.find(r => r.id === openId)!.counts[type] + openId || 0}}</td>
          </tr>
        </table>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.cursor-pointer {
  cursor: poin 1 ter;
}

.pagination-button {
  cursor: pointer;
  background-color: white;
  transition: background-color 0.2s ease;
  color: #333;
}

.active-page {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  cursor: default;
}
</style>
