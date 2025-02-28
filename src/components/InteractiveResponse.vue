<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  QuestionMarkCircleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  darkMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select-option', option: string, value: string): void;
  (e: 'select-quiz-option', option: string, value: string): void;
  (e: 'quiz-action', action: string): void;
}>();

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Extract the interactive content from the message
const interactiveData = computed(() => {
  try {
    // Check for feedback
    const feedbackMatch = props.content.match(/\[FEEDBACK\]([\s\S]*?)\[\/FEEDBACK\]/);
    if (feedbackMatch) {
      const data = JSON.parse(feedbackMatch[1]);
      return { type: 'feedback', data };
    }
    
    // Check for options
    const optionsMatch = props.content.match(/\[OPTIONS\]([\s\S]*?)\[\/OPTIONS\]/);
    if (optionsMatch) {
      const data = JSON.parse(optionsMatch[1]);
      return { type: 'options', data };
    }
    
    // Check for quiz
    const quizMatch = props.content.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
    if (quizMatch) {
      const data = JSON.parse(quizMatch[1]);
      return { type: 'quiz', data };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing interactive content:', error);
    return null;
  }
});

// Get the regular text content (excluding interactive elements)
const textContent = computed(() => {
  let content = props.content;
  
  // Remove all interactive elements
  content = content.replace(/\[FEEDBACK\][\s\S]*?\[\/FEEDBACK\]/g, '');
  content = content.replace(/\[OPTIONS\][\s\S]*?\[\/OPTIONS\]/g, '');
  content = content.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/g, '');
  
  return content.trim();
});

// For feedback and options
const selectedOption = ref<string | null>(null);

// For quiz
const selectedQuizOption = ref<string | null>(null);

const handleOptionSelect = (option: string, value: string) => {
  selectedOption.value = option;
  emit('select-option', option, value);
};

const handleQuizOptionSelect = (option: string, value: string) => {
  selectedQuizOption.value = option;
  emit('select-quiz-option', option, value);
};

const handleQuizAction = (action: string) => {
  emit('quiz-action', action);
};
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
        <span :class="['text-xs', props.sender === 'user' ? 'text-white' : (props.darkMode ? 'text-gray-400' : 'text-gray-500')]">{{ props.sender }}</span>
        <span :class="['text-xs', props.sender === 'user' ? 'text-white' : (props.darkMode ? 'text-gray-400' : 'text-gray-500')]">{{ formatTime(props.timestamp) }}</span>
      </div>
      
      <!-- Regular text content -->
      <div v-if="textContent" class="prose max-w-none break-words mb-3 chat-content" :class="[props.darkMode ? 'dark' : '', props.sender === 'user' ? 'text-white' : '']" v-html="textContent"></div>
      
      <!-- Interactive content based on type -->
      <div v-if="interactiveData" class="mt-4">
        <!-- Feedback type -->
        <div v-if="interactiveData.type === 'feedback'" class="interactive-feedback">
          <p :class="[props.darkMode ? 'text-white' : 'text-gray-900', 'mb-3']">{{ interactiveData.data.message }}</p>
          
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in interactiveData.data.options"
              :key="option.value"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedOption === option.label
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              ]"
              @click="handleOptionSelect(option.label, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        
        <!-- Options type -->
        <div v-else-if="interactiveData.type === 'options'" class="interactive-options">
          <p :class="[props.darkMode ? 'text-white' : 'text-gray-900', 'mb-3']">{{ interactiveData.data.message }}</p>
          
          <div class="space-y-2">
            <div
              v-for="option in interactiveData.data.options"
              :key="option.value"
              :class="[
                'flex items-center p-3 rounded-lg border transition-colors cursor-pointer',
                selectedOption === option.label
                  ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
              ]"
              @click="handleOptionSelect(option.label, option.value)"
            >
              <div class="flex items-center h-5">
                <input
                  type="radio"
                  :id="`option-${option.value}`"
                  :name="'options'"
                  :value="option.value"
                  :checked="selectedOption === option.label"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  @change="handleOptionSelect(option.label, option.value)"
                />
              </div>
              <label :for="`option-${option.value}`" class="ml-3 block text-sm font-medium" :class="props.darkMode ? 'text-gray-200' : 'text-gray-700'">
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>
        
        <!-- Quiz type -->
        <div v-else-if="interactiveData.type === 'quiz'" class="interactive-quiz">
          <p :class="[props.darkMode ? 'text-white' : 'text-gray-900', 'mb-3 font-medium']">{{ interactiveData.data.question }}</p>
          
          <div class="space-y-2 mb-4">
            <div
              v-for="option in interactiveData.data.options"
              :key="option.value"
              :class="[
                'flex items-center p-3 rounded-lg border transition-colors cursor-pointer',
                selectedQuizOption === option.label
                  ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
              ]"
              @click="handleQuizOptionSelect(option.label, option.value)"
            >
              <div class="flex items-center h-5">
                <input
                  type="radio"
                  :id="`quiz-option-${option.value}`"
                  :name="'quiz-options'"
                  :value="option.value"
                  :checked="selectedQuizOption === option.label"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  @change="handleQuizOptionSelect(option.label, option.value)"
                />
              </div>
              <label :for="`quiz-option-${option.value}`" class="ml-3 block text-sm font-medium" :class="props.darkMode ? 'text-gray-200' : 'text-gray-700'">
                {{ option.label }}
              </label>
            </div>
          </div>
          
          <!-- Quiz actions -->
          <div v-if="interactiveData.data.actions" class="flex flex-wrap gap-2">
            <button
              v-for="action in interactiveData.data.actions"
              :key="action.value"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              ]"
              @click="handleQuizAction(action.value)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interactive-feedback,
.interactive-options,
.interactive-quiz {
  border-top: 1px solid;
  @apply pt-3 border-gray-200 dark:border-gray-700;
}
</style>