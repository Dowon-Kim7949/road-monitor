<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n';
import RButton from './atom/RButton.vue';

const { t } = useI18n()
const props = defineProps<{
  items: { start: string; end: string; date: string }[]
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const itemsPerPage = 11
const currentPage = ref(1)
const modelValue = ref(true)

const totalPages = computed(() =>
  Math.ceil(props.items.length / itemsPerPage)
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return props.items.slice(start, start + itemsPerPage)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>


<template>
  <!-- 펼쳐진 상태 -->
  <Transition name="slide-left">
    <div v-show="modelValue"
      class="fixed w-[300px] top-20 left-4 bg-white shadow-lg rounded-sm border-gray-40 border-1 p-4 text-sm z-[4] h-[85vh] flex flex-col">

      <!-- 접기 버튼 -->
      <div
        class="absolute top-5 right-[-29px] z-[4] p-0 border-gray-40 border-b-1 border-t-1 border-r-1 rounded-br-sm rounded-tr-sm">
        <RButton type="tertiary"
          class="bg-white py-2 px-1 border-0 rounded-bl-none rounded-tl-none rounded-br-sm rounded-tr-sm hover:bg-white"
          :icon="'chevron-left'" size="small" @click="modelValue = false" />
      </div>

      <!-- 헤더 -->
      <div class="flex items-center font-semibold border-gray-40 border-b-1 pb-2 px-3">
        <div class="flex-1 flex items-center pl-2">
          노드링크
          <span class="ml-2 text-white bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {{ props.items.length }}
          </span>
        </div>
        <div class="pr-2">촬영일자</div>
      </div>

      <!-- 리스트 -->
      <div class="flex-1 overflow-y-auto thin-scrollbar space-y-3 py-2">
        <div v-for="(item, idx) in paginatedItems" :key="idx" class="flex cursor-pointer hover:bg-gray-20 p-1 rounded">
          <div class="flex-1 pl-2">
            <div>{{ item.start }}</div>
            <div>→ {{ item.end }}</div>
          </div>
          <div class="whitespace-nowrap pt-3 pr-2">{{ item.date }}</div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pt-2 border-t border-gray-200 flex justify-between items-center">
        <button
          class="text-xs px-3 py-1 border rounded hover:bg-gray-100 hover:text-white disabled:opacity-40 cursor-pointer"
          :disabled="currentPage === 1" @click="prevPage">
          이전
        </button>
        <div class="text-xs text-gray-500">{{ currentPage }} / {{ totalPages }}</div>
        <button
          class="text-xs px-3 py-1 border rounded hover:bg-gray-100 hover:text-white disabled:opacity-40 cursor-pointer"
          :disabled="currentPage === totalPages" @click="nextPage">
          다음
        </button>
      </div>
    </div>
  </Transition>

  <!-- 접힌 상태 버튼 -->
  <Transition name="fade">
    <div v-show="!modelValue"
      class="fixed w-fit top-20 left-4 py-1 bg-white shadow-lg rounded-sm border-gray-40 border-1 text-sm z-[4] flex items-center cursor-pointer"
      @click="modelValue = true">
      <div class="flex-1 flex items-center text-md font-bold pl-4">
        {{ t('Roadsegment') }}
        <span class="ml-2 text-white bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {{ props.items.length }}
        </span>
      </div>
      <RButton type="tertiary" class="bg-white py-2 px-1 border-0 font-extrabold hover:bg-white" icon="chevron-right"
        size="small" />
    </div>
  </Transition>
</template>

<style scoped>
/* 기본 스크롤 커스터마이징 */
.thin-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.thin-scrollbar::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 9999px;
}

.thin-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #999 transparent;
}

/* 트랜지션 정의 */
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

/* 접힌 상태 페이드 (선택) */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
</style>
