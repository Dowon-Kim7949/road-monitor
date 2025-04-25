<script setup>
import { ref, computed } from 'vue'

// --- Props ---
const props = defineProps({
  modelValue: {
    // Supports v-model
    type: String,
    required: true,
  },
  radioGroupName: {
    // Unique name for the radio group
    type: String,
    default: 'grade-system-radio-group',
  },
})

// --- Emits ---
const emit = defineEmits(['update:modelValue'])

// --- Data ---
// (GradeOptions data remains the same as previous example)
const gradeOptions = ref([
  {
    value: '3',
    label: '3등급 체계',
    ticks: [33.33, 66.67],
    details: null,
  },
  {
    value: '5',
    label: '5등급 체계',
    ticks: [20, 40, 60, 80],
    details: null,
  },
  {
    value: '7',
    label: '7등급 체계',
    ticks: [10, 25, 40, 55, 70, 85],
    details: [
      { value: 0, category: 'Failed', position: 0 },
      { value: 10, category: 'Serious', position: 10 },
      { value: 25, category: 'Very Poor', position: 25 },
      { value: 40, category: 'Poor', position: 40 },
      { value: 55, category: 'Fair', position: 55 },
      { value: 70, category: 'Satisfactory', position: 70 },
      { value: 85, category: 'Good', position: 85 },
      { value: 100, category: null, position: 100 },
    ],
  },
])

// --- Methods ---
function updateSelection(value) {
  emit('update:modelValue', value)
}

// Function to return Tailwind color class based on category
function getCategoryClass(category) {
  if (!category) return ''
  const catLower = category.toLowerCase()
  // Adjust color shades as needed (e.g., text-red-500, text-red-600)
  if (
    catLower.includes('fail') ||
    catLower.includes('serious') ||
    catLower.includes('very poor') ||
    catLower.includes('poor')
  ) {
    return 'text-red-600'
  } else if (catLower.includes('fair')) {
    return 'text-orange-500'
  } else if (catLower.includes('satisfactory') || catLower.includes('good')) {
    return 'text-green-600'
  }
  return 'text-gray-700' // Default color if needed
}

// Calculate style for categorical labels to position them between ticks
// (getCategoryStyle function remains the same as previous example)
function getCategoryStyle(details, index) {
  if (!details || index >= details.length - 1) return {}

  const startPos = details[index].position
  const endPos = details[index + 1].position
  const width = endPos - startPos
  const centerPos = startPos + width / 2

  return {
    left: `${centerPos}%`,
    transform: 'translateX(-50%)', // Center the text element itself
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-for="option in gradeOptions" :key="option.value" class="flex items-center gap-4">
      <label class="flex items-center cursor-pointer whitespace-nowrap shrink-0 w-24 text-sm">
        <input
          type="radio"
          :name="radioGroupName"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="updateSelection(option.value)"
          class="form-radio mr-2 h-4 w-4 border-gray-400 text-slate-600 focus:ring-slate-500"
        />
        <span>{{ option.label }}</span>
      </label>

      <div class="flex-grow relative pt-3.5 pb-6 min-h-[50px]">
        <div class="w-full h-1 bg-gray-300 rounded-sm relative mt-2.5">
          <span
            v-for="(tickPosition, index) in option.ticks"
            :key="`tick-${option.value}-${index}`"
            class="absolute w-px h-3.5 bg-gray-400 top-1/2 -translate-y-1/2 -translate-x-1/2"
            :style="{ left: `${tickPosition}%` }"
          ></span>
        </div>

        <div v-if="option.details" class="absolute w-full top-4 left-0">
          <div class="relative w-full h-4 mt-5.5">
            <span
              v-for="detail in option.details"
              :key="`num-${detail.value}`"
              class="absolute -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
              :style="{ left: `${detail.position}%` }"
            >
              {{ detail.value }}
            </span>
          </div>
          <div class="relative w-full h-5 mt-1">
            <span
              v-for="(detail, index) in option.details.slice(0, -1)"
              :key="`cat-${detail.value}`"
              class="absolute text-sm font-medium whitespace-nowrap"
              :class="getCategoryClass(detail.category)"
              :style="getCategoryStyle(option.details, index)"
            >
              {{ detail.category }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
