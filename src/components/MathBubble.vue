<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { typeset } from '../services/mathRenderer';

const props = defineProps<{
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  darkMode?: boolean;
}>();

const contentRef = ref<HTMLElement | null>(null);
const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// Extract math content from the message
const mathContent = computed(() => {
  const match = props.content.match(/\[MATH\]([\s\S]*?)\[\/MATH\]/);
  return match ? match[1].trim() : '';
});

// Get the description text (everything except the math content)
const description = computed(() => {
  return props.content.replace(/\[MATH\][\s\S]*?\[\/MATH\]/, '').trim();
});

// Trigger math typesetting when content changes
watch(() => props.content, async () => {
  await nextTick();
  typeset(contentRef.value);
}, { immediate: true });

onMounted(async () => {
  typeset(contentRef.value);
});
</script>

<template>
  <div :class="['w-full mb-4 px-4', props.sender === 'user' ? 'flex justify-end' : 'flex justify-start']">
    <div :class="[
      'w-full max-w-[85%] rounded-lg p-4 shadow-sm',
      props.sender === 'assistant'
        ? (props.darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200')
        : (props.darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
    ]">
      <div class="flex justify-between items-center mb-2">
        <span :class="['text-xs', props.darkMode ? 'text-gray-400' : 'text-gray-500']">{{ props.sender }}</span>
        <span :class="['text-xs', props.darkMode ? 'text-gray-400' : 'text-gray-500']">{{ formatTime(props.timestamp) }}</span>
      </div>
      <div v-if="description" class="prose max-w-none break-words mb-3" :class="props.darkMode ? 'dark' : ''">
        <p :class="props.darkMode ? 'text-white' : 'text-gray-900'">{{ description }}</p>
      </div>
      <div ref="contentRef" class="math-content w-full" v-html="mathContent"></div>
    </div>
  </div>
</template>

<style>
.math-content {
  overflow-x: auto;
  padding: 0.5rem 0;
}

/* Dark mode support for math rendering */
.dark mjx-container {
  color: #E5E7EB !important;
}

.dark .katex {
  color: #E5E7EB !important;
}

.dark .katex .katex-html {
  color: #E5E7EB !important;
}
</style>