<script setup lang="ts">
import { ref } from 'vue';
import { 
  QuestionMarkCircleIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  question: string;
  options: string[];
  correctAnswer: string;
  darkMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', option: string, isCorrect: boolean): void;
  (e: 'clarify'): void;
  (e: 'reveal'): void;
}>();

const selectedOption = ref<string | null>(null);
const hasSubmitted = ref(false);

const handleOptionSelect = (option: string) => {
  if (hasSubmitted.value) return;
  selectedOption.value = option;
};

const handleSubmit = () => {
  if (!selectedOption.value || hasSubmitted.value) return;
  
  hasSubmitted.value = true;
  const isCorrect = selectedOption.value === props.correctAnswer;
  emit('select', selectedOption.value, isCorrect);
};

const isOptionCorrect = (option: string): boolean => {
  return hasSubmitted.value && option === props.correctAnswer;
};

const isOptionIncorrect = (option: string): boolean => {
  return hasSubmitted.value && selectedOption.value === option && option !== props.correctAnswer;
};

const getOptionClass = (option: string) => {
  if (isOptionCorrect(option)) {
    return 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500';
  }
  if (isOptionIncorrect(option)) {
    return 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500';
  }
  if (selectedOption.value === option) {
    return 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500';
  }
  return 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700';
};
</script>

<template>
  <div class="w-full mb-4 px-4 flex justify-start">
    <div :class="[
      'w-full rounded-lg p-4 shadow-sm',
      props.darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    ]">
      <div class="flex flex-col">
        <h3 :class="['text-lg font-semibold mb-4', props.darkMode ? 'text-white' : 'text-gray-900']">
          {{ question }}
        </h3>
        
        <div class="space-y-2 mb-6">
          <button
            v-for="option in options"
            :key="option"
            :class="[
              'w-full text-left p-3 rounded-lg border transition-colors flex items-center',
              getOptionClass(option),
              props.darkMode ? 'text-gray-200' : 'text-gray-800'
            ]"
            @click="handleOptionSelect(option)"
            :disabled="hasSubmitted"
          >
            <CheckCircleIcon v-if="isOptionCorrect(option)" class="h-5 w-5 text-green-500 mr-2" />
            <XCircleIcon v-else-if="isOptionIncorrect(option)" class="h-5 w-5 text-red-500 mr-2" />
            <div v-else class="h-5 w-5 mr-2"></div>
            <span>{{ option }}</span>
          </button>
        </div>
        
        <div class="flex justify-between">
          <div class="flex gap-2">
            <button
              class="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              @click="emit('clarify')"
            >
              <QuestionMarkCircleIcon class="h-5 w-5" />
              <span>Clarify</span>
            </button>
            <button
              class="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              @click="emit('reveal')"
            >
              <EyeIcon class="h-5 w-5" />
              <span>Reveal</span>
            </button>
          </div>
          
          <button
            v-if="!hasSubmitted"
            class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleSubmit"
            :disabled="!selectedOption"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>