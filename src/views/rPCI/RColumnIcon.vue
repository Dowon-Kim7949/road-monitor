<template>
  <span v-if="sortColumn === column">
    <RIcon v-if="sortDirection === 'asc'" name="ChevronDown" />
    <RIcon v-else name="ChevronUp" />
  </span>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import RIcon from '@/components/common/atom/RIcon.vue'

defineProps({
  column: {
    type: String,
    required: true,
  },
  sortColumn: {
    type: String,
    default: null,
  },
  sortDirection: {
    type: String,
    validator: (value: string) => ['asc', 'desc'].includes(value),
    default: 'asc',
  },
});
</script>
