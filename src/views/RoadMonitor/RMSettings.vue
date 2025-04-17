<template>
  <div class="flex h-screen bg-white rm_setting">
    <RLeftDrawer class="shrink-0" v-model="leftDrawer" mode="fix" />

    <main class="flex-1 overflow-y-auto">
      <div class="py-10 px-8 xl:py-12 xl:px-10">
        <div class="content-header">
          <h1 class="text-2xl font-semibold mb-6 text-gray-800">Settings 변경 설정</h1>
        </div>

        <div class="content-body bg-white p-6 md:p-8">
          <section class="mb-10">
            <h2 class="text-xl font-semibold mb-5 text-gray-900 border-b border-gray-200 pb-2.5">Road Monitor</h2>
            <div class="flex flex-col sm:flex-row items-center gap-10 mb-5">
              <div class="setting-label">
                <label for="duplicate-removal" class="font-medium text-gray-800 block mb-1">중복 촬영 데이터 제거</label>
                <p class="text-sm text-gray-600">
                  1일 내 동일한 지점을 촬영한 경우, 최초 1회 데이터를 제외하고 삭제합니다.
                </p>
              </div>
              <div class="flex shrink-0 items-center sm:pt-0 ml-5">
                <label for="duplicate-removal" class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="duplicate-removal" class="sr-only peer"
                    v-model="duplicateRemovalEnabled" />
                  <div
                    class="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500">
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section class=" mb-10">
            <h2 class="text-xl font-semibold mb-5 text-gray-900 border-b border-gray-200 pb-2.5">Rapid-PCI</h2>
            <div class="setting-label mb-4">
              <label class="font-medium text-gray-800 block mb-1">rPCI 등급 설정</label>
              <p class="text-sm text-gray-600">
                rPCI 분석 시 사용할 등급을 아래에서 원하는 대로 설정할 수 있습니다. 변경된 등급 체계는 이후 분석부터 적용됩니다.
              </p>
            </div>
            <div class="pt-5">
              <RMLevelSetting v-model="selectedGrade" />
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// '@/...'는 src/'...'를 의미하는 경우가 많습니다. 경로를 확인하세요.
import RMLevelSetting from '@/components/roadmonitor/RMLevelSetting.vue';
import RLeftDrawer from '@/components/common/RLeftDrawer.vue';

// --- State ---
const duplicateRemovalEnabled = ref(true); // 토글 스위치 상태
const leftDrawer = ref(true); // 왼쪽 드로어 상태 (RLeftDrawer에서 사용될 수 있음)
const selectedGrade = ref('7'); // RMLevelSetting 컴포넌트와 연결된 값

// --- 사용되지 않는 변수 제거 ---
// pciGradeSystem, indicatorStyle 등은 현재 템플릿에서 직접 사용되지 않으므로 제거했습니다.
// RMLevelSetting 내부 로직에 필요하다면 유지해야 합니다.

</script>

<style scoed>
.rm_setting {
  width: calc(100vw - 240px);
  margin-left: 240px;
}
</style>
