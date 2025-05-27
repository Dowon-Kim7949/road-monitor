<template>
  <div class="relative w-full" data-dropdown="user">
    <button
      @click="toggle"
      ref="buttonRef"
      class="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 w-full"
    >
      <RIcon name="User" />
      <span>{{ username }}</span>
    </button>

    <div
      v-if="isOpen()"
      :class="[
        'absolute w-full border rounded shadow-md z-10 bg-white',
        direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1',
      ]"
    >
      <button @click="logout" class="block px-4 py-2 text-left hover:bg-gray-10 w-full rounded">
        {{ t('logout') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import RIcon from '@/components/common/atom/RIcon.vue'
import { useDropdownControl } from '@/utils/composables/useDropdownControl'
import { AuthApiService } from '@/utils/api'

const { t } = useI18n()
const username = 'Dareesoft'

const buttonRef = ref<HTMLElement | null>(null)
const direction = ref<'down' | 'up'>('down')
const { isOpen, toggle } = useDropdownControl('user')

const logout = async () => {
  try {
    await AuthApiService.logout()
    // 로그인 성공 처리 (예: 토큰 저장, 리다이렉트)
    localStorage.clear()
    window.location.href = '/auth'
  } catch (err: any) {
    // 에러 메시지
    if (err.response?.status === 401) {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else {
      alert('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.')
    }
  } finally {
    toggle() // 드롭다운 닫기
  }
}

// 드롭다운 열릴 때 방향 계산
watchEffect(async () => {
  if (isOpen()) {
    await nextTick()
    const rect = buttonRef.value?.getBoundingClientRect()
    const spaceBelow = window.innerHeight - (rect?.bottom || 0)
    direction.value = spaceBelow < 100 ? 'up' : 'down'
  }
})
</script>
