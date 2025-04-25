<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

// 1. 타입 정의
// 각 뷰(버튼)를 식별하기 위한 타입
export type ViewMode = 'road' | 'bird'

// 버튼 정보를 담는 인터페이스
interface ButtonInfo {
  id: ViewMode
  label: string
}

// 2. Props 정의
interface Props {
  // 부모로부터 초기 활성화 뷰를 받을 수 있도록 함 (선택 사항)
  initialView?: ViewMode
  // 필요하다면 다른 props 추가 가능
}

// props 기본값 설정 (initialView가 제공되지 않으면 'road'로 시작)
const props = withDefaults(defineProps<Props>(), {
  initialView: 'road',
})

// 3. Emits 정의 (부모에게 상태 변경 알림)
// 'update:selectedView' 이벤트는 어떤 뷰가 선택되었는지 ViewMode 타입의 값을 전달
const emit = defineEmits<{
  (e: 'update:selectedView', view: ViewMode): void
}>()

// 4. 버튼 데이터 정의
const buttons: ButtonInfo[] = [
  { id: 'road', label: 'rPCI 로드뷰' },
  { id: 'bird', label: 'rPCI 버드뷰' },
]

// 5. 내부 상태 관리 (어떤 버튼이 현재 선택되었는지)
const selectedView: Ref<ViewMode> = ref(props.initialView)

// 6. 버튼 클릭 핸들러
function selectView(viewId: ViewMode): void {
  // 현재 선택된 뷰와 다른 버튼을 클릭했을 때만 상태 변경 및 이벤트 발생
  if (selectedView.value !== viewId) {
    selectedView.value = viewId // 내부 상태 업데이트
    emit('update:selectedView', viewId) // 부모 컴포넌트에 변경 알림
  }
}

// 7. (선택 사항) Prop 변경 감지
// 부모 컴포넌트에서 initialView prop을 동적으로 변경할 경우, 내부 상태도 업데이트
watch(
  () => props.initialView,
  (newInitialView) => {
    // props.initialView가 null/undefined가 아니고, 현재 선택된 뷰와 다를 경우 업데이트
    if (newInitialView && selectedView.value !== newInitialView) {
      selectedView.value = newInitialView
      // 여기서 emit을 다시 할지는 요구사항에 따라 결정 (보통 prop 변경 시에는 emit 안 함)
    }
  },
)
</script>

<template>
  <div class="inline-flex rounded-full p-0.5 bg-gray-100 space-x-0 border-1 border-gray-200">
    <button v-for="button in buttons" :key="button.id" @click="selectView(button.id)" :class="[
      'px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none cursor-pointer last:rounded-tl-sm last:rounded-bl-sm first:rounded-tr-sm first:rounded-br-sm',
      selectedView === button.id
        ? 'bg-gray-800 text-white shadow-md focus:ring-gray-500' // Active state styles
        : 'text-gray-500 hover:bg-gray-200 focus:ring-gray-400', // Inactive state styles
    ]">
      {{ button.label }}
    </button>
  </div>
</template>

<style scoped>
/* Tailwind CSS로 대부분 스타일링하므로 추가 스타일은 거의 필요 없을 수 있습니다. */
/* 필요하다면 여기에 추가 */
</style>
