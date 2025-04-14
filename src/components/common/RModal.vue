<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  title: string
  content: string
  type?: 'alert' | 'confirm'
  okText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'onOk'): void
  (e: 'onClose'): void
  (e: 'onConfirm'): void
  (e: 'onCancel'): void
}>()

const showConfirm = computed(() => props.type === 'confirm')

const okLabel = computed(() => props.okText || '확인')
const cancelLabel = computed(() => props.cancelText || '취소')
const dangerStyle = computed(() =>
  props.danger
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white'
)
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center"
        @keydown.esc="$emit('onClose')">
        <div role="dialog" aria-modal="true" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-[9999]">
          <!-- Title -->
          <h3 class="text-lg font-bold text-black dark:text-white mb-3">
            {{ title }}
          </h3>

          <!-- Content -->
          <p class="text-sm text-gray-700 dark:text-gray-200 mb-5">
            {{ content }}
          </p>

          <!-- Buttons -->
          <div class="flex justify-end gap-2">
            <template v-if="showConfirm">
              <button type="button"
                class="px-4 py-2 text-sm rounded border bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                @click="$emit('onCancel')">
                {{ cancelLabel }}
              </button>
              <button type="button" class="px-4 py-2 text-sm rounded" :class="dangerStyle" @click="$emit('onConfirm')">
                {{ okLabel }}
              </button>
            </template>

            <template v-else>
              <button type="button"
                class="px-4 py-2 text-sm rounded cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                @click="$emit('onOk')">
                {{ okLabel }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
