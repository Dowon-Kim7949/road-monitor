<template>
  <div class="w-full h-screen flex justify-center items-center">
    <form @keyup.prevent="keyUpEvent" class="flex flex-col w-90 p-6 bg-white rounded-lg shadow-md">
      <div class="flex justify-center items-center pb-4">
        <img src="../../assets/image/CI.webp" alt="logo" class="h-15" />
        <div class="text-left pl-2">
          <div class="text-red-60 font-bold text-3xl">RoadMonitor</div>
        </div>
      </div>

      <label class="mb-1 text-sm font-medium text-gray-60">이메일</label>
      <input
        v-model="email"
        type="email"
        placeholder="email@example.com"
        class="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <label class="mb-1 text-sm font-medium text-gray-60">비밀번호</label>
      <input
        v-model="password"
        type="password"
        placeholder="••••••••"
        class="mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <div v-if="error" class="text-red-600 text-sm text-center" v-html="error"></div>
      <RButton
        :label="loading ? '로딩 중...' : '로그인'"
        type="tertiary"
        size="medium"
        icon="log-in"
        class="w-full mt-4"
        :disabled="loading"
        @click="onSubmit"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { AuthApiService, CustomerService, jwtDecode } from '@/utils/api/index'
import { useRouter } from 'vue-router'
const RButton = defineAsyncComponent(() => import('@/components/common/atom/RButton.vue'))

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const keyUpEvent = async (e: any) => {
  if (e.key === 'Enter') await onSubmit()
}

const onSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const resu = await AuthApiService.getLoginToken(email.value, password.value)
    // 로그인 성공 처리 (예: 토큰 저장, 리다이렉트)
    localStorage.setItem('token', `${resu.data.token.access_token}`)
    const userInfo = await jwtDecode(resu.data.token.access_token)
    let custId = 1
    if (userInfo && userInfo.cust_id) {
      localStorage.setItem('cust_id', userInfo.cust_id)
      custId = userInfo.cust_id
    }
    // console.log(userInfo)
    const resp = await CustomerService.getCustomers(custId)
    // window.location.href = '/monitoring'
    router.push('/monitoring')
  } catch (err: any) {
    // 에러 메시지
    if (err.response?.status === 401) {
      error.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else {
      error.value = '알 수 없는 오류가 발생했습니다. <br/> 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}
</script>
