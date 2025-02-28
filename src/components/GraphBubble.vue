<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Plotly from 'plotly.js-dist-min';

const props = defineProps<{
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  darkMode?: boolean;
}>();

const plotContainer = ref<HTMLElement | null>(null);

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const extractEquations = (content: string) => {
  const regex = /\[GRAPH\]([\s\S]+?)\[\/GRAPH\]/g;
  const equations = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    equations.push(match[1].trim());
  }
  return equations;
};

const evaluateExpression = (expression: string, x: number): number | null => {
  try {
    const sanitizedExpr = expression
      .replace(/\s+/g, '')
      .replace(/([0-9])x/g, '$1*x')
      .replace(/x\^(\d+)/g, 'Math.pow(x,$1)')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![a-zA-Z])/g, 'Math.E');

    const evalFn = new Function('x', `
      try {
        with (Math) {
          return ${sanitizedExpr};
        }
      } catch (e) {
        return null;
      }
    `);
    const result = evalFn(x);
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch (err) {
    console.error('Expression evaluation error:', err);
    return null;
  }
};

const getLineColors = (isDark: boolean) => [
  isDark ? '#60A5FA' : '#2563EB',
  isDark ? '#F87171' : '#DC2626',
  isDark ? '#34D399' : '#059669',
  isDark ? '#A78BFA' : '#7C3AED',
  isDark ? '#FB923C' : '#EA580C',
];

const generatePlotData = (equations: string[], isDark: boolean) => {
  const xValues = Array.from({ length: 200 }, (_, i) => (i - 100) / 10);
  const colors = getLineColors(isDark);
  return equations.map((eq, index) => {
    const yValues = xValues.map(x => evaluateExpression(eq, x));
    return {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      line: { width: 3, color: colors[index % colors.length] },
      name: `Graph ${index + 1}: ${eq}`
    };
  });
};

const createPlot = () => {
  if (!plotContainer.value) return;
  plotContainer.value.innerHTML = '';
  const equations = extractEquations(props.content);
  if (!equations.length) return;
  const traces = generatePlotData(equations, props.darkMode || false);
  const layout = {
    title: {
      text: 'Graph Visualization',
      font: { color: props.darkMode ? '#E5E7EB' : '#111827', size: 16 }
    },
    xaxis: { 
      title: 'x-axis',
      zeroline: true,
      gridcolor: props.darkMode ? '#374151' : '#E5E7EB',
      zerolinecolor: props.darkMode ? '#9CA3AF' : '#4B5563',
      zerolinewidth: 2,
      tickfont: { color: props.darkMode ? '#E5E7EB' : '#111827', size: 12 }
    },
    yaxis: { 
      title: 'y-axis',
      zeroline: true,
      gridcolor: props.darkMode ? '#374151' : '#E5E7EB',
      zerolinecolor: props.darkMode ? '#9CA3AF' : '#4B5563',
      zerolinewidth: 2,
      tickfont: { color: props.darkMode ? '#E5E7EB' : '#111827', size: 12 }
    },
    paper_bgcolor: props.darkMode ? '#1F2937' : '#F3F4F6',
    plot_bgcolor: props.darkMode ? '#1F2937' : '#F3F4F6',
    font: { color: props.darkMode ? '#E5E7EB' : '#111827', size: 12 },
    showlegend: true,
    legend: {
      font: { color: props.darkMode ? '#E5E7EB' : '#111827', size: 12 },
      bgcolor: 'transparent'
    },
    margin: { l: 20, r: 20, t: 40, b: 40 }
  };
  Plotly.newPlot(plotContainer.value, traces, layout, {
    responsive: true,
    displayModeBar: false
  });
};

watch([() => props.darkMode, () => props.content], () => {
  setTimeout(createPlot, 0);
}, { immediate: true });

onMounted(() => { createPlot(); });
onUnmounted(() => { if (plotContainer.value) Plotly.purge(plotContainer.value); });
</script>

<template>
  <div :class="['w-full mb-4 px-4', props.sender === 'user' ? 'flex justify-end' : 'flex justify-start']">
    <div :class="[
      'max-w-[85%] rounded-lg p-4 shadow-sm',
      props.sender === 'assistant'
        ? (props.darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200')
        : (props.darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
    ]">
      <div class="flex justify-between items-center mb-2">
        <span :class="['text-xs', props.darkMode ? 'text-gray-400' : 'text-gray-500']">{{ props.sender }}</span>
        <span :class="['text-xs', props.darkMode ? 'text-gray-400' : 'text-gray-500']">{{ formatTime(props.timestamp) }}</span>
      </div>
      <div ref="plotContainer" class="w-full h-80 mt-4"></div>
    </div>
  </div>
</template>

<style scoped>
.js-plotly-plot .plotly .modebar {
  opacity: 0.3;
  transition: opacity 0.2s;
}
.js-plotly-plot .plotly .modebar:hover {
  opacity: 1;
}
</style>
