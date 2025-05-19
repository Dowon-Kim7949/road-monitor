<template>
  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 relative cursor-pointer" @dragover.prevent
    @drop.prevent="onDrop" @click="selectFiles">
    <div class="text-center">
      <div v-if="files.length === 0">
        <p class="text-gray-500 mb-4">파일을 드래그하거나 클릭하여 업로드하세요</p>
        <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click.stop="selectFiles">
          파일 선택
        </button>
      </div>
      <div v-else>
        <p class="text-gray-700 mb-4">{{ files.length }}개의 파일 선택됨</p>
        <ul class="max-h-60 overflow-y-auto text-left mb-4">
          <li v-for="(file, idx) in files" :key="idx" class="flex items-center justify-between py-1">
            <span class="text-sm text-gray-800">
              {{ idx + 1 }}. {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
            </span>
            <button type="button" class="text-red-500 hover:text-red-700" @click.stop="removeFile(idx)">
              ✕
            </button>
          </li>
        </ul>
        <ul class="mb-4">
          <li v-for="(pct, idx) in progress" :key="idx" class="mb-2">
            <div v-if="pct >= 0" class="w-full bg-gray-200 rounded h-2">
              <div class="h-2 bg-blue-600 rounded" :style="{ width: pct + '%' }"></div>
            </div>
          </li>
        </ul>
        <div class="flex justify-center space-x-4">
          <button type="button" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            @click.stop="resetFiles">
            초기화
          </button>
          <button type="button" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            @click="startUpload">
            업로드 시작
          </button>
        </div>
      </div>
    </div>
    <input type="file" ref="fileInput" multiple webkitdirectory directory accept="image/*,.txt,.json" class="hidden"
      @change="onFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

type FileItem = File

const fileInput = ref<HTMLInputElement | null>(null)
const files = reactive<FileItem[]>([])
const progress = reactive<number[]>([])
const uploadUrl = '/api/upload' // 실제 엔드포인트로 변경

const selectFiles = (): void => {
  fileInput.value?.click()
}

const onFileSelect = (event: Event): void => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  addFiles(Array.from(input.files))
  input.value = ''
}

const onDrop = (event: DragEvent): void => {
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (newFiles: File[]): void => {
  const allowed = newFiles.filter((file) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    return file.type.startsWith('image/') || ext === 'txt' || ext === 'json'
  })
  allowed.forEach((file) => {
    files.push(file)
    progress.push(-1)
  })
}

const removeFile = (idx: number): void => {
  files.splice(idx, 1)
  progress.splice(idx, 1)
}

const resetFiles = (): void => {
  files.splice(0, files.length)
  progress.splice(0, progress.length)
}

const startUpload = async (): Promise<void> => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const form = new FormData()
    form.append('file', file)
    progress[i] = 0
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: form,
      })
      if (response.ok) {
        progress[i] = 100
      } else {
        progress[i] = 0
        console.error('Upload failed', response.statusText)
      }
    } catch (error) {
      console.error('Upload error', error)
      progress[i] = 0
    }
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
