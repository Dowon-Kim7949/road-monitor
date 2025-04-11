<template>
  <div v-if="visible" class="fixed inset-0 z-[9999] bg-gray-100/50 flex items-center justify-center">
    <div class="bg-white w-[410px] rounded shadow-lg px-4 pt-2 pb-4 relative">
      <!-- 닫기 버튼 -->
      <div class="flex pb-2 justify-between w-full">
        <div class="relative w-[90%] pt-[15px]">
          <div class="mb-4 flex h-2 overflow-hidden rounded bg-gray-30 text-xs">
            <div :style="{ 'width': `${step * 33.3}%` }" class="bg-gray-80 transition-all duration-500 ease-out"></div>
          </div>
        </div>
        <button class="text-gray-500 cursor-pointer" @click="close">
          <RIcon name="X" />
        </button>
      </div>

      <!-- Step 1: 진행 확인 -->
      <div v-if="step === 1">
        <p class="text-lg font-bold mb-4 text-pretty">현재 화면에서 조회 중인 기간에 대해<br /> rPCI분석을 진행합니다. 계속하시겠습니까?</p>
        <p class="text-sm text-gray-600 mb-4">분석 기간을 변경하려면 [취소]를 눌러 이전 화면으로 돌아가<br /> 지도 조회 기간을 수정해 주세요.</p>
        <div class="flex justify-end space-x-2">
          <RButton type="tertiary" size="small" :label="t('button.cancel')" @click="close" />
          <RButton type="tertiary" size="small" :label="t('button.next')" @click="step++" />
        </div>
      </div>

      <!-- Step 2: 회차명 입력 -->
      <div v-if="step === 2">
        <p class="text-lg font-semibold mb-4">새롭게 생성될 회차의 이름을 입력해주세요.</p>
        <input v-model="batchName" type="text"
          class="w-full border rounded px-3 py-2 mb-6 text-sm focus:ring focus:outline-none" />
        <div class="flex justify-end space-x-2">
          <RButton type="tertiary" size="small" :label="t('button.prev')" @click="step--" />
          <RButton type="tertiary" size="small" :label="t('button.next')" @click="submit" />
        </div>
      </div>

      <!-- Step 3: 도로 선택 -->
      <!-- <div v-if="step === 3">
        <p class="text-lg font-semibold mb-2">rPCI를 분석할 도로를 선택해주세요.</p>
        <p class="text-sm text-gray-500 mb-2">{{ batchName }}</p>

        <div class="max-h-[300px] overflow-auto border rounded mb-4">
          <table class="w-full text-sm">
            <thead class="bg-gray-20 text-center">
              <tr>
                <th class="p-2">도로명/노드링크명</th>
                <th class="p-2">촬영 일시</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(road, idx) in roads" :key="idx">
                <tr>
                  <td class="p-2 border-t">
                    <input type="checkbox" v-model="road.checked" class="mr-2" />
                    {{ road.name }}
                  </td>
                  <td class="p-2 border-t text-center">YYYY-MM-DD</td>
                </tr>
              </template>
</tbody>
</table>
</div>

<div class="flex justify-end space-x-2">
  <RButton type="tertiary" size="small" label="이전" @click="step--" />
  <RButton type="tertiary" size="small" label="확인" @click="submit" />
</div>
</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RButton from '@/components/common/atom/RButton.vue'
import RIcon from '@/components/common/atom/RIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { name: string; }): void
}>()

const step = ref(1)
const batchName = ref('2025년 1차 분석')

const close = () => {
  emit('close')
  step.value = 1
  batchName.value = '2025년 1차 분석'
}

const submit = () => {
  emit('submit', { name: batchName.value })
  close()
}
</script>

<style scoped>
.text-pretty {
  text-wrap-style: balance !important;
}
</style>
