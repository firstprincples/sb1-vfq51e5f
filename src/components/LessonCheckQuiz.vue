<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  QuestionMarkCircleIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline';
import type { Quiz, QuizQuestion } from '../types';

const props = defineProps<{
  quiz: Quiz;
  darkMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'complete', score: number, totalQuestions: number): void;
  (e: 'clarify', questionText: string): void;
}>();

const currentQuestionIndex = ref(0);
const selectedOptions = ref<(string | null)[]>(Array(props.quiz.questions.length).fill(null));
const submittedQuestions = ref<Set<number>>(new Set());

const currentQuestion = computed<QuizQuestion>(() => {
  return props.quiz.questions[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === props.quiz.questions.length - 1;
});

const isFirstQuestion = computed(() => {
  return currentQuestionIndex.value === 0;
});

const hasSelectedOption = computed(() => {
  return selectedOptions.value[currentQuestionIndex.value] !== null;
});

const hasSubmittedCurrent = computed(() => {
  return submittedQuestions.value.has(currentQuestionIndex.value);
});

const isQuizComplete = computed(() => {
  return submittedQuestions.value.size === props.quiz.questions.length;
});

const score = computed(() => {
  let correctCount = 0;
  props.quiz.questions.forEach((question, index) => {
    if (submittedQuestions.value.has(index)) {
      const selectedOption = selectedOptions.value[index];
      const correctOption = question.options[question.correctOptionIndex];
      if (selectedOption === correctOption) {
        correctCount++;
      }
    }
  });
  return correctCount;
});

const handleOptionSelect = (option: string) => {
  if (hasSubmittedCurrent.value) return;
  selectedOptions.value[currentQuestionIndex.value] = option;
};

const handleSubmit = () => {
  if (!hasSelectedOption.value || hasSubmittedCurrent.value) return;
  
  submittedQuestions.value.add(currentQuestionIndex.value);
  
  if (isQuizComplete.value) {
    emit('complete', score.value, props.quiz.questions.length);
  }
};

const handleNextQuestion = () => {
  if (isLastQuestion.value) return;
  currentQuestionIndex.value++;
};

const handlePreviousQuestion = () => {
  if (isFirstQuestion.value) return;
  currentQuestionIndex.value--;
};

const handleClarify = () => {
  emit('clarify', currentQuestion.value.questionText);
};

const isOptionCorrect = (option: string): boolean => {
  if (!hasSubmittedCurrent.value) return false;
  return option === currentQuestion.value.options[currentQuestion.value.correctOptionIndex];
};

const isOptionIncorrect = (option: string): boolean => {
  if (!hasSubmittedCurrent.value) return false;
  const selectedOption = selectedOptions.value[currentQuestionIndex.value];
  return selectedOption === option && !isOptionCorrect(option);
};

const getOptionClass = (option: string) => {
  if (isOptionCorrect(option)) {
    return 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500';
  }
  if (isOptionIncorrect(option)) {
    return 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500';
  }
  if (selectedOptions.value[currentQuestionIndex.value] === option) {
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
        <!-- Quiz Title -->
        <h2 :class="['text-xl font-bold mb-2', props.darkMode ? 'text-white' : 'text-gray-900']">
          {{ props.quiz.quizTitle }}
        </h2>
        
        <!-- Progress Indicator -->
        <div class="flex items-center justify-between mb-4">
          <span :class="['text-sm', props.darkMode ? 'text-gray-300' : 'text-gray-600']">
            Question {{ currentQuestionIndex + 1 }} of {{ props.quiz.questions.length }}
          </span>
          <span :class="['text-sm', props.darkMode ? 'text-gray-300' : 'text-gray-600']">
            Score: {{ score }} / {{ submittedQuestions.size }}
          </span>
        </div>
        
        <!-- Question -->
        <h3 :class="['text-lg font-semibold mb-4', props.darkMode ? 'text-white' : 'text-gray-900']">
          {{ currentQuestion.questionText }}
        </h3>
        
        <!-- Options -->
        <div class="space-y-2 mb-6">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="[
              'w-full text-left p-3 rounded-lg border transition-colors flex items-center',
              getOptionClass(option),
              props.darkMode ? 'text-gray-200' : 'text-gray-800'
            ]"
            @click="handleOptionSelect(option)"
            :disabled="hasSubmittedCurrent"
          >
            <CheckCircleIcon v-if="isOptionCorrect(option)" class="h-5 w-5 text-green-500 mr-2" />
            <XCircleIcon v-else-if="isOptionIncorrect(option)" class="h-5 w-5 text-red-500 mr-2" />
            <div v-else class="h-5 w-5 mr-2"></div>
            <span>{{ option }}</span>
          </button>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-between">
          <div class="flex gap-2">
            <button
              class="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              @click="handleClarify"
            >
              <QuestionMarkCircleIcon class="h-5 w-5" />
              <span>Clarify</span>
            </button>
          </div>
          
          <div class="flex gap-2">
            <button
              v-if="!isFirstQuestion"
              class="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              @click="handlePreviousQuestion"
            >
              <ArrowLeftIcon class="h-5 w-5" />
              <span>Previous</span>
            </button>
            
            <button
              v-if="!hasSubmittedCurrent"
              class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleSubmit"
              :disabled="!hasSelectedOption"
            >
              Submit
            </button>
            
            <button
              v-if="hasSubmittedCurrent && !isLastQuestion"
              class="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              @click="handleNextQuestion"
            >
              <span>Next</span>
              <ArrowRightIcon class="h-5 w-5" />
            </button>
            
            <button
              v-if="isQuizComplete"
              class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <span>Complete</span>
            </button>
          </div>
        </div>
        
        <!-- Feedback after submission -->
        <div v-if="hasSubmittedCurrent" class="mt-4 p-4 rounded-lg" :class="[
          props.darkMode ? 'bg-gray-700' : 'bg-gray-100',
          props.darkMode ? 'text-white' : 'text-gray-800'
        ]">
          <p v-if="isOptionCorrect(selectedOptions[currentQuestionIndex])" class="text-green-600 dark:text-green-400 font-medium">
            Correct! Well done.
          </p>
          <p v-else class="text-red-600 dark:text-red-400 font-medium">
            Not quite right. The correct answer is: {{ currentQuestion.options[currentQuestion.correctOptionIndex] }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>