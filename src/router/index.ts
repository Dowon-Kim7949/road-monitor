import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('@/views/Login/LoginView.vue') }],
  },
  {
    path: '/contents',
    component: () => import('@/layouts/ContentsLayout.vue'),
    children: [
      { path: '/monitoring', component: () => import('@/views/RoadMonitor/RMMonitoringView.vue') },
      { path: '/coverage', component: () => import('@/views/RoadMonitor/RMCoverageView.vue') },
      { path: '/rpci', component: () => import('@/views/rPCI/rPCIAnalyzeMapView.vue') },
      { path: '/rpci/table', component: () => import('@/views/rPCI/rPCIAnalyzeResultView.vue') },
      { path: '/rpci/report', component: () => import('@/views/rPCI/rPCIReportView.vue') },
    ],
  },
  { path: '/:catchAll(.*)*', component: () => import('@/views/Errors/ErrorView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
