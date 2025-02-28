<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'select-option', option: string): void;
}>();

const options = [
  {
    id: 'simplify',
    icon: '🔍',
    title: 'Simplify It',
    description: 'Summarisdfsdfsvbbbbvvbbdffdsdfsdfsdze this concept for me'
  },
  {
    id: 'quiz',
    icon: '❓',
    title: 'Quiz Me',
    description: 'Test my knowledge on this topic with questions'
  },
  {
    id: 'study',
    icon: '📚',
    title: 'Study Buddy',
    description: 'Assist me in preparing for my test'
  },
  {
    id: 'explain',
    icon: '😊',
    title: 'Explain Like I\'m 5',
    description: 'Simplify complex concepts as if explaining to a child'
  }
];

const handleOptionClick = (option: string) => {
  emit('select-option', option);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 h-full">
    <!-- UNA AI Avatar and Title -->
    <div class="flex flex-col items-center mb-12">
      <img src="/una-ai-avatar.png" alt="UNA AI Assistant" class="w-32 h-32 mb-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">UNA AI Assistant</h1>
    </div>
    
    <!-- Quick Action Options -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      <div 
        v-for="option in options" 
        :key="option.id"
        class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow transition-all cursor-pointer"
        @click="handleOptionClick(option.id)"
      >
        <div class="flex items-start">
          <div class="text-3xl mr-3">{{ option.icon }}</div>
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">{{ option.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ option.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input Hint -->
    <p class="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
      Or type your own question below to get started
    </p>
  </div>
</template>