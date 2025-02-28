<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps<{
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  darkMode?: boolean;
}>();

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

const processedContent = computed(() => {
  let content = props.content.replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/g, '$1');
  return md.render(content);
});
</script>

<template>
  <div :class="['w-full mb-4 px-4', props.sender === 'user' ? 'flex justify-end' : 'flex justify-start']">
    <div :class="[
      'w-full max-w-[85%] rounded-lg p-4 shadow-sm',
      props.sender === 'assistant'
        ? props.darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        : props.darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
    ]">
      <div class="flex justify-between items-center mb-2">
        <span :class="['text-xs', props.darkMode ? 'text-gray-400' : 'text-gray-500']">{{ props.sender }}</span>
        <span :class="['text-xs', props.darkMode ? 'text-gray-400' : 'text-gray-500']">{{ formatTime(props.timestamp) }}</span>
      </div>
      <div class="prose max-w-none break-words mb-3" v-html="processedContent"></div>
    </div>
  </div>
</template>
