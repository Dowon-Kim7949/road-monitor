<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RColumnIcon from './RColumnIcon.vue'
import RIcon from '@/components/common/atom/RIcon.vue'

const { t } = useI18n()
// 데이터 타입 정의
interface RoadCoverageData {
  id: number;
  roadname: string;
  nodelink: string;
  rpci_grade: string;
  rpci_score: number;
  hazard_type: string;
  captured_at: string;
  analysis_at: string;
}

// 초기 데이터 (API 호출 등으로 받아올 수 있습니다.)
const data = ref<RoadCoverageData[]>([
  { id: 1, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 2, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 3, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' },
  { id: 4, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 5, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 6, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' },
  { id: 7, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 8, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 9, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' },
  { id: 10, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 11, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 12, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' },
  { id: 13, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 14, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 15, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' },
  { id: 16, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 17, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 18, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' },
  { id: 19, roadname: '동판교로', nodelink: '남양고가교 → 송현1교', rpci_grade: 'Satisfactory', rpci_score: 80, hazard_type: '균열', captured_at: '2024-11-19', analysis_at: '2024-11-30' },
  { id: 20, roadname: '동판교로', nodelink: '송현1교 → 남양고가교', rpci_grade: 'Satisfactory', rpci_score: 85, hazard_type: '포트홀', captured_at: '2024-11-20', analysis_at: '2024-12-01' },
  { id: 21, roadname: '서판교로', nodelink: '운중교 → 판교IC', rpci_grade: 'Good', rpci_score: 92, hazard_type: '소성변형', captured_at: '2024-11-15', analysis_at: '2024-11-25' }
]);

const sortColumn = ref<keyof RoadCoverageData>('analysis_at');
const sortDirection = ref<'asc' | 'desc'>('asc');
const currentPage = ref(0);
const pageSize = ref(10);

const sortedData = computed(() => {
  if (!sortColumn.value) {
    return data.value;
  }

  return [...data.value].sort((a, b) => {
    const columnA = a[sortColumn.value];
    const columnB = b[sortColumn.value];

    let comparison = 0;
    if (typeof columnA === 'string' && typeof columnB === 'string') {
      comparison = columnA.localeCompare(columnB);
    } else if (typeof columnA === 'number' && typeof columnB === 'number') {
      comparison = columnA - columnB;
    }

    return sortDirection.value === 'asc' ? comparison : comparison * -1;
  });
});

const displayedData = computed(() => {
  const start = currentPage.value * pageSize.value;
  const end = start + pageSize.value;
  return sortedData.value.slice(start, end);
});

const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));

const sortTable = (column: keyof RoadCoverageData) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc'; // 새로운 컬럼 선택 시 오름차순으로 초기화
  }
  currentPage.value = 0; // 정렬 후 첫 페이지로 이동
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < pageCount.value - 1) {
    currentPage.value++;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year} -${month} -${day}`;
};
</script>

<template>
  <div class="flex flex-col bg-white rounded overflow-hidden">
    <div class="flex flex-1 max-h-[53vh]">
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
            <th scope="col"
              class="px-6 py-3 text-center text-sm font-bold text-black uppercase tracking-wider cursor-pointer"
              @click="sortTable('rpci_grade')">
              <div class="flex gap-2 items-center justify-center">
                <div>rPCI {{ t('button.grade') }}</div>
                <RColumnIcon :column="'rpci_grade'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
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
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-gray-900">{{ item.roadname }}</td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">{{ item.nodelink }}</td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">{{ item.rpci_grade }}</td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">{{ item.rpci_score }}</td>
            <td class="px-3 py-3 text-center text-sm text-black underline cursor-pointer">{{ t('button.detail') }}</td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">{{ formatDate(item.captured_at) }}
            </td>
            <td class="px-3 py-3 text-center whitespace-nowrap text-sm text-black">{{ formatDate(item.analysis_at) }}
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
      <div class="text-sm text-black">
        {{ currentPage * pageSize + 1 }} - {{ Math.min((currentPage + 1) * pageSize, data.length) }} / {{ data.length }}
        건
      </div>
      <div class="space-x-2">
        <button @click="prevPage" :disabled="currentPage === 0"
          class="text-sm px-3 py-1 border rounded text-black hover:bg-gray-100 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          {{ t('button.prev') }}
        </button>
        <button @click="nextPage" :disabled="currentPage >= pageCount - 1"
          class="text-sm px-3 py-1 border rounded text-black hover:bg-gray-100 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          {{ t('button.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: poin 1 ter;
}
</style>
