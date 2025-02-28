<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick, computed } from 'vue';
import {
  SpeakerWaveIcon,
  ClipboardDocumentIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{ 
  content: string; 
  sender: 'user' | 'assistant'; 
  timestamp: number; 
  darkMode?: boolean; 
  isThinking?: boolean;
}>();

const contentRef = ref<HTMLElement | null>(null);
const isCopied = ref(false);
const isReading = ref(false);
const isLiked = ref(false);
const isDisliked = ref(false);
const speechSynthesis = window.speechSynthesis;
let utterance: SpeechSynthesisUtterance | null = null;

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// Process content to remove quiz and multiple choice markers
const processedContent = computed(() => {
  let content = props.content;
  
  // Remove multiple choice question markers and JSON
  content = content.replace(/\[MULTIPLE_CHOICE\][\s\S]*?\[\/MULTIPLE_CHOICE\]/g, '');
  
  // Remove quiz markers and JSON
  content = content.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/g, '');
  
  // Trim any extra whitespace
  return content.trim();
});

const copyToClipboard = async () => {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent.value;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    await navigator.clipboard.writeText(textContent);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
};

const toggleReadAloud = () => {
  if (isReading.value) stopReading();
  else startReading();
};

const startReading = () => {
  if (!speechSynthesis) return;
  stopReading();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = processedContent.value;
  const textContent = tempDiv.textContent || tempDiv.innerText;
  utterance = new SpeechSynthesisUtterance(textContent);
  utterance.onend = () => { isReading.value = false; };
  isReading.value = true;
  speechSynthesis.speak(utterance);
};

const stopReading = () => {
  if (speechSynthesis) speechSynthesis.cancel();
  isReading.value = false;
};

const handleLike = () => {
  if (!isLiked.value && isDisliked.value) isDisliked.value = false;
  isLiked.value = !isLiked.value;
};

const handleDislike = () => {
  if (!isDisliked.value && isLiked.value) isLiked.value = false;
  isDisliked.value = !isDisliked.value;
};

onUnmounted(() => { stopReading(); });

// Trigger MathJax typesetting once content is updated
watch(() => processedContent.value, async () => {
  await nextTick();
  if (window.MathJax && contentRef.value) {
    try {
      await window.MathJax.typesetPromise([contentRef.value]);
    } catch (error) {
      console.error('MathJax typesetting error:', error);
    }
  }
});
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
        <span :class="['text-xs', props.sender === 'user' ? 'text-white' : (props.darkMode ? 'text-gray-400' : 'text-gray-500')]">{{ props.sender }}</span>
        <span :class="['text-xs', props.sender === 'user' ? 'text-white' : (props.darkMode ? 'text-gray-400' : 'text-gray-500')]">{{ formatTime(props.timestamp) }}</span>
      </div>
      <div ref="contentRef" class="prose max-w-none break-words mb-3 chat-content" :class="[props.darkMode ? 'dark' : '', props.sender === 'user' ? 'text-white' : '']" v-html="processedContent"></div>
      <div v-if="props.sender === 'assistant' && !props.isThinking" class="flex gap-4 mt-2 pt-2 border-t" :class="props.darkMode ? 'border-gray-700' : 'border-gray-200'">
        <button :class="[props.darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600', isReading ? 'text-blue-500' : '']" title="Read aloud" @click="toggleReadAloud">
          <SpeakerWaveIcon class="h-5 w-5" />
        </button>
        <button :class="[props.darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600', isCopied ? 'text-green-500' : '']" title="Copy to clipboard" @click="copyToClipboard">
          <component :is="isCopied ? ClipboardDocumentCheckIcon : ClipboardDocumentIcon" class="h-5 w-5" />
        </button>
        <button :class="[props.darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600', isLiked ? 'text-blue-500' : '']" title="Like" @click="handleLike">
          <HandThumbUpIcon class="h-5 w-5" />
        </button>
        <button :class="[props.darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600', isDisliked ? 'text-red-500' : '']" title="Dislike" @click="handleDislike">
          <HandThumbDownIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* Math styling */
.math-block {
  display: block;
  width: 100%;
  margin: 1rem 0;
  overflow-x: auto;
  text-align: center;
}

.math-inline {
  display: inline-block;
  vertical-align: middle;
}

/* Dark mode support for math rendering */
.dark .chat-content :deep(mjx-container) {
  color: #E5E7EB !important;
}

.dark .chat-content :deep(.katex) {
  color: #E5E7EB !important;
}

.dark .chat-content :deep(.katex .katex-html) {
  color: #E5E7EB !important;
}

/* User message styling */
.chat-content.text-white :deep(p),
.chat-content.text-white :deep(h1),
.chat-content.text-white :deep(h2),
.chat-content.text-white :deep(h3),
.chat-content.text-white :deep(h4),
.chat-content.text-white :deep(h5),
.chat-content.text-white :deep(h6),
.chat-content.text-white :deep(li),
.chat-content.text-white :deep(strong),
.chat-content.text-white :deep(em),
.chat-content.text-white :deep(blockquote),
.chat-content.text-white :deep(span),
.chat-content.text-white :deep(div) {
  color: white !important;
}

/* Thinking animation */
.thinking-dots::after {
  content: '';
  animation: thinking 1.5s infinite;
}

@keyframes thinking {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}
</style>