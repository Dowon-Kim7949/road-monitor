<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RButton from './atom/RButton.vue'
import RLocaleSelector from './RLocaleSelector.vue'
import RUserMenu from './RUserMenu.vue'

const modelValue = defineModel<boolean>()
const route = useRoute()
const { t } = useI18n()
const props = defineProps<{
  mode?: 'fix' | null
}>()

const menuGroups = [
  {
    label: 'menu.roadMonitor',
    items: [
      { label: 'menu.monitoring', path: '/monitoring' },
      { label: 'menu.coverage', path: '/coverage' },
    ],
  },
  {
    label: 'menu.rapidPci',
    items: [
      { label: 'menu.rpcianalysis', path: '/rpci/analysis' },
      { label: 'menu.rpcimap', path: '/rpci/map' },
      { label: 'menu.rpcireport', path: '/rpci/report' },
    ],
  },
  {
    label: 'menu.settings',
    items: [{ label: 'menu.envSetting', path: '/settings' }],
  },
]
</script>

<template>
  <Transition name="slide-left">
    <aside v-if="modelValue"
      class="fixed top-0 left-0 h-full w-[240px] bg-gray-10 shadow z-[10] flex flex-col border-gray-40 border-r-1">
      <!-- 상단 로고 및 닫기 버튼 -->
      <button class="z-50 bg-transparent p-7">
        <div class="flex">
          <img src="../../assets/image/CI.webp" alt="logo" class="h-15" />
          <div class="text-left pl-2">
            <div class="text-red-60 font-bold text-lg">RoadMonitor</div>
            <div class="text-gray-70 font-bold text-xs">ver1.0.0</div>
          </div>
        </div>
      </button>
      <div v-if="!props.mode" class="fixed top-10 left-[239px] z-[5]">
        <RButton type="tertiary"
          class="bg-gray-10 rounded-br-sm rounded-tr-sm rounded-bl-none rounded-tl-none py-2 px-1 border-gray-40 border-r-1 border-t-1 border-b-1 border-l-0"
          icon="chevron-left" size="small" @click="modelValue = false" />
      </div>

      <!-- 메뉴 섹션 -->
      <nav class="flex-1 px-7 space-y-6 overflow-y-auto">
        <div v-for="(group, gIdx) in menuGroups" :key="gIdx">
          <p class="text-sm font-bold mb-1">{{ t(group.label) }}</p>
          <ul v-if="group.items" class="space-y-1 pl-2">
            <li v-for="(item, iIdx) in group.items" :key="iIdx">
              <RouterLink :to="item.path" class="block w-full text-md py-1 px-2 rounded hover:bg-gray-200" :class="{
                'text-blue-600 font-semibold bg-gray-200': route.path === item.path,
              }">
                {{ t(item.label) }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 하단 설정 -->
      <div class="p-7 space-y-2 text-md w-full">
        <RLocaleSelector />
        <RUserMenu />
      </div>
    </aside>
  </Transition>
</template>

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
