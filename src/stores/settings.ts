// src/stores/settings.ts
import { defineStore } from 'pinia'

interface LegendLevel {
  id: string // 고유 식별자
  color: string // CSS 색상 값 (예: '#RRGGBB', 'rgba(...)')
  textColor: string
  minScore: number // 최소 점수 (선택적)
  maxScore: number // 최대 점수 (선택적)
  label: string // 표시될 이름 (예: Good, Fair)
}

// Pinia 스토어의 상태 타입을 정의
interface SettingsState {
  legendLevels: LegendLevel[]
  // 다른 설정 값들에 대한 타입 정의...
}

interface LevelDetails {
  color: string
  textColor: string
  label: string
}

const DEFAULT_LEVELS: LegendLevel[] = [
  // 기본값 설정 (LegendLevel 타입 준수)
  { id: '1', color: '#007e12', textColor: 'white', minScore: 85, maxScore: 100, label: 'Good' },
  {
    id: '2',
    color: '#00CC25',
    textColor: 'white',
    minScore: 70,
    maxScore: 85,
    label: 'Satisfactory',
  },
  { id: '3', color: '#FEFD33', textColor: 'black', minScore: 55, maxScore: 70, label: 'Fair' },
  { id: '4', color: '#FF2B06', textColor: 'white', minScore: 40, maxScore: 55, label: 'Poor' },
  { id: '5', color: '#AB1803', textColor: 'white', minScore: 25, maxScore: 40, label: 'Very Poor' },
  { id: '6', color: '#690B02', textColor: 'white', minScore: 10, maxScore: 25, label: 'Serious' },
  { id: '7', color: '#979797', textColor: 'white', minScore: 0, maxScore: 10, label: 'Failed' },
]

export const useSettingsStore = defineStore('settings', {
  // state 함수의 반환 타입을 SettingsState로 명시
  state: (): SettingsState => ({
    legendLevels: DEFAULT_LEVELS,
    // 다른 초기 상태값...
  }),

  getters: {
    // getter의 state 파라미터 타입과 반환 타입을 명시
    getLegendLevels: (state: SettingsState): LegendLevel[] => {
      return state.legendLevels
    },
    // 다른 getter들...
  },

  actions: {
    // 비동기 액션의 반환 타입을 Promise<void> 등으로 명시
    async loadSettings(): Promise<void> {
      try {
        const savedSettings = localStorage.getItem('appLegendSettings')
        if (savedSettings) {
          // JSON.parse 결과는 any이므로, 타입 단언 또는 유효성 검사 후 할당
          const parsedSettings = JSON.parse(savedSettings) as LegendLevel[]
          // 간단한 구조 검증 (더 강력한 라이브러리 사용 가능: Zod, io-ts 등)
          if (
            Array.isArray(parsedSettings) &&
            parsedSettings.every(
              (item) =>
                typeof item.id === 'string' &&
                typeof item.label === 'string' &&
                typeof item.color === 'string',
            )
          ) {
            this.legendLevels = parsedSettings
          } else {
            // 필요시 기본값으로 강제 재설정하는 로직 추가 가능
          }
        } else {
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        // 에러 발생 시 기본값 사용 또는 복구 로직
      }
    },

    // 액션 파라미터 타입을 명시
    saveSettings(newLevels: LegendLevel[]): void {
      // 파라미터 유효성 검사 로직 추가 가능
      this.legendLevels = newLevels
      try {
        localStorage.setItem('appLegendSettings', JSON.stringify(newLevels))
      } catch (error) {}
    },

    getLevelDetailsByScore(
      score: number,
      levels: LegendLevel[] = DEFAULT_LEVELS, // 기본값으로 DEFAULT_LEVELS 사용
    ): LevelDetails | null {
      // 최고 점수(100)를 명시적으로 처리 (maxScore가 100인 레벨 찾기)
      // 데이터 상에서 가장 높은 maxScore 값을 찾아 비교하는 것이 더 일반적일 수 있습니다.
      // 여기서는 주어진 데이터 기준으로 100을 처리합니다.
      if (score === 100) {
        const topLevel = levels.find((level) => level.maxScore === 100)
        if (topLevel) {
          return {
            color: topLevel.color,
            textColor: topLevel.textColor,
            label: topLevel.label,
          }
        }
        // maxScore가 100인 레벨이 없는 극단적인 경우, 아래 로직에서 처리될 수도 있음
        // (단, minScore: 85, maxScore: 100 인 경우 100 >= 85 && 100 < 100 은 false)
      }

      // minScore <= score < maxScore 조건에 맞는 레벨 찾기
      const foundLevel = levels.find((level) => score > level.minScore && score <= level.maxScore)

      // 찾았다면 해당 레벨의 정보 반환
      if (foundLevel) {
        return {
          color: foundLevel.color,
          textColor: foundLevel.textColor,
          label: foundLevel.label,
        }
      }

      // 어떤 범위에도 해당하지 않으면 null 반환 (예: score < 0 또는 예외 처리 못한 경우)
      return null
    },
  },
})
