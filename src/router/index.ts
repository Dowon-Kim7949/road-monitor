import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/',
  //   // component: () => import('@/layouts/loginLayout.vue'),
  //   // children: [{ path: '', component: () => import('@/views/Login/LoginView.vue') }],
  //   redirect: '/contents/monitoring',
  // },
  {
    path: '/',
    redirect: '/auth',
    component: () => import('@/layouts/contentsLayout.vue'),
    children: [
      { path: '/auth', component: () => import('@/views/Login/LoginView.vue') },
      { path: '/monitoring', component: () => import('@/views/RoadMonitor/RMMonitoringView.vue') },
      {
        path: '/surroundings',
        component: () => import('@/views/RoadMonitor/RMSurroundingView.vue'),
      },
      { path: '/coverage', component: () => import('@/views/RoadMonitor/RMCoverageView.vue') },
      { path: '/settings', component: () => import('@/views/RoadMonitor/RMSettings.vue') },
      { path: '/rpci/map', component: () => import('@/views/rPCI/rPCIAnalyzeMapView.vue') },
      { path: '/rpci/analysis', component: () => import('@/views/rPCI/rPCIAnalyzeResultView.vue') },
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
