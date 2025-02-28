<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import { 
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  FaceSmileIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';
import ChatBubble from './ChatBubble.vue';
import MathBubble from './MathBubble.vue';
import GraphBubble from './GraphBubble.vue';
import TableBubble from './TableBubble.vue';
import SVGBubble from './SVGBubble.vue';
import GeometricShapeBubble from './GeometricShapeBubble.vue';
import MemoryModal from './MemoryModal.vue';
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue';
import LessonCheckQuiz from './LessonCheckQuiz.vue';
import WelcomeScreen from './WelcomeScreen.vue';
import InteractiveResponse from './InteractiveResponse.vue';
import type { Chat, Syllabus, ChatMessage, Memory, MultipleChoice, Quiz } from '../types';
import { sendLambdaRequest, createQuizFromLambdaFormat } from '../services/lambdaService';

const props = withDefaults(defineProps<{
  chat?: Chat | null;
  syllabus?: Syllabus | null;
}>(), {
  chat: () => ({
    id: 'default',
    title: 'New Chat',
    subtitle: '',
    messages: [],
    createdAt: Date.now(),
    initialMessage: 'Hi! I\'d love to learn more about math.'
  }),
  syllabus: null
});

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'update', syllabus: Syllabus): void;
}>();

const userMessage = ref('');
const messageTextarea = ref<HTMLTextAreaElement | null>(null);
const chatContainer = ref<HTMLElement | null>(null);
const localMessages = ref<ChatMessage[]>([]);
const isDarkMode = ref(false);
const isTyping = ref(false);
const showMemoryModal = ref(false);
const memoryType = ref<'syllabus' | 'general'>('syllabus');
const showFollowupButtons = ref(false);
const showMessageInput = ref(true);
const showContinueButton = ref(false);
const currentMultipleChoiceQuestion = ref<MultipleChoice | null>(null);
const currentQuiz = ref<Quiz | null>(null);
const showWelcomeScreen = ref(true);

// Mock memory data (replace with actual data in production)
const memories = ref<Memory[]>([
  {
    id: '1',
    type: 'long',
    content: 'User prefers visual explanations for mathematical concepts',
    timestamp: Date.now() - 86400000,
    source: 'general'
  },
  {
    id: '2',
    type: 'mid',
    content: 'Struggling with quadratic equations',
    timestamp: Date.now() - 43200000,
    source: 'syllabus',
    context: 'Grade 9 Mathematics'
  }
]);

const handleMemoryClear = () => {
  memories.value = [];
  showMemoryModal.value = false;
};

const handleMemoryDelete = (memoryId: string) => {
  memories.value = memories.value.filter(m => m.id !== memoryId);
};

const openMemoryModal = (type: 'syllabus' | 'general') => {
  memoryType.value = type;
  showMemoryModal.value = true;
};

