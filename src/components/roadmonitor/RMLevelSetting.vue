<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue'
import type { Ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { cloneDeep } from 'lodash'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface LevelValue {
  id?: string
  label: string
  color: string
  textColor: string
  minScore: number
  maxScore: number
}

interface Level {
  id?: string
  label: Ref<string>
  color: string
  textColor: string
  minScore: Ref<number>
  maxScore: Ref<number>
}

interface LevelSystem {
  id: 3 | 5 | 7
  name: string
  levels: Level[]
  editable: boolean
}

const props = defineProps({
  modelValue: {
    type: Number as () => 3 | 5 | 7,
    required: true,
  }
})
const emit = defineEmits(['update:modelValue'])

const settingsStore = useSettingsStore()

const initialLevelDataStore: Record<3 | 5 | 7, LevelValue[]> = {
  3: [
    { label: 'Good', color: '#007e12', textColor: 'white', minScore: 60, maxScore: 100 },
    { label: 'Poor', color: '#FF2B06', textColor: 'white', minScore: 10, maxScore: 60 },
    { label: 'Failed', color: '#979797', textColor: 'white', minScore: 0, maxScore: 10 },
  ],
  5: [
    { label: 'Good', color: '#007e12', textColor: 'white', minScore: 70, maxScore: 100 },
    { label: 'Satisfactory', color: '#00CC25', textColor: 'white', minScore: 50, maxScore: 70 },
    { label: 'Fair', color: '#FEFD33', textColor: 'black', minScore: 30, maxScore: 50 },
    { label: 'Poor', color: '#FF2B06', textColor: 'white', minScore: 10, maxScore: 30 },
    { label: 'Failed', color: '#979797', textColor: 'white', minScore: 0, maxScore: 10 },
  ],
  7: settingsStore.getLegendLevels.map(grade => ({ ...grade })) // Store data clone
}

const wrapLevelRefs = (levels: LevelValue[]): Level[] => {
  return levels.map(level => ({
    ...level,
    label: ref(level.label),
    minScore: ref(level.minScore),
    maxScore: ref(level.maxScore)
  }))
}

const levelSystems = reactive<LevelSystem[]>([
  {
    id: 3,
    name: '3',
    editable: false,
    levels: wrapLevelRefs(cloneDeep(initialLevelDataStore[3])),
  },
  {
    id: 5,
    name: '5',
    editable: false,
    levels: wrapLevelRefs(cloneDeep(initialLevelDataStore[5])),
  },
  {
    id: 7,
    name: '7',
    editable: false,
    levels: wrapLevelRefs(cloneDeep(initialLevelDataStore[7])),
  },
])

const filterNumericInput = (event: Event, minAllowed: number, maxAllowed: number) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/[^0-9]/g, '')
  let numValue = -1

  if (value) {
    numValue = parseInt(value, 10)
    if (numValue > 100) numValue = 100
    else if (numValue < 0) numValue = 0

    if (numValue > maxAllowed) numValue = maxAllowed
    if (numValue < minAllowed) numValue = minAllowed

    value = numValue.toString()
  }

  input.value = value
  return numValue === -1 ? undefined : numValue
}

const updateScores = (systemId: 3 | 5 | 7, levelIndex: number, event: Event) => {
  const system = levelSystems.find(s => s.id === systemId)
  if (!system || !system.editable) return

  const levels = system.levels
  const currentLevel = levels[levelIndex]

  const lowerBound = levelIndex < levels.length - 1 ? levels[levelIndex + 1].minScore : -1
  const upperBound = levels[levelIndex].maxScore

  const minAllowed = lowerBound + 1
  const maxAllowed = upperBound - 1 < 0 ? 0 : upperBound - 1

  const filteredValue = filterNumericInput(event, minAllowed, maxAllowed)

  if (filteredValue !== undefined && currentLevel.minScore !== filteredValue) {
    currentLevel.minScore = filteredValue
  } else {
    (event.target as HTMLInputElement).innerText = currentLevel.minScore.toString()
  }


  if (levelIndex < levels.length - 1) {
    const nextLevel = levels[levelIndex + 1]
    nextLevel.maxScore = currentLevel.minScore
  }

  nextTick(() => {
    const inputElement = event.target as HTMLInputElement
    inputElement.innerText = currentLevel.minScore.toString()
  })
}


