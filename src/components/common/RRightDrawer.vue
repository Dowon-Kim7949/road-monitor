<script setup lang="ts">
import { watch } from 'vue'
import RImageViewer from './RImageViewer.vue';
import RImageInfo from './RImageInfo.vue';
import RImageHistory from './RImageHistory.vue';
const modelValue = defineModel<boolean>()

// props는 그대로 유지
const props = defineProps<{
  data: {
    lat: number
    lon: number
    roadName: string
    image: string
    nodeLink: string
    timestamp: string
  } | null
}>()

const historyList = [
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-28 16:07:20'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-27 12:11:06'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-28 16:07:20'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-27 12:11:06'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-28 16:07:20'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-27 12:11:06'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-28 16:07:20'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-27 12:11:06'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-28 16:07:20'
  },
  {
    image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_34_12_608+01_00.webp',
    timestamp: '2024-11-27 12:11:06'
  },

]

const onSelectHistory = (item: any) => {
  // drawer 내 이미지 뷰어로 반영 or 전체화면 전환 등
}

const onCopyLatLon = () => {
  console.log('copy')
}

// 🔥 반응형 감지로 drawer 열림 상태에 따라 body 클래스 적용
watch(modelValue, (val) => {
  if (typeof window !== 'undefined') {
    document.body.classList.toggle('drawer-open', val)
  }
}, { immediate: true })
</script>

<template>
  <Transition name="slide-right">
    <aside v-if="modelValue" class="fixed top-0 right-0 h-full w-[40%] bg-white shadow z-40">
      <div class="p-6 space-y-4">
        <RImageViewer :src="props.data?.image" />
        <RImageInfo :roadName="data?.roadName" :lat="data?.lat" :lon="data?.lon" :nodeLink="data?.nodeLink"
          :timestamp="data?.timestamp" @copy-coord="onCopyLatLon" />
        <hr />
        <RImageHistory :items="historyList" @select="onSelectHistory" />

      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>

<style>
/* RFloatingButton 내 우측 버튼 위치 조정용 */
body.drawer-open .floating-top-right {
  right: 41% !important;
}

body.drawer-open .floating-bottom-right {
  right: 41% !important;
}
</style>
