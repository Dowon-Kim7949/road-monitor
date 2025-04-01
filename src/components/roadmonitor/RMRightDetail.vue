<template>
  <Transition name="slide-fade">
    <div v-if="drawerRight" class="fixed inset-y-0 right-0 bg-white shadow-lg z-50 w-[960px] overflow-y-auto">
      <div class="p-8 text-black">
        <!-- 이미지 영역 -->
        <div class="flex flex-col items-center mb-6">
          <img :src="currentImg" alt="Road Image" class="w-full max-w-3xl cursor-pointer" loading="lazy"
            @click="imageFullscreen" ref="currentLazyImg" />
          <!-- 업로드 버튼 -->
          <button class="mt-2 text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700"
            @click="kracknetUpload">
            <img src="/assets/unarchive_shadow.webp" alt="upload icon" class="w-5 h-5" />
            <span>{{ t("info_kracknet") }}</span>
          </button>

          <!-- 플레이 컨트롤 -->
          <div class="flex items-center justify-between w-full mt-4">
            <button @click="playImage">
              <img
                :src="playState ? '/assets/pause_circle_outline_shadow.png' : '/assets/play_circle_outline_shadow.webp'"
                class="w-8 h-8" />
            </button>

            <div class="flex items-center gap-4">
              <button @click="prevImage">
                <img src="/assets/navigate_before_shadow.webp" class="w-6 h-6" />
              </button>
              <button @click="nextImage">
                <img src="/assets/navigate_next_shadow.webp" class="w-6 h-6" />
              </button>
              <button @click="imageFullscreen">
                <img src="/assets/fullscreen_shadow.png" class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <!-- 도로 정보 -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2 text-sm">
            <img src="/assets/road.webp" alt="road icon" class="w-6 h-6" />
            <span>
              {{ '도로명' }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <img src="/assets/place.webp" alt="location icon" class="w-6 h-6" />
            {{ '위/경도' }}
            <button @click="onCopyLatLon(pointFeatureList[currentImgIndex]?.values_.latlon)">
              <span class="text-xs">Copy</span>
            </button>
          </div>
        </div>

        <!-- 노드링크 / 시간 -->
        <div class="flex justify-between items-center mb-6 text-sm">
          <div class="flex items-center gap-2">
            <img src="/assets/linear_scale.webp" alt="node link icon" class="w-6 h-6" />
            <span>
              {{ '노드 링크' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <img src="/assets/time.webp" alt="time icon" class="w-6 h-6" />
            {{ '날짜짜' }}
          </div>
        </div>

        <!-- 히스토리 -->
        <hr class="border-t border-gray-300 my-6" />

        <div>
          <h2 class="text-lg font-bold mb-4">{{ t("road_history") }}</h2>
          <div v-if="selectItem && groupData" class="h-[24.5vh] overflow-y-auto">
            <div class="flex items-center mb-4">
              <div class="w-1/6">
                <img :src="imageLoaders('2024-11-28')" class="w-full cursor-pointer"
                  @click="singleImgFullScreen('2024-11-28')" />
              </div>
              <div class="w-5/6 pl-4">
                {{ dateDisplayer(photoIdx, groupData[selectItem.node_link]['2024-11-28']) }}
              </div>
            </div>

            <div class="flex items-center mb-4">
              <div class="w-1/6">
                <img :src="imageLoaders('2024-11-27')" class="w-full cursor-pointer"
                  @click="singleImgFullScreen('2024-11-27')" />
              </div>
              <div class="w-5/6 pl-4">
                {{ dateDisplayer(photoIdx, groupData[selectItem.node_link]['2024-11-27']) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, defineModel } from 'vue'

const drawerRight = defineModel<boolean>()
const props = defineProps<{
  currentImg: string
  isErrorImage: boolean
  pointFeatureList: any[]
  currentImgIndex: number
  playState: boolean
  selectItem: any
  groupData: Record<string, any>
  photoIdx: number
}>()

const emit = defineEmits<{
  (e: 'update:drawerRight', value: boolean): void
}>()

const currentLazyImg = ref<HTMLImageElement | null>(null)
</script>

<style scoped>
.slide-fade-enter-from {
  transform: translateX(100%);
}

.slide-fade-enter-active {
  transition: transform 0.3s ease;
}

.slide-fade-leave-to {
  transform: translateX(100%);
}

.slide-fade-leave-active {
  transition: transform 0.3s ease;
}
</style>
