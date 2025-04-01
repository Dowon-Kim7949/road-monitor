<template>
  <Transition name="slide-left">
    <aside v-if="modelValue" class="fixed top-0 left-0 h-full w-[260px] bg-gray-10 shadow z-40 flex flex-col">
      <!-- 상단 로고 및 닫기 버튼 -->
      <div class="flex items-center justify-between p-4">
        <div class="flex flex-col">
          <img src="@/assets/image/logo.svg" alt="logo" class="h-6 mb-1" />
          <span class="text-sm text-red-600 font-bold">RoadMonitor</span>
          <span class="text-xs text-gray-500">ver0.9.1</span>
        </div>
        <!-- 닫기 버튼 -->
        <button class="ml-auto" @click="modelValue = false">
          <!-- <Icon name="chevron-left" class="w-5 h-5 text-gray-600" /> -->
          ←
        </button>
      </div>

      <!-- 메뉴 섹션 -->
      <nav class="flex-1 px-4 space-y-6 overflow-y-auto">
        <div v-for="(group, gIdx) in menuGroups" :key="gIdx">
          <p :class="[
            'text-sm mb-1',
            group.highlight ? 'text-blue-600 font-semibold' : 'font-bold'
          ]">
            {{ group.label }}
          </p>
          <ul v-if="group.items" class="space-y-1 pl-2">
            <li v-for="(item, iIdx) in group.items" :key="iIdx">
              <button class="text-sm hover:underline text-left w-full">{{ item }}</button>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 하단 기능 -->
      <div class="p-4 border-t space-y-2 text-sm">
        <button class="flex items-center space-x-2">
          <!-- <Icon name="globe" /> -->
          🌐
          <span>Language</span>
        </button>
        <button class="flex items-center space-x-2">
          <!-- <Icon name="moon" /> -->
          🌙
          <span>Theme</span>
        </button>
        <button class="flex items-center space-x-2">
          <!-- <Icon name="user" /> -->
          👤
          <span>Dareesoft</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const modelValue = defineModel<boolean>()

const menuGroups = [
  { label: 'Monitoring', highlight: true },
  {
    label: 'Kracknet',
    items: ['rPCI Results', 'rPCI Map', 'rPCI Report']
  },
  { label: 'Device Tracker' }
]
</script>

<style scoped>
.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
