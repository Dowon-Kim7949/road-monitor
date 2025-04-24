<script setup lang="ts">
import { ref, watch } from 'vue';
import RPieChart from '@/components/common/atom/RPieChart.vue'
import RPciScoreDetailPopup from '@/components/rpci/RPciScoreDetailPopup.vue'

// Props로 PCI 점수를 받을 수 있도록 정의
const props = defineProps<{
  pciScore: number
}>()
const grades = [
  { grade: 90, percentage: 14, label: 'Good', range: '100~85', color: '#007e12', textColor: 'white' },
  { grade: 80, percentage: 23, label: 'Satisfactory', range: '85~70', color: '#00CC25', textColor: 'white' },
  { grade: 60, percentage: 35, label: 'Fair', range: '70~55', color: '#FEFD33', textColor: 'black' },
  { grade: 50, percentage: 15, label: 'Poor', range: '55~40', color: '#FF2B06', textColor: 'white' },
  { grade: 30, percentage: 6, label: 'Very Poor', range: '40~25', color: '#AB1803', textColor: 'white' },
  { grade: 20, percentage: 7, label: 'Serious', range: '25~10', color: '#690B02', textColor: 'white' },
  { grade: 5, percentage: 0, label: 'Failed', range: '10~0', color: '#979797', textColor: 'white' },
]
const chartData = ref([
  { percentage: 14, color: '#007e12' },
  { percentage: 23, color: '#00CC25' },
  { percentage: 35, color: '#FEFD33' },
  { percentage: 15, color: '#FF2B06' },
  { percentage: 6, color: '#AB1803' },
  { percentage: 7, color: '#690B02' },
  { percentage: 0, color: '#979797' },
])
const titleData = ref({
  level: '등급',
  status: 0,
  coverage: '커버리지 12km',
})
const tableHeaders = ref([
  { text: '도로명', key: 'roadName', sortable: true },
  { text: '노드링크', key: 'nodeLink', sortable: true },
  { text: '점수', key: 'score', sortable: true },
  { text: '파손 유형', key: 'action', sortable: false }
])
const tableData = ref([
  { score: 80, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 70, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 55, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 60, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 45, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 50, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 35, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 40, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 25, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 30, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 15, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 20, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 5, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 90, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 95, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 80, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 95, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 80, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 95, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 80, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 95, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 80, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', },
  { score: 95, action: '상세 보기', roadName: '동탄순환대로', nodeLink: '남양교차로 -> 송림리145-4 (878m)', },
  { score: 65, action: '상세 보기', roadName: '기흥로', nodeLink: '신갈IC -> 영덕동 123-4 (500m)', }
])


const visible = ref(false)

const popupOpen = (item: any) => {
  if (!visible.value) visible.value = true
  titleData.value.status = item.grade
}


watch(() => visible.value, (newValue) => {
  if (!newValue) titleData.value.status = 0
})
</script>

<template>
  <div class="fixed bottom-0 right-0 bg-white h-46 w-full shadow border-t-1 border-gray-20">
    <div class="bg-white rounded flex items-center justify-center h-full">
      <div class="flex items-center space-x-10">
        <div v-for="(grade, idx) in grades" :key="idx" @click="popupOpen(grade)"
          class="flex flex-col items-center justify-between px-4 w-40 cursor-pointer py-4 rounded-xl hover:bg-gray-20"
          :class="titleData.status === grade.grade ? 'bg-gray-20 shadow-lg' : ''">
          <div class="text-md font-semibold px-2 py-1 rounded-full text-center w-full"
            :style="{ backgroundColor: grade.color, color: grade.textColor }">
            {{ grade.label }}
          </div>
          <div class="text-md text-5xl text-gray-700 font-semibold pt-4 pl-0">
            <span>{{ grade.percentage }}</span>
            <span class="text-xl text-normal">%</span>
          </div>
        </div>
      </div>

      <div class="pl-20">
        <RPieChart :pie-data="chartData" :score="props.pciScore" />
      </div>
    </div>
  </div>
  <RPciScoreDetailPopup v-model:visible="visible" :title-data="titleData" :table-headers="tableHeaders"
    :table-data="tableData" />
</template>

<style scoped>
/* 필요하다면 추가적인 스타일링 */
</style>
