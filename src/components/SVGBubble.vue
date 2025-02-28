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

const svgContent = computed(() => {
  const svgMatch = props.content.match(/\[SVG\]([\s\S]*?)\[\/SVG\]/);
  return svgMatch ? svgMatch[1].trim() : null;
});

const description = computed(() => {
  return props.content.replace(/\[SVG\][\s\S]*?\[\/SVG\]/, '').trim();
});

const processedSvgContent = computed(() => {
  if (!svgContent.value) return null;
  return svgContent.value
    .replace(/<svg/, '<svg class="geometric-diagram"')
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
      <div v-if="processedSvgContent" class="w-full flex justify-center my-4 geometric-diagram-container" v-html="processedSvgContent"></div>
    </div>
  </div>
</template>

<style scoped>
.geometric-diagram-container {
  max-width: 100%;
  overflow: visible;
}
:deep(.geometric-diagram) {
  max-width: 100%;
  height: auto;
  overflow: visible;
}
:deep(.geometric-diagram text) {
  font-size: 14px;
  font-family: Inter, system-ui, sans-serif;
}
:deep(.geometric-diagram line),
:deep(.geometric-diagram circle),
:deep(.geometric-diagram rect),
:deep(.geometric-diagram path) {
  vector-effect: non-scaling-stroke;
  stroke-width: 2;
}
:deep(.geometric-diagram .label) {
  fill: v-bind("props.darkMode ? '#E5E7EB' : '#374151'");
  font-size: 12px;
}
:deep(.geometric-diagram .axis) {
  stroke: v-bind("props.darkMode ? '#4B5563' : '#9CA3AF'");
  stroke-width: 2;
}
:deep(.geometric-diagram .grid) {
  stroke: v-bind("props.darkMode ? '#374151' : '#E5E7EB'");
  stroke-width: 1;
}
</style>
