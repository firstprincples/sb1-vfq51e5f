<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  darkMode?: boolean;
}>();

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const shapeContent = computed(() => {
  const match = props.content.match(/\[SHAPE\]([\s\S]*?)\[\/SHAPE\]/);
  return match ? match[1].trim() : null;
});

const description = computed(() => {
  return props.content.replace(/\[SHAPE\][\s\S]*?\[\/SHAPE\]/, '').trim();
});

const processedShapeContent = computed(() => {
  if (!shapeContent.value) return null;
  return shapeContent.value
    .replace(/<svg/, '<svg class="geometric-shape"')
    .replace(/stroke="[^"]*"/g, `stroke="${props.darkMode ? '#E5E7EB' : '#374151'}"`)
    .replace(/fill="[^"]*"/g, `fill="${props.darkMode ? '#E5E7EB' : '#374151'}"`)
    .replace(/font-family="[^"]*"/g, 'font-family="Inter, sans-serif"')
    .replace(/text-anchor="[^"]*"/g, 'text-anchor="middle"')
    .replace(/dominant-baseline="[^"]*"/g, 'dominant-baseline="middle"')
    .replace(/stroke-width="[^"]*"/g, 'stroke-width="2"')
    .replace(/vector-effect="[^"]*"/g, 'vector-effect="non-scaling-stroke"');
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
      <div v-if="description" class="prose max-w-none break-words mb-3">
        <p :class="props.darkMode ? 'text-white' : 'text-gray-900'">{{ description }}</p>
      </div>
      <div v-if="processedShapeContent" class="w-full flex justify-center my-4" v-html="processedShapeContent"></div>
    </div>
  </div>
</template>

<style scoped>
.geometric-shape {
  max-width: 100%;
  height: auto;
  overflow: visible;
}
</style>