const isGraphMessage = (content: string): boolean => /\[GRAPH\]/.test(content);
const isTableMessage = (content: string): boolean => /\[TABLE\]/.test(content);
const isSVGMessage = (content: string): boolean => /\[SVG\]/.test(content);
const isMathMessage = (content: string): boolean => /\[MATH\]/.test(content);
const isShapeMessage = (content: string): boolean => /\[SHAPE\]/.test(content);
const isMultipleChoiceMessage = (content: string): boolean => /\[MULTIPLE_CHOICE\]/.test(content);
const isQuizMessage = (content: string): boolean => /\[QUIZ\]/.test(content);
const isFeedbackMessage = (content: string): boolean => /\[FEEDBACK\]/.test(content);
const isOptionsMessage = (content: string): boolean => /\[OPTIONS\]/.test(content);
const isInteractiveMessage = (content: string): boolean => {
  return isFeedbackMessage(content) || isOptionsMessage(content) || isQuizMessage(content);
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

watch(localMessages, async () => {
  await scrollToBottom();
}, { deep: true });

watch(() => props.chat, (newChat) => {
  localMessages.value = newChat ? [...(newChat.messages || [])] : [];
  // Only show welcome screen if there are no messages
  showWelcomeScreen.value = localMessages.value.length === 0;
}, { immediate: true });

const handleSendMessage = async (customMessage?: string) => {
  if ((!userMessage.value.trim() && !customMessage) || isTyping.value) return;
  
  const messageContent = customMessage || userMessage.value;
  
  // Hide welcome screen when sending a message
  showWelcomeScreen.value = false;
  
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    content: messageContent,
    sender: 'user',
    timestamp: Date.now()
  };
  
  localMessages.value = [...localMessages.value, newMessage];
  await scrollToBottom();
  const sentMessage = messageContent;
  userMessage.value = '';
  if (messageTextarea.value) messageTextarea.value.style.height = '44px';
  
  // Hide all UI controls while typing
  isTyping.value = true;
  showFollowupButtons.value = false;
  showContinueButton.value = false;
  showMessageInput.value = false;
  currentMultipleChoiceQuestion.value = null;
  currentQuiz.value = null;
  
  const thinkingMessageId = 'thinking-' + Date.now();
  localMessages.value.push({
    id: thinkingMessageId,
    content: 'Thinking...',
    sender: 'assistant',
    timestamp: Date.now(),
    isThinking: true
  });
  
  try {
    await sendLambdaRequest(sentMessage, (formattedContent) => {
      // Find the thinking message and update it
      const updatedMessages = [...localMessages.value];
      const thinkingIndex = updatedMessages.findIndex(msg => msg.id === thinkingMessageId);
      
      if (thinkingIndex !== -1) {
        updatedMessages[thinkingIndex] = {
          ...updatedMessages[thinkingIndex],
          content: formattedContent,
          isThinking: false
        };
        
        localMessages.value = updatedMessages;
        
        // Process the response based on its type
        if (isInteractiveMessage(formattedContent)) {
          showFollowupButtons.value = false;
          showContinueButton.value = false;
          showMessageInput.value = false;
        } else if (isQuizMessage(formattedContent)) {
          processQuizMessage(formattedContent);
        } else if (isMultipleChoiceMessage(formattedContent)) {
          processMultipleChoiceQuestion(formattedContent);
        } else {
          // For regular messages, show follow-up buttons
          showFollowupButtons.value = true;
          showContinueButton.value = true;
          showMessageInput.value = false;
        }
      }
    });
  } catch (error) {
    console.error('Error getting Lambda response:', error);
    const updatedMessages = [...localMessages.value];
    const thinkingIndex = updatedMessages.findIndex(msg => msg.id === thinkingMessageId);
    
    if (thinkingIndex !== -1) {
      updatedMessages[thinkingIndex] = {
        ...updatedMessages[thinkingIndex],
        content: 'Sorry, I encountered an error processing your request.',
        isThinking: false
      };
      
      localMessages.value = updatedMessages;
      
      // Show follow-up buttons even after error
      showFollowupButtons.value = true;
      showContinueButton.value = true;
      showMessageInput.value = false;
    }
  } finally {
    isTyping.value = false;
    
    // Update the syllabus with the new messages
    if (props.syllabus && props.chat) {
      const updatedChat = { 
        ...props.chat, 
        messages: localMessages.value 
      };
      
      const updatedSyllabus = {
        ...props.syllabus,
        chats: props.syllabus.chats.map(c => 
          c.id === props.chat?.id ? updatedChat : c
        )
      };
      
      emit('update', updatedSyllabus);
    }
  }
};

const processMultipleChoiceQuestion = (content: string) => {
  try {
    // Extract the multiple choice question data
    const match = content.match(/\[MULTIPLE_CHOICE\]([\s\S]*?)\[\/MULTIPLE_CHOICE\]/);
    if (match) {
      const questionData = JSON.parse(match[1]);
      currentMultipleChoiceQuestion.value = {
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation
      };
      
      // Hide follow-up buttons and show the multiple choice question
      showFollowupButtons.value = false;
      showContinueButton.value = false;
      showMessageInput.value = false;
    }
  } catch (error) {
    console.error('Error processing multiple choice question:', error);
  }
};

const processQuizMessage = (content: string) => {
  try {
    // Extract the quiz data
    const match = content.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
    if (match) {
      const quizData = JSON.parse(match[1]);
      currentQuiz.value = createQuizFromLambdaFormat(quizData);
      
      // Hide follow-up buttons and show the quiz
      showFollowupButtons.value = false;
      showContinueButton.value = false;
      showMessageInput.value = false;
    }
  } catch (error) {
    console.error('Error processing quiz message:', error);
  }
};

const handleExplainLikeImFive = () => {
  handleSendMessage("Explain the previous answer like I'm 5 years old");
};

const handleMoreDetail = () => {
  handleSendMessage("Please provide more details about your previous answer");
};

const handleAskQuestion = () => {
  showFollowupButtons.value = false;
  showContinueButton.value = false;
  showMessageInput.value = true;
};

