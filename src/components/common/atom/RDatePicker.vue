<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import RIcon from './RIcon.vue'
const inputRef = ref<HTMLInputElement | null>(null)
const calendarRef = ref<HTMLDivElement | null>(null)
const isOpen = ref(false)
const calendarPosition = ref<'top' | 'bottom'>('bottom')

const today = ref(new Date())
const currentMonth = ref(today.value.getMonth() + 1)
const currentYear = ref(today.value.getFullYear())
const daysOfWeek = ref(['일', '월', '화', '수', '목', '금', '토'])

const startDate = ref<Date | null>(
  new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
)
const endDate = ref<Date | null>(new Date())
const isSelectingRange = ref(true) // 기간 선택 모드

const displayValue = computed(() => {
  const formatDate = (date: Date | null): string => {
    if (!date) return 'YYYY-MM-DD'
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  if (startDate.value && endDate.value) {
    return `${formatDate(startDate.value)} ~ ${formatDate(endDate.value)}`
  } else if (startDate.value) {
    return formatDate(startDate.value) + ' ~ YYYY-MM-DD'
  } else {
    return `${formatDate(startDate.value)} ~ ${formatDate(endDate.value)}`
  }
})

const toggleCalendar = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    today.value = startDate.value || new Date()
    currentMonth.value = today.value.getMonth() + 1
    currentYear.value = today.value.getFullYear()
  }
}

const closeCalendar = () => {
  isOpen.value = false
}

const prevMonth = () => {
  currentMonth.value--
  if (currentMonth.value < 1) {
    currentMonth.value = 12
    currentYear.value--
  }
}

const nextMonth = () => {
  currentMonth.value++
  if (currentMonth.value > 12) {
    currentMonth.value = 1
    currentYear.value++
  }
}

const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  const days: Date[] = []

  // 이전 달의 날짜 채우기
  const firstDayWeekday = firstDayOfMonth.getDay() // 0 (일) ~ 6 (토)
  const daysFromPrevMonth = firstDayWeekday
  const lastDayOfPrevMonth = new Date(year, month - 1, 0).getDate()
  for (let i = 0; i < daysFromPrevMonth; i++) {
    days.unshift(new Date(year, month - 2, lastDayOfPrevMonth - i))
  }

  // 현재 달의 날짜 채우기
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(new Date(year, month - 1, i))
  }

  // 다음 달의 날짜 채우기
  const daysToNextMonth = 7 - (days.length % 7)
  if (daysToNextMonth < 7) {
    for (let i = 1; i <= daysToNextMonth; i++) {
      days.push(new Date(year, month, i))
    }
  }

  return days
}

const datesInMonth = computed(() => getDaysInMonth(currentYear.value, currentMonth.value))

const isNotInCurrentMonth = (date: Date): boolean => {
  return date.getMonth() !== currentMonth.value - 1
}

const isSelected = (date: Date): boolean => {
  if (startDate.value && endDate.value) {
    return date >= startDate.value && date <= endDate.value
  } else if (startDate.value) {
    return date.toDateString() === startDate.value.toDateString()
  }
  return false
}

const selectDate = (date: Date) => {
  if (isSelectingRange.value) {
    if (!startDate.value) {
      startDate.value = date
    } else if (!endDate.value && date >= startDate.value) {
      endDate.value = date
    } else {
      startDate.value = date
      endDate.value = null
    }
  } else {
    startDate.value = date
    endDate.value = date
    closeCalendar()
  }
}

const confirmRange = () => {
  isOpen.value = false
}

const cancelRange = () => {
  startDate.value = null
  endDate.value = null
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    calendarRef.value &&
    !calendarRef.value.contains(event.target as Node) &&
    inputRef.value !== event.target
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(isOpen, (newIsOpen) => {
  if (inputRef.value && newIsOpen) {
    const inputRect = inputRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const calendarHeight = calendarRef.value?.offsetHeight || 350

    if (inputRect.bottom + calendarHeight > windowHeight) {
      calendarPosition.value = 'top'
    } else {
      calendarPosition.value = 'bottom'
    }
  }
})
</script>

<template>
  <div class="relative border border-gray-300 rounded shadow">
    <div class="flex gap-2">
      <div class="flex items-center pl-3">
        <RIcon name="Calendar" :size="20" class="text-gray-600" />
      </div>
      <div class="flex items-center" @click="toggleCalendar">
        <input ref="inputRef" type="text" :value="displayValue"
          class="py-2 text-center cursor-pointer focus:outline-none text-gray-100/80 font-bold" readonly />
        <span ref="measureSpanRef" class="absolute invisible whitespace-nowrap text-center font-bold"
          style="top: -9999px; left: -9999px; padding-left: 0; padding-right: 0; border: none;">
          {{ displayValue }}
        </span>
      </div>
    </div>
    <div v-if="isOpen" ref="calendarRef" class="absolute z-10 rounded shadow-md bg-white overflow-hidden"
      :class="calendarPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'" style="width: 300px">
      <div class="flex justify-between items-center p-4">
        <button @click="prevMonth" class="focus:outline-none cursor-pointer">
          <RIcon name="ChevronLeft" />
        </button>
        <span>{{ currentYear }}년 {{ currentMonth }}월</span>
        <button @click="nextMonth" class="focus:outline-none cursor-pointer">
          <RIcon name="ChevronRight" />
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 p-2">
        <div v-for="day in daysOfWeek" :key="day" class="text-center text-gray-500">{{ day }}</div>
        <div v-for="(date, index) in datesInMonth" :key="index" class="text-center p-1 cursor-pointer" :class="{
          'text-blue-500 font-semibold': isSelected(date),
          'text-gray-300': isNotInCurrentMonth(date),
          'hover:bg-blue-100 rounded-sm': !isNotInCurrentMonth(date),
          'bg-blue-100 rounded-sm': isSelected(date),
        }" @click="selectDate(date)">
          {{ date.getDate() }}
        </div>
      </div>
      <div v-if="isSelectingRange" class="p-1 border-t border-gray-200 flex justify-around">
        <button @click="cancelRange" class="px-4 py-2 rounded cursor-pointer">취소</button>
        <button @click="confirmRange" :disabled="!startDate || !endDate"
          class="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300 cursor-pointer">
          확인
        </button>
      </div>
      <div v-else class="p-4 border-t border-gray-200 flex justify-end">
        <button @click="closeCalendar" class="px-4 py-2 rounded cursor-pointer">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 필요하다면 추가적인 스타일링 */
</style>
