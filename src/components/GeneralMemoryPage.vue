<script setup lang="ts">
import { ref } from 'vue';
import MemoryManager from './MemoryManager.vue';
import type { Memory } from '../types';

const handleMemoryUpdate = (memory: Memory) => {
  // TODO: Implement memory update logic
  console.log('Memory updated:', memory);
};

const handleMemoryClear = () => {
  // TODO: Implement memory clear logic
  console.log('Memory cleared');
};
</script>

<template>
  <div class="flex flex-col w-full h-full bg-gray-50">
    <div class="flex items-center justify-between p-4 bg-white border-b">
      <h1 class="text-2xl font-semibold text-gray-900">General Memory Management</h1>
    </div>
    <div class="p-6 flex-1 overflow-auto">
      <MemoryManager
        :is-general="true"
        @update="handleMemoryUpdate"
        @clear="handleMemoryClear"
      />
    </div>
  </div>
</template>