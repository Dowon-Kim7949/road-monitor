<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RLeftDrawer from '@/components/common/RLeftDrawer.vue'
import RSelect from '@/components/common/atom/RSelect.vue'
import RButton from '@/components/common/atom/RButton.vue'
import RPciTable from '@/components/rpci/RPciTable.vue'

const { t } = useI18n()
const leftDrawer = ref(true)
const selectModel = ref('')
const selectOptions = ref([
  { value: '2025년_1차', label: '2025년 1차 분석', analyze_at: '2025-01-01 ~ 2025-04-23' },
  { value: '2024년_6차', label: '2024년 6차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_5차', label: '2024년 5차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_4차', label: '2024년 4차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_3차', label: '2024년 3차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_2차', label: '2024년 2차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2024년_1차', label: '2024년 1차 분석', analyze_at: '2024-01-01 ~ 2024-04-23' },
  { value: '2023년_4차', label: '2023년 4차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2023년_3차', label: '2023년 3차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2023년_2차', label: '2023년 2차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2023년_1차', label: '2023년 1차 분석', analyze_at: '2023-01-01 ~ 2023-04-23' },
  { value: '2022년_1차', label: '2022년 1차 분석', analyze_at: '2022-01-01 ~ 2022-04-23' },
])
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 좌측 사이드바 -->
    <RLeftDrawer v-model="leftDrawer" mode="fix" />
    <div class="w-[calc(100vw - 240px)] h-full ml-60 p-20">
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-row gap-5 items-center">
          <span class="text-xl font-bold">Rapid-PCI</span>
          <span class="text-xl">{{ t('menu.rpcianalysis') }}</span>
          <div class="min-w-88">
            <RSelect v-model="selectModel" :options="selectOptions" placeholder="회차 선택" id="round-select" />
          </div>
        </div>
        <div>
          <RButton type="secondary" icon="download" label="Excel" size="small" />
        </div>
      </div>
      <div class="pt-4 h-full">
        <RPciTable />
      </div>
    </div>
  </div>
</template>