const handleContinue = () => {
  handleSendMessage("Please continue with your explanation or give me a multiple choice question to test my understanding of this topic.");
};

const handleClarify = () => {
  if (currentMultipleChoiceQuestion.value) {
    handleSendMessage(`Can you clarify this question: "${currentMultipleChoiceQuestion.value.question}"?`);
  }
};

const handleQuizClarify = (questionText: string) => {
  handleSendMessage(`Can you clarify this question: "${questionText}"?`);
};

const handleReveal = () => {
  if (currentMultipleChoiceQuestion.value) {
    const correctAnswer = currentMultipleChoiceQuestion.value.correctAnswer;
    const explanation = currentMultipleChoiceQuestion.value.explanation;
    
    // Add the answer reveal as a new message from the assistant
    localMessages.value.push({
      id: Date.now().toString(),
      content: `The correct answer is: ${correctAnswer}. ${explanation}`,
      sender: 'assistant',
      timestamp: Date.now()
    });
    
    // Reset the multiple choice question
    currentMultipleChoiceQuestion.value = null;
    
    // Show follow-up buttons after revealing the answer
    showFollowupButtons.value = true;
    showContinueButton.value = true;
    showMessageInput.value = false;
  }
};

const handleOptionSelect = (selectedOption: string, isCorrect: boolean) => {
  // Add the user's selection as a message
  localMessages.value.push({
    id: Date.now().toString(),
    content: `I select: ${selectedOption}`,
    sender: 'user',
    timestamp: Date.now()
  });
  
  // Add the feedback as a message from the assistant
  if (isCorrect) {
    localMessages.value.push({
      id: Date.now().toString(),
      content: `That's correct! ${currentMultipleChoiceQuestion.value?.explanation || ''}`,
      sender: 'assistant',
      timestamp: Date.now()
    });
  } else {
    localMessages.value.push({
      id: Date.now().toString(),
      content: `That's not correct. The correct answer is: ${currentMultipleChoiceQuestion.value?.correctAnswer}. ${currentMultipleChoiceQuestion.value?.explanation || ''}`,
      sender: 'assistant',
      timestamp: Date.now()
    });
  }
  
  // Reset the multiple choice question
  currentMultipleChoiceQuestion.value = null;
  
  // Show follow-up buttons after answering
  showFollowupButtons.value = true;
  showContinueButton.value = true;
  showMessageInput.value = false;
};

const handleQuizComplete = (score: number, totalQuestions: number) => {
  // Add the quiz completion as a message from the assistant
  localMessages.value.push({
    id: Date.now().toString(),
    content: `You've completed the quiz! Your score: ${score}/${totalQuestions}`,
    sender: 'assistant',
    timestamp: Date.now()
  });
  
  // Reset the quiz
  currentQuiz.value = null;
  
  // Show follow-up buttons after completing the quiz
  showFollowupButtons.value = true;
  showContinueButton.value = true;
  showMessageInput.value = false;
};

const handleWelcomeOptionSelect = (option: string) => {
  let message = '';
  
  switch (option) {
    case 'simplify':
      message = 'Can you simplify and summarize the concept of matrices for me?';
      break;
    case 'quiz':
      message = 'Quiz me on matrices and linear algebra concepts';
      break;
    case 'study':
      message = 'I need help preparing for my math test on matrices and linear transformations';
      break;
    case 'explain':
      message = 'Explain matrices like I\'m 5 years old';
      break;
    default:
      message = 'Tell me about matrices';
  }
  
  handleSendMessage(message);
};

const handleInteractiveOptionSelect = (option: string, value: string) => {
  // Add the user's selection as a message
  localMessages.value.push({
    id: Date.now().toString(),
    content: `I select: ${option}`,
    sender: 'user',
    timestamp: Date.now()
  });
  
  // Send the selected value to the Lambda function
  handleSendMessage(value);
};

const handleInteractiveQuizOptionSelect = (option: string, value: string) => {
  // Add the user's selection as a message
  localMessages.value.push({
    id: Date.now().toString(),
    content: `I select: ${option}`,
    sender: 'user',
    timestamp: Date.now()
  });
  
  // Send the selected value to the Lambda function
  handleSendMessage(value);
};

const handleInteractiveQuizAction = (action: string) => {
  // Send the action to the Lambda function
  handleSendMessage(action);
};

