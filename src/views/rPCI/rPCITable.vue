<template>
  <div class="bg-white rounded overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
            @click="sortTable('도로명')">
            <div class="flex gap-2 items-center justify-center">
              <div>도로명</div>
              <RColumnIcon :column="'도로명'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
            </div>
          </th>
          <th scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
            @click="sortTable('노드링크명')">
            <div class="flex gap-2 items-center justify-center">
              <div>노드링크명</div>
              <RColumnIcon :column="'노드링크명'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
            </div>
          </th>
          <th scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
            @click="sortTable('rPCI등급')">
            <div class="flex gap-2 items-center justify-center">
              <div>rPCI 등급</div>
              <RColumnIcon :column="'rPCI등급'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
            </div>
          </th>
          <th scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
            @click="sortTable('점수')">
            <div class="flex gap-2 items-center justify-center">
              <div>점수</div>
              <RColumnIcon :column="'점수'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
            </div>
          </th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
            파손유형
          </th>
          <th scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
            @click="sortTable('촬영일자')">
            <div class="flex gap-2 items-center justify-center">
              <div>촬영일자</div>
              <RColumnIcon :column="'촬영일자'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
            </div>
          </th>
          <th scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
            @click="sortTable('분석일자')">
            <div class="flex gap-2 items-center justify-center">
              <div>분석일자</div>
              <RColumnIcon :column="'분석일자'" :sortColumn="sortColumn" :sortDirection="sortDirection" />
            </div>
          </th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
            지도 보기
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="item in displayedData" :key="item.id">
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm text-gray-900">{{ item.도로명 }}</td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm text-black">{{ item.노드링크명 }}</td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm text-black">{{ item.rPCI등급 }}</td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm text-black">{{ item.점수 }}</td>
          <td class="px-3 py-2 text-center text-sm text-black underline cursor-pointer">상세보기</td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm text-black">{{ formatDate(item.촬영일자) }}</td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm text-black">{{ formatDate(item.분석일자) }}</td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-sm font-medium">
            <button class="text-blue-500 hover:text-blue-700 focus:outline-none cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.95l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="px-4 py-3 bg-gray-50 flex justify-between items-center">
      <div class="text-sm text-gray-700">
        {{ currentPage * pageSize + 1 }} - {{ Math.min((currentPage + 1) * pageSize, data.length) }} / {{ data.length }}
        건
      </div>
      <div class="space-x-2">
        <button :disabled="currentPage === 0"
          class="bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @click="prevPage">
          이전
        </button>
        <button :disabled="currentPage >= pageCount - 1"
          class="bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @click="nextPage">
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import RColumnIcon from './RColumnIcon.vue';

// 데이터 타입 정의
interface RoadCoverageData {
  id: number;
  도로명: string;
  노드링크명: string;
  rPCI등급: string;
  점수: number;
  파손유형: string;
  촬영일자: string;
  분석일자: string;
}

// 초기 데이터 (API 호출 등으로 받아올 수 있습니다.)
const data = ref<RoadCoverageData[]>([
  { id: 1, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 2, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 3, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' },
  { id: 4, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 5, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 6, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' },
  { id: 7, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 8, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 9, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' },
  { id: 10, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 11, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 12, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' },
  { id: 13, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 14, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 15, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' },
  { id: 16, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 17, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 18, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' },
  { id: 19, 도로명: '동판교로', 노드링크명: '남양고가교 → 송현1교', rPCI등급: 'Satisfactory', 점수: 80, 파손유형: '균열', 촬영일자: '2024-11-19', 분석일자: '2024-11-30' },
  { id: 20, 도로명: '동판교로', 노드링크명: '송현1교 → 남양고가교', rPCI등급: 'Satisfactory', 점수: 85, 파손유형: '포트홀', 촬영일자: '2024-11-20', 분석일자: '2024-12-01' },
  { id: 21, 도로명: '서판교로', 노드링크명: '운중교 → 판교IC', rPCI등급: 'Good', 점수: 92, 파손유형: '소성변형', 촬영일자: '2024-11-15', 분석일자: '2024-11-25' }
]);

const sortColumn = ref<keyof RoadCoverageData>('id');
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
  if (currentPage.value > pageCount.value - 1) {
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

<style scoped>
.cursor-pointer {
  cursor: poin 1 ter;
}
</style>
