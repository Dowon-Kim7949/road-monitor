<template>
  <RHeader />
  <div>
    Contents
  </div>
  <div>
    <RCalendar />
  </div>
  <!-- <div>
    <RBadge />
  </div>
  <div>
    <RBreadcrumb />
  </div>
  <div>
    <RButton />
  </div>
  <div>
    <RCarousel />
  </div>
  <div>
    <RChart />
  </div>
  <div>
    <RCheckbox />
  </div>
  <div>
    <RDatePicker />
  </div>
  <div>
    <RMap />
  </div>
  <div>
    <RModal />
  </div>
  <div>
    <RPagination />
  </div>
  <div>
    <RPhotoView />
  </div>
  <div>
    <RRadio />
  </div>
  <div>
    <RSelect />
  </div>
  <div>
    <RSidebar />
  </div>
  <div>
    <RSpinner />
  </div>
  <div>
    <RStepIndicator />
  </div>
  <div>
    <RTab />
  </div>
  <div>
    <RTable />
  </div>
  <div>
    <RTag />
  </div>
  <div>
    <RTextarea />
  </div>
  <div>
    <RTextInput />
  </div>
  <div>
    <RToggleSwitch />
  </div>
  <div>
    <RTooltip />
  </div> -->
  <RFooter />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const RBadge = defineAsyncComponent(() => import('@/components/common/RBadge.vue'))
const RBreadcrumb = defineAsyncComponent(() => import('@/components/common/RBreadcrumb.vue'))
const RButton = defineAsyncComponent(() => import('@/components/common/RButton.vue'))
const RCalendar = defineAsyncComponent(() => import('@/components/common/RCalendar.vue'))
const RCarousel = defineAsyncComponent(() => import('@/components/common/RCarousel.vue'))
const RChart = defineAsyncComponent(() => import('@/components/common/RChart.vue'))
const RCheckbox = defineAsyncComponent(() => import('@/components/common/RCheckbox.vue'))
const RDatePicker = defineAsyncComponent(() => import('@/components/common/RDatePicker.vue'))
const RFooter = defineAsyncComponent(() => import('@/components/common/RFooter.vue'))
const RHeader = defineAsyncComponent(() => import('@/components/common/RHeader.vue'))
const RMap = defineAsyncComponent(() => import('@/components/common/RMap.vue'))
const RModal = defineAsyncComponent(() => import('@/components/common/RModal.vue'))
const RPagination = defineAsyncComponent(() => import('@/components/common/RPagination.vue'))
const RPhotoView = defineAsyncComponent(() => import('@/components/common/RPhotoView.vue'))
const RRadio = defineAsyncComponent(() => import('@/components/common/RRadio.vue'))
const RSelect = defineAsyncComponent(() => import('@/components/common/RSelect.vue'))
const RSidebar = defineAsyncComponent(() => import('@/components/common/RSidebar.vue'))
const RSpinner = defineAsyncComponent(() => import('@/components/common/RSpinner.vue'))
const RStepIndicator = defineAsyncComponent(() => import('@/components/common/RStepIndicator.vue'))
const RTab = defineAsyncComponent(() => import('@/components/common/RTab.vue'))
const RTable = defineAsyncComponent(() => import('@/components/common/RTable.vue'))
const RTag = defineAsyncComponent(() => import('@/components/common/RTag.vue'))
const RTextarea = defineAsyncComponent(() => import('@/components/common/RTextarea.vue'))
const RTextInput = defineAsyncComponent(() => import('@/components/common/RTextInput.vue'))
const RToggleSwitch = defineAsyncComponent(() => import('@/components/common/RToggleSwitch.vue'))
const RTooltip = defineAsyncComponent(() => import('@/components/common/RTooltip.vue'))
</script>