const startInitialChat = async () => {
  if (props.chat?.initialMessage && localMessages.value.length === 0) {
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      content: props.chat.initialMessage,
      sender: 'user',
      timestamp: Date.now()
    };
    localMessages.value = [initialMessage];
    await scrollToBottom();
    isTyping.value = true;
    
    // Hide all UI controls while typing
    showFollowupButtons.value = false;
    showContinueButton.value = false;
    showMessageInput.value = false;
    showWelcomeScreen.value = false;
    
    const thinkingMessageId = 'thinking-' + Date.now();
    localMessages.value.push({
      id: thinkingMessageId,
      content: 'Thinking...',
      sender: 'assistant',
      timestamp: Date.now(),
      isThinking: true
    });
    
    try {
      await sendLambdaRequest(props.chat.initialMessage, (formattedContent) => {
        // Find the thinking message and update it
        const updatedMessages = [...localMessages.value];
        const thinkingIndex = updatedMessages.findIndex(msg => msg.id === thinkingMessageId);
        
        if (thinkingIndex !== -1) {
          updatedMessages[thinkingIndex] = {
            ...updatedMessages[thinkingIndex],
            content: formattedContent,
            isThinking: false
          };
          
          localMessages.value = updatedMessages;
          
          // Process the response based on its type
          if (isInteractiveMessage(formattedContent)) {
            showFollowupButtons.value = false;
            showContinueButton.value = false;
            showMessageInput.value = false;
          } else if (isQuizMessage(formattedContent)) {
            processQuizMessage(formattedContent);
          } else if (isMultipleChoiceMessage(formattedContent)) {
            processMultipleChoiceQuestion(formattedContent);
          } else {
            // For regular messages, show follow-up buttons
            showFollowupButtons.value = true;
            showContinueButton.value = true;
            showMessageInput.value = false;
          }
        }
      });
    } catch (error) {
      console.error('Error getting Lambda response:', error);
      const updatedMessages = [...localMessages.value];
      const thinkingIndex = updatedMessages.findIndex(msg => msg.id === thinkingMessageId);
      
      if (thinkingIndex !== -1) {
        updatedMessages[thinkingIndex] = {
          ...updatedMessages[thinkingIndex],
          content: 'Sorry, I encountered an error processing your request.',
          isThinking: false
        };
        
        localMessages.value = updatedMessages;
        
        // Show follow-up buttons even after error
        showFollowupButtons.value = true;
        showContinueButton.value = true;
        showMessageInput.value = false;
      }
    } finally {
      isTyping.value = false;
      
      // Update the syllabus with the new messages
      if (props.syllabus && props.chat) {
        const updatedChat = { 
          ...props.chat, 
          messages: localMessages.value 
        };
        
        const updatedSyllabus = {
          ...props.syllabus,
          chats: props.syllabus.chats.map(c => 
            c.id === props.chat?.id ? updatedChat : c
          )
        };
        
        emit('update', updatedSyllabus);
      }
    }
  }
};

onMounted(() => {
  startInitialChat();
  
  // Initialize MathJax if it exists
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch((err) => console.error('MathJax error:', err));
  }
});
</script>

