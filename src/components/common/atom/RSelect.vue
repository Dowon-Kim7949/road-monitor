<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
// 1. lucide-vue-next 아이콘 임포트
import { ChevronDown } from 'lucide-vue-next';

// --- Props ---

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: Option[]
  label?: string
  placeholder?: string
  id?: string
  helpText?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  label: '',
  placeholder: '선택해주세요.',
  id: () => `select-${Math.random().toString(36).substring(2, 11)}`,
  helpText: '',
  disabled: false,
})

// --- Emits ---

const emit = defineEmits(['update:modelValue'])

// --- State ---

const isOpen = ref(false)
const selectedOption = ref<Option | null>(null)
const focusedOptionIndex = ref<number>(-1)
const selectElement = ref<HTMLDivElement | null>(null)
const buttonElement = ref<HTMLButtonElement | null>(null)
const optionsListElement = ref<HTMLUListElement | null>(null)

// --- Computed ---

const buttonText = computed(() => {
  return selectedOption.value?.label ?? props.placeholder
})

const labelId = computed(() => `${props.id}-label`)
const helpTextId = computed(() => props.helpText ? `${props.id}-help` : undefined)

// 현재 활성화된 (비활성화되지 않은) 옵션 목록
const enabledOptions = computed(() => props.options.filter(opt => !opt.disabled));

// 현재 선택된 옵션의 인덱스 (전체 옵션 리스트 기준)
const currentSelectedIndex = computed(() => {
  return props.options.findIndex(opt => opt.value === props.modelValue);
});

// --- Watchers ---

watch(() => props.modelValue, (newValue) => {
  selectedOption.value = props.options.find(option => option.value === newValue) || null
}, { immediate: true })

watch(isOpen, (newValue) => {
  if (newValue) {
    // 드롭다운 열릴 때: 현재 선택된 옵션 또는 첫번째 활성 옵션으로 포커스 인덱스 초기화
    focusedOptionIndex.value = currentSelectedIndex.value !== -1
      ? currentSelectedIndex.value
      : props.options.findIndex(opt => !opt.disabled); // 첫번째 활성 옵션 인덱스

    // focusedOptionIndex가 유효하지 않으면(모든 옵션 비활성 등) -1로 설정
    if (focusedOptionIndex.value >= props.options.length || focusedOptionIndex.value < 0) {
      focusedOptionIndex.value = -1;
    }

    setTimeout(scrollOptionIntoView, 0)
  } else {
    focusedOptionIndex.value = -1
  }
})

// --- Methods ---

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// 옵션 선택 로직 분리 (직접 선택 및 키보드 선택 시 사용)
const updateSelection = (option: Option | null) => {
  if (!option || option.disabled) return; // null이거나 비활성화된 옵션 처리 안함

  selectedOption.value = option;
  emit('update:modelValue', option.value);

  // 키보드로 닫힌 상태에서 변경 시 드롭다운 열지 않음
  // isOpen.value = false // <- 이 줄 제거 또는 조건부 실행 필요 시 추가
  // buttonElement.value?.focus() // <- 포커스 관리 정책에 따라 조절
}


// 옵션 클릭 시 선택
const clickOption = (option: Option) => {
  if (option.disabled) return;
  updateSelection(option);
  isOpen.value = false; // 클릭 시에는 무조건 닫기
  buttonElement.value?.focus();
}

// 다음 활성 옵션 인덱스 찾기 (순환 포함)
const findNextEnabledIndex = (startIndex: number): number => {
  if (enabledOptions.value.length === 0) return -1; // 활성 옵션 없으면 -1

  // 현재 옵션이 enabledOptions에서 몇 번째인지 찾기
  const currentEnabledIndex = enabledOptions.value.findIndex(opt => opt.value === props.options[startIndex]?.value);

  let nextEnabledIndex: number;
  if (currentEnabledIndex === -1) { // 현재 선택된 것이 없거나 비활성 상태면 첫번째 활성 옵션 선택
    nextEnabledIndex = 0;
  } else {
    nextEnabledIndex = (currentEnabledIndex + 1) % enabledOptions.value.length; // 다음 인덱스 (순환)
  }


  // 전체 옵션 리스트에서 해당 값의 인덱스를 찾아 반환
  const nextOptionValue = enabledOptions.value[nextEnabledIndex].value;
  return props.options.findIndex(opt => opt.value === nextOptionValue);
}

