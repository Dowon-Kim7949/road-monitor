<template>
  <div class="relative w-full" data-dropdown="locale">
    <button @click="toggle" ref="buttonRef" class="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 w-full">
      <RIcon name="Globe" />
      <span>{{ t('Language') }}</span>
    </button>

    <div v-if="isOpen()" :class="[
      'absolute w-full border rounded shadow-md z-10 bg-white',
      direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
    ]">
      <button v-for="lang in langs" :key="lang.code" @click="changeLang(lang.code)"
        class="block px-4 py-2 text-left hover:bg-gray-10 w-full rounded">
        {{ t(lang.label) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import RIcon from '@/components/common/atom/RIcon.vue'
import { useDropdownControl } from '@/utils/composables/useDropdownControl'

const buttonRef = ref<HTMLElement | null>(null)
const direction = ref<'up' | 'down'>('down')
const { isOpen, toggle } = useDropdownControl('locale')

const { locale, t } = useI18n()

const langs = [
  { code: 'ko', label: 'lang.ko' },
  { code: 'en', label: 'lang.en' }
]

const changeLang = (lang: string) => {
  locale.value = lang
  toggle() // 닫기
}

// 방향 판단
watchEffect(async () => {
  if (isOpen()) {
    await nextTick()
    const rect = buttonRef.value?.getBoundingClientRect()
    direction.value = window.innerHeight - (rect?.bottom || 0) < 100 ? 'up' : 'down'
  }
})
</script>
