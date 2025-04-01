<template>
  <div class="space-y-2">
    <h3 class="text-lg font-semibold">Road History</h3>

    <!-- 📌 스크롤 가능한 영역 -->
    <div class="max-h-[240px] overflow-y-auto pr-1">
      <div v-for="(item, index) in items" :key="index"
        class="flex items-center space-x-4 cursor-pointer hover:bg-gray-30 p-2 rounded" @click="$emit('select', item)">
        <img :src="item.image || 'https://via.placeholder.com/120x72?text=No+Image'" alt="history"
          class="w-28 h-16 object-cover rounded" />
        <div class="text-sm text-gray-800 whitespace-nowrap">
          {{ item.timestamp }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: {
    image: string
    timestamp: string
    [key: string]: any
  }[]
}>()

defineEmits<{
  (e: 'select', item: any): void
}>()
</script>
