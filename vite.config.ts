// import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // top-level await를 지원하는 타겟으로 변경
    // 예시 1: 최신 ECMAScript 기능 사용
    target: 'esnext',
    // 예시 2: 특정 브라우저 버전 이상 지정 (top-level await 지원 버전 확인 필요)
    // target: ['chrome91', 'firefox90', 'safari15', 'edge91'],
  },
})