// 이전 활성 옵션 인덱스 찾기 (순환 포함)
const findPreviousEnabledIndex = (startIndex: number): number => {
  if (enabledOptions.value.length === 0) return -1;

  const currentEnabledIndex = enabledOptions.value.findIndex(opt => opt.value === props.options[startIndex]?.value);

  let previousEnabledIndex: number;
  if (currentEnabledIndex === -1) { // 현재 선택된 것이 없거나 비활성 상태면 마지막 활성 옵션 선택
    previousEnabledIndex = enabledOptions.value.length - 1;
  } else {
    previousEnabledIndex = (currentEnabledIndex - 1 + enabledOptions.value.length) % enabledOptions.value.length; // 이전 인덱스 (순환)
  }


  const previousOptionValue = enabledOptions.value[previousEnabledIndex].value;
  return props.options.findIndex(opt => opt.value === previousOptionValue);
}


const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return

  const { key } = event;

  if (!isOpen.value) {
    // --- 드롭다운이 닫혀 있을 때 ---
    switch (key) {
      case 'Enter':
      case ' ':
      case 'ArrowUp':
      case 'ArrowLeft': // 이전 옵션 선택
        event.preventDefault();
        const prevIndex = findPreviousEnabledIndex(currentSelectedIndex.value);
        if (prevIndex !== -1) updateSelection(props.options[prevIndex]);
        break;
      case 'ArrowDown':
      case 'ArrowRight': // 다음 옵션 선택
        event.preventDefault();
        const nextIndex = findNextEnabledIndex(currentSelectedIndex.value);
        if (nextIndex !== -1) updateSelection(props.options[nextIndex]);
        break;
      // Home, End 키는 닫힌 상태에서는 첫/마지막 옵션 *선택* (선택사항)
      case 'Home':
        event.preventDefault();
        const firstEnabledIndex = props.options.findIndex(opt => !opt.disabled);
        if (firstEnabledIndex !== -1) updateSelection(props.options[firstEnabledIndex]);
        break;
      case 'End':
        event.preventDefault();
        const lastEnabledIndex = findLastEnabledOptionIndex(); // 아래 새 함수 사용
        if (lastEnabledIndex !== -1) updateSelection(props.options[lastEnabledIndex]);
        break;
    }
  } else {
    // --- 드롭다운이 열려 있을 때 (포커스 이동 위주) ---
    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedOptionIndex.value >= 0) {
          const focusedOption = props.options[focusedOptionIndex.value]
          if (focusedOption && !focusedOption.disabled) {
            // 열린 상태에서 Enter/Space는 선택 후 닫기
            updateSelection(focusedOption);
            isOpen.value = false;
            buttonElement.value?.focus();
          }
        }
        break
      case 'Escape':
        event.preventDefault()
        isOpen.value = false
        buttonElement.value?.focus()
        break
      case 'ArrowDown':
        event.preventDefault()
        focusNextOption() // 포커스 이동
        break
      case 'ArrowUp':
        event.preventDefault()
        focusPreviousOption() // 포커스 이동
        break
      case 'Home':
        event.preventDefault();
        focusFirstOption(); // 포커스 이동
        break
      case 'End':
        event.preventDefault();
        focusLastOption(); // 포커스 이동
        break
    }
  }
}

// --- 포커스 이동 함수들 (열린 상태에서 사용) ---
const focusNextOption = () => {
  let nextIndex = focusedOptionIndex.value >= 0 ? focusedOptionIndex.value + 1 : 0; // 현재 포커스가 없으면 0부터 시작
  while (nextIndex < props.options.length) {
    if (!props.options[nextIndex].disabled) {
      focusedOptionIndex.value = nextIndex;
      scrollOptionIntoView();
      return; // 찾으면 종료
    }
    nextIndex++;
  }
  // 끝까지 갔는데 못찾으면 변경 없음 (또는 첫번째로 순환시키고 싶다면 로직 추가)
}

