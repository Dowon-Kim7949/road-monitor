<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'

// 유틸 초기화 모듈
import { initAllKRDS } from '@/utils/krds-ui-script'

// 전역 유틸 이벤트
import { windowSize } from '@/utils/krds-ui-script/krds_windowSize.ts'
import { scrollManager } from '@/utils/krds-ui-script/krds_scrollManager.ts'

// 이벤트 핸들러 정의
function handleResize() {
  windowSize.setWinSize()
}

function handleScroll() {
  scrollManager.updateScrollValues()
  scrollManager.handleScrollDirection()
}

onMounted(() => {
  // 모든 KRDS 유틸 초기화
  initAllKRDS()

  // 초기 상태 업데이트
  windowSize.setWinSize()
  scrollManager.updateScrollValues()

  // 전역 이벤트 바인딩
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  // 이벤트 제거
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