<template>
  <div :class="['flex flex-col h-[calc(100vh-48px)]', isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50']">
    <!-- Header -->
    <div class="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between p-4">
        <button v-if="props.syllabus" @click="emit('back')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-2">
          <ArrowLeftIcon class="h-5 w-5" />
          <span class="hidden md:inline">Back to Syllabus</span>
        </button>
        <h1 class="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
          {{ props.chat?.title || 'New Chat' }}
        </h1>
        <div class="flex items-center gap-4">
          <div class="relative">
            <button
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              @click="openMemoryModal('syllabus')"
              title="Syllabus Memory"
            >
              <Cog6ToothIcon class="h-5 w-5" />
            </button>
          </div>
          <button @click="isDarkMode = !isDarkMode" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <SunIcon v-if="isDarkMode" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Chat Messages Container -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 chat-messages-container scroll-smooth">
      <div class="w-full max-w-4xl mx-auto py-4 px-4 md:px-6">
        <!-- Welcome Screen -->
        <WelcomeScreen 
          v-if="showWelcomeScreen" 
          @select-option="handleWelcomeOptionSelect" 
        />
        
        <!-- Chat Messages -->
        <template v-else v-for="message in localMessages" :key="message.id">
          <GraphBubble v-if="isGraphMessage(message.content)" v-bind="message" :dark-mode="isDarkMode" />
          <TableBubble v-else-if="isTableMessage(message.content)" v-bind="message" :dark-mode="isDarkMode" />
          <SVGBubble v-else-if="isSVGMessage(message.content)" v-bind="message" :dark-mode="isDarkMode" />
          <MathBubble v-else-if="isMathMessage(message.content)" v-bind="message" :dark-mode="isDarkMode" />
          <GeometricShapeBubble v-else-if="isShapeMessage(message.content)" v-bind="message" :dark-mode="isDarkMode" />
          <InteractiveResponse 
            v-else-if="isInteractiveMessage(message.content)" 
            v-bind="message" 
            :dark-mode="isDarkMode"
            @select-option="handleInteractiveOptionSelect"
            @select-quiz-option="handleInteractiveQuizOptionSelect"
            @quiz-action="handleInteractiveQuizAction"
          />
          <ChatBubble v-else v-bind="message" :dark-mode="isDarkMode" />
        </template>
        
        <!-- Multiple Choice Question -->
        <MultipleChoiceQuestion
          v-if="currentMultipleChoiceQuestion"
          :question="currentMultipleChoiceQuestion.question"
          :options="currentMultipleChoiceQuestion.options"
          :correct-answer="currentMultipleChoiceQuestion.correctAnswer"
          @select="handleOptionSelect"
          @clarify="handleClarify"
          @reveal="handleReveal"
          :dark-mode="isDarkMode"
        />
        
        <!-- Quiz -->
        <LessonCheckQuiz
          v-if="currentQuiz"
          :quiz="currentQuiz"
          @complete="handleQuizComplete"
          @clarify="handleQuizClarify"
          :dark-mode="isDarkMode"
        />
      </div>
    </div>

    <!-- Follow-up Buttons -->
    <div v-if="showFollowupButtons && !isTyping" class="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto p-4">
        <div class="grid grid-cols-3 gap-3">
          <button 
            class="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 transition-colors"
            @click="handleExplainLikeImFive"
          >
            <FaceSmileIcon class="h-5 w-5" />
            <span class="text-sm font-medium">Explain like I'm 5</span>
          </button>
          <button 
            class="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 transition-colors"
            @click="handleAskQuestion"
          >
            <ChatBubbleLeftRightIcon class="h-5 w-5" />
            <span class="text-sm font-medium">Ask question</span>
          </button>
          <button 
            class="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 transition-colors"
            @click="handleMoreDetail"
          >
            <DocumentMagnifyingGlassIcon class="h-5 w-5" />
            <span class="text-sm font-medium">More detail</span>
          </button>
        </div>
        
        <!-- Continue Button -->
        <div v-if="showContinueButton && !isTyping" class="mt-3">
          <button 
            class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
            @click="handleContinue"
          >
            <ArrowRightIcon class="h-5 w-5" />
            <span class="text-sm font-medium">Continue</span>
          </button>
        </div>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          UNA AI is an artificial intelligence and may make mistakes. Please verify important information.
        </p>
      </div>
    </div>

    <!-- Message Input -->
    <div v-if="showMessageInput && !isTyping" class="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto p-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-start gap-2 border dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800">
            <textarea
              ref="messageTextarea"
              v-model="userMessage"
              placeholder="Message UNA AI..."
              class="flex-1 px-3 py-2 text-gray-800 dark:text-white bg-transparent focus:outline-none resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
              @keydown.enter.prevent="handleSendMessage()"
              :disabled="isTyping"
            ></textarea>
            <div class="flex items-center gap-2 self-end">
              <button
                class="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                @click="handleSendMessage()"
                :disabled="!userMessage.trim() || isTyping"
              >
                <span class="hidden md:inline">Send</span>
                <PaperAirplaneIcon class="h-4 w-4" :class="{ 'opacity-0': isTyping }" />
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            UNA AI is an artificial intelligence and may make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State Message Input (Placeholder) -->
    <div v-if="isTyping" class="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto p-4">
        <div class="flex items-center justify-center">
          <div class="animate-pulse flex space-x-2">
            <div class="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <div class="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <div class="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          </div>
          <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">UNA AI is thinking...</span>
        </div>
      </div>
    </div>

    <!-- Memory Modal -->
    <MemoryModal
      :show="showMemoryModal"
      :memories="memories"
      :type="memoryType"
      @close="showMemoryModal = false"
      @clear="handleMemoryClear"
      @delete="handleMemoryDelete"
    />
  </div>
</template>

<style>
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