const focusPreviousOption = () => {
  let prevIndex = focusedOptionIndex.value >= 0 ? focusedOptionIndex.value - 1 : props.options.length - 1; // 현재 포커스가 없으면 마지막부터 시작
  while (prevIndex >= 0) {
    if (!props.options[prevIndex].disabled) {
      focusedOptionIndex.value = prevIndex;
      scrollOptionIntoView();
      return; // 찾으면 종료
    }
    prevIndex--;
  }
  // 처음까지 갔는데 못찾으면 변경 없음 (또는 마지막으로 순환시키고 싶다면 로직 추가)
}

const focusFirstOption = () => {
  let firstEnabledIndex = props.options.findIndex(opt => !opt.disabled);
  if (firstEnabledIndex !== -1) {
    focusedOptionIndex.value = firstEnabledIndex;
    scrollOptionIntoView();
  }
}

// findLastIndex 대체했던 함수 재활용 (가독성을 위해 이름 변경)
const findLastEnabledOptionIndex = (): number => {
  for (let i = props.options.length - 1; i >= 0; i--) {
    if (!props.options[i].disabled) {
      return i;
    }
  }
  return -1; // 활성화된 옵션이 없을 경우
}

const focusLastOption = () => {
  let lastEnabledIndex = findLastEnabledOptionIndex();
  if (lastEnabledIndex !== -1) {
    focusedOptionIndex.value = lastEnabledIndex;
    scrollOptionIntoView();
  }
}

const scrollOptionIntoView = () => {
  if (optionsListElement.value && focusedOptionIndex.value >= 0 && focusedOptionIndex.value < props.options.length) {
    const focusedElement = optionsListElement.value.children[focusedOptionIndex.value] as HTMLLIElement
    if (focusedElement) {
      const listRect = optionsListElement.value.getBoundingClientRect();
      const optionRect = focusedElement.getBoundingClientRect();

      if (optionRect.bottom > listRect.bottom) {
        optionsListElement.value.scrollTop += optionRect.bottom - listRect.bottom;
      } else if (optionRect.top < listRect.top) {
        optionsListElement.value.scrollTop -= listRect.top - optionRect.top;
      }
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectElement.value && !selectElement.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
  <div ref="selectElement" class="relative w-full">
    <label v-if="props.label" :id="labelId" :for="props.id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ props.label }}
    </label>

    <button ref="buttonElement" :id="props.id" type="button" :disabled="props.disabled"
      class="relative w-full cursor-default rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm"
      :class="[
        props.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
        isOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : ''
      ]" @click="toggleDropdown" @keydown="handleKeyDown" role="combobox" aria-haspopup="listbox"
      :aria-expanded="isOpen" :aria-labelledby="labelId" :aria-describedby="helpTextId">
      <span class="block truncate" :class="{ 'text-gray-500': !selectedOption }">
        {{ buttonText }}
      </span>

      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDown :size="20" class="text-gray-500 transition-transform duration-200 ease-in-out"
          :class="{ 'rotate-180': isOpen }" aria-hidden="true" />
      </span>
    </button>

    <p v-if="props.helpText" :id="helpTextId" class="mt-1 text-xs text-gray-500">
      {{ props.helpText }}
    </p>

    <ul v-if="isOpen" ref="optionsListElement"
      class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      tabindex="-1" role="listbox" :aria-labelledby="labelId">
      <li v-for="(option, index) in props.options" :key="option.value" :id="`${props.id}-option-${index}`" role="option"
        :aria-selected="option.value === props.modelValue" :aria-disabled="option.disabled"
        class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900" :class="{
          'bg-indigo-100 text-indigo-900': index === focusedOptionIndex,
          'cursor-not-allowed opacity-50': option.disabled,
          'hover:bg-indigo-50': !option.disabled && index !== focusedOptionIndex
        }" @click="clickOption(option)" @mouseenter="focusedOptionIndex = index" @mouseleave="focusedOptionIndex = -1"
        :title="option.label.length > 30 ? option.label : undefined">
        <span class="block truncate" :class="{ 'font-semibold': option.value === props.modelValue }">
          {{ option.label }}
        </span>
        <span v-if="option.value === props.modelValue"
          class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd" />
          </svg>
        </span>
      </li>
      <li v-if="props.options.length === 0" class="relative cursor-default select-none py-2 px-3 text-gray-500">
        옵션이 없습니다.
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* 필요한 경우 여기에 추가 스타일 */
</style>
