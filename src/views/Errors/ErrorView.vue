<template>
  <div class="h-screen w-full bg-blue-500 text-white text-center q-pa-md flex flex-center justify-center items-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2 pb-5" style="opacity: 0.8">잘못된 페이지입니다...</div>

      <button type="button"
        class="px-4 py-2 text-md rounded border bg-white hover:bg-gray-200 text-gray-800 cursor-pointer"
        @click="goHome">
        홈으로 가기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const goHome = () => {
  window.location.href = '/'
}
</script>