const resetSystemData = (systemId: 3 | 5 | 7) => {
  const system = levelSystems.find(s => s.id === systemId)
  const initialData = initialLevelDataStore[systemId]
  if (system && initialData) {
    system.levels.forEach((level, index) => {
      const initialLevel = initialData[index]
      if (initialLevel) {
        level.label = initialLevel.label
        level.minScore = initialLevel.minScore
        level.maxScore = initialLevel.maxScore
      }
    })
  }
}

const changeLevelInfo = (newLevelId: 3 | 5 | 7) => {
  const previousLevelId = props.modelValue
  if (previousLevelId !== newLevelId) {
    resetSystemData(previousLevelId)
    emit('update:modelValue', newLevelId)
  }
  levelSystems.forEach(system => {
    system.editable = system.id === newLevelId
  })
}

watch(() => props.modelValue, (newLevelId, oldLevelId) => {
  if (oldLevelId !== undefined && newLevelId !== oldLevelId) {
    resetSystemData(oldLevelId)
  }
  levelSystems.forEach(system => {
    system.editable = system.id === newLevelId
  })
}, { immediate: true })

</script>

<template>
  <div class="px-6 max-w-300">
    <div class="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-row-1 gap-5">
      <div v-for="(system, systemIndex) in levelSystems" :key="system.id" @click="changeLevelInfo(system.id)"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer"
        :class="{ 'ring-2 ring-blue-500': props.modelValue === system.id }">
        <div class="mb-4 flex items-center space-x-2">
          <input type="radio" name="levelSystemDisplay" :value="system.id" :checked="props.modelValue === system.id"
            @change="changeLevelInfo(system.id)" class="form-radio h-4 w-4 text-blue-600" aria-hidden="true"
            tabindex="-1">
          <h3 class="text-sm font-semibold text-gray-800">{{ system.name + t('tierGradingSystem') }}</h3>
        </div>

        <div class="space-y-2">
          <div v-for="(grade, index) in system.levels" :key="grade.id || index"
            class="flex items-center justify-between px-2 gap-4">

            <template v-if="system.editable">
              <input type="text" v-model="grade.label"
                class="text-sm font-semibold px-3 py-1 rounded-full text-center w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                :style="{ backgroundColor: grade.color, color: grade.textColor }">
            </template>
            <template v-else>
              <p class="text-sm font-semibold px-3 py-1 rounded-full text-center w-full"
                :style="{ backgroundColor: '#979797', color: 'white' }">
                {{ grade.label }}
              </p>
            </template>

            <div class="flex items-center text-sm text-gray-600 space-x-1">
              <template v-if="system.editable">
                <input :id="`minScore-${system.id}-${index}`" type="number" :value="grade.minScore"
                  @input="updateScores(system.id, index, $event)"
                  class="w-16 border font-bold border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="index === system.levels.length - 1"
                  :class="{ 'opacity-60 cursor-not-allowed': index === system.levels.length - 1 }"
                  :aria-label="`${grade.label} minimum score`">
                <span>~</span>
                <input type="number" :value="grade.maxScore" disabled
                  class="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm opacity-80 cursor-not-allowed"
                  :aria-label="`${grade.label} maximum score`">
              </template>
              <template v-else>
                <input type="number" :value="grade.minScore" disabled
                  class="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm opacity-60 cursor-not-allowed">
                <span>~</span>
                <input type="number" :value="grade.maxScore" disabled
                  class="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm opacity-60 cursor-not-allowed">
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-radio {
  appearance: none;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  border: 2px solid #ccc;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
  vertical-align: middle;
}

.form-radio:checked {
  border-color: #2563eb;
  background-color: #2563eb;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.form-radio:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
