<script setup lang="ts">
import { ref, watch } from 'vue'
import RPieChart from '@/components/common/atom/RPieChart.vue'
import RPciScoreDetailPopup from '@/components/rpci/RPciScoreDetailPopup.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'selectGrade', item: any): void
}>()

// Props로 PCI 점수를 받을 수 있도록 정의
const props = defineProps<{
  pciScore: number
}>()
const grades = [
  {
    grade: 90,
    percentage: 14,
    label: 'Good',
    range: '100~85',
    color: '#007e12',
    textColor: 'white',
  },
  {
    grade: 80,
    percentage: 23,
    label: 'Satisfactory',
    range: '85~70',
    color: '#00CC25',
    textColor: 'white',
  },
  {
    grade: 60,
    percentage: 35,
    label: 'Fair',
    range: '70~55',
    color: '#FEFD33',
    textColor: 'black',
  },
  {
    grade: 50,
    percentage: 15,
    label: 'Poor',
    range: '55~40',
    color: '#FF2B06',
    textColor: 'white',
  },
  {
    grade: 30,
    percentage: 6,
    label: 'Very Poor',
    range: '40~25',
    color: '#AB1803',
    textColor: 'white',
  },
  {
    grade: 20,
    percentage: 7,
    label: 'Serious',
    range: '25~10',
    color: '#690B02',
    textColor: 'white',
  },
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
  level: 'Grade',
  status: 0,
  coverage: 'Coverage',
})
const tableHeaders = ref([
  { text: 'Roadname', key: 'roadName', sortable: true },
  { text: 'Nodelink', key: 'nodeLink', sortable: true },
  { text: 'score', key: 'rpci_score', sortable: true },
  { text: 'DamageType', key: 'action', sortable: false },
])
const tableData = ref([
  {
    id: 1,
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail', counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 8,
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail', counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 11,
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail', counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 14,
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail', counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 17,
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
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
    roadName: '동판교로',
    rpci_score: 80,
    captured_at: '2024-11-19',
    analysis_at: '2024-11-30',
    hazard_type: '균열',
    nodeLink: '남양고가교 → 송현1교',
    action: 'button.detail', counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
  {
    id: 20,
    roadName: '동판교로',
    rpci_score: 85,
    captured_at: '2024-11-20',
    analysis_at: '2024-12-01',
    hazard_type: '포트홀',
    nodeLink: '송현1교 → 남양고가교',
    action: 'button.detail',
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
    roadName: '서판교로',
    rpci_score: 92,
    captured_at: '2024-11-15',
    analysis_at: '2024-11-25',
    hazard_type: '소성변형',
    nodeLink: '운중교 → 판교IC',
    action: 'button.detail',
    counts: {
      Pothole: 5,
      Alligator: 2,
      LongTrans: 3,
      Patch: 1,
      Debris: 0,
    },
  },
])

const visible = ref(false)

const popupOpen = (item: any) => {
  if (!visible.value) visible.value = true
  titleData.value.status = item.grade
  emit('selectGrade', item.grade)
}

watch(
  () => visible.value,
  (newValue) => {
    if (!newValue) titleData.value.status = 0
  },
)
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
