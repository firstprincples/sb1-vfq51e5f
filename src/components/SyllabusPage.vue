<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  PaperClipIcon, 
  PencilSquareIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ArrowLeftIcon,
  PhotoIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BeakerIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline';
import type { Syllabus, Chat, Memory, Skill } from '../types';
import AddFilesModal from './AddFilesModal.vue';
import AddInstructionsModal from './AddInstructionsModal.vue';
import MemoryManager from './MemoryManager.vue';

const props = defineProps<{
  syllabus: Syllabus;
}>();

const router = useRouter();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'update', syllabus: Syllabus): void;
  (e: 'select-chat', syllabusId: string, chat: Chat): void;
}>();

const newChatTitle = ref('');
const chatTitleTextarea = ref<HTMLTextAreaElement | null>(null);
const showSettings = ref(false);
const showAddInstructionsModal = ref(false);
const showAddFilesModal = ref(false);
const showMemoryManager = ref(false);

// Mock data for demonstration
const recentlyAcquiredSkills = ref<string[]>([
  'Linear Equations',
  'Basic Algebra',
  'Number Properties'
]);

const progress = {
  acquired: 10,
  total: 50,
  percentage: 20
};

const adjustTextareaHeight = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const createNewChat = () => {
  if (!newChatTitle.value.trim()) return;
  
  // Generate a more descriptive title based on the query
  const titleWords = newChatTitle.value.split(' ').slice(0, 5).join(' ');
  const chatTitle = titleWords + (newChatTitle.value.split(' ').length > 5 ? '...' : '');
  
  // Create a new chat with the query as the initial message
  const newChat: Chat = {
    id: Date.now().toString(),
    title: chatTitle,
    subtitle: 'New conversation',
    messages: [{
      id: Date.now().toString(),
      content: newChatTitle.value,
      sender: 'user',
      timestamp: Date.now()
    }],
    createdAt: Date.now(),
    initialMessage: newChatTitle.value
  };
  
  // Update the syllabus with the new chat
  const updatedSyllabus = {
    ...props.syllabus,
    chats: [newChat, ...props.syllabus.chats]
  };
  
  // Update the syllabus and navigate to the chat
  emit('update', updatedSyllabus);
  emit('select-chat', props.syllabus.id, newChat);
  
  // Reset the input field
  newChatTitle.value = '';
  if (chatTitleTextarea.value) {
    chatTitleTextarea.value.style.height = '44px';
  }
};

const handleChatClick = (chat: Chat) => {
  emit('select-chat', props.syllabus.id, chat);
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      content: e.target?.result as string,
      type: file.type,
      uploadedAt: Date.now()
    };
    const updatedSyllabus = {
      ...props.syllabus,
      files: [...props.syllabus.files, newFile]
    };
    emit('update', updatedSyllabus);
  };
  reader.readAsText(file);
};

const handleAddFiles = (files: File[]) => {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        content: e.target?.result as string,
        type: file.type,
        uploadedAt: Date.now()
      };
      const updatedSyllabus = {
        ...props.syllabus,
        files: [...props.syllabus.files, newFile]
      };
      emit('update', updatedSyllabus);
    };
    reader.readAsText(file);
  });
  showAddFilesModal.value = false;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const handleSaveInstructions = (instructions: string[]) => {
  const updatedSyllabus = {
    ...props.syllabus,
    instructions: instructions
  };
  emit('update', updatedSyllabus);
  showAddInstructionsModal.value = false;
};

// Handle Enter key in the textarea
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    createNewChat();
  }
};
</script>

<template>
  <div class="flex flex-col w-full h-full bg-gray-50">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 bg-white border-b">
      <button
        class="text-gray-500 hover:text-gray-700 flex items-center gap-2"
        @click="emit('back')"
      >
        <ArrowLeftIcon class="h-5 w-5" />
        <span>Back to All Syllabi</span>
      </button>
      <h1 class="text-2xl font-semibold text-gray-900">
        Grade {{ syllabus.grade }} {{ syllabus.subject }}
      </h1>
      <button
        class="text-gray-500 hover:text-gray-700"
        @click="showSettings = !showSettings"
        title="Memory Management"
      >
        <Cog6ToothIcon class="h-5 w-5" />
      </button>
    </div>

    <div class="p-6 flex-1 overflow-auto">
      <!-- Progress Section -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <ChartBarIcon class="h-5 w-5 text-blue-600" />
              <h2 class="text-lg font-semibold text-gray-900">Learning Progress</h2>
            </div>
            <div class="flex items-center gap-2">
              <AcademicCapIcon class="h-5 w-5 text-blue-600" />
              <span class="text-sm font-medium text-gray-600">
                {{ progress.acquired }} of {{ progress.total }} skills acquired
              </span>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div 
              class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
              :style="{ width: `${progress.percentage}%` }"
            >
              <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>

          <!-- Recently Acquired Skills -->
          <div class="mt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Recently Acquired Skills</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in recentlyAcquiredSkills" 
                :key="skill"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Access Tools -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Files Section -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium text-gray-900">Syllabus Files</h3>
            <button 
              class="text-blue-600 hover:text-blue-700"
              @click="showAddFilesModal = true"
            >
              <PaperClipIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="mt-2">
            <div
              v-for="file in syllabus.files"
              :key="file.id"
              class="text-sm text-gray-600 flex items-center gap-2"
            >
              <PaperClipIcon class="h-4 w-4" />
              <span>{{ file.name }}</span>
            </div>
          </div>
        </div>

        <!-- Instructions Section -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium text-gray-900">Custom Instructions</h3>
            <button
              class="text-blue-600 hover:text-blue-700"
              @click="showAddInstructionsModal = true"
            >
              <PencilSquareIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="mt-2">
            <div
              v-for="(instruction, index) in syllabus.instructions"
              :key="index"
              class="text-sm text-gray-600"
            >
              {{ instruction }}
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="p-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-start gap-2 border rounded-lg p-2 bg-white">
              <textarea
                ref="chatTitleTextarea"
                v-model="newChatTitle"
                rows="2"
                placeholder="Ask me anything about your syllabus..."
                class="flex-1 text-gray-900 placeholder-gray-500 focus:outline-none resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
                @input="adjustTextareaHeight"
                @keydown="handleKeyDown"
              ></textarea>
              <div class="flex items-center gap-2 self-end">
                <button
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  @click="createNewChat"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat History -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b">
          <h3 class="font-medium text-gray-900">Recent Conversations</h3>
        </div>
        <div class="divide-y">
          <template v-if="syllabus.chats.length > 0">
            <div
              v-for="chat in syllabus.chats"
              :key="chat.id"
              class="p-4 hover:bg-gray-50 cursor-pointer"
              @click="handleChatClick(chat)"
            >
              <div class="flex items-center gap-3">
                <ChatBubbleLeftIcon class="h-5 w-5 text-gray-400" />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ chat.title }}</h4>
                  <p class="text-sm text-gray-500">{{ chat.subtitle }}</p>
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <CalendarIcon class="h-4 w-4 mr-1" />
                  {{ formatDate(chat.createdAt) }}
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="p-8 text-center text-gray-500">
              Start a conversation to begin learning
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Memory Management Drawer -->
    <div
      v-if="showSettings"
      class="fixed inset-0 z-50 overflow-hidden"
      @click="showSettings = false"
    >
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          class="relative w-screen max-w-md"
          @click.stop
        >
          <div class="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-medium text-gray-900">Memory Management</h2>
                <button
                  class="text-gray-400 hover:text-gray-500"
                  @click="showSettings = false"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <MemoryManager
                :syllabus-id="syllabus.id"
                @close="showSettings = false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddFilesModal
      :show="showAddFilesModal"
      @close="showAddFilesModal = false"
      @add-files="handleAddFiles"
    />
    <AddInstructionsModal
      :show="showAddInstructionsModal"
      :existing-instructions="syllabus.instructions"
      @close="showAddInstructionsModal = false"
      @save="handleSaveInstructions"
    />
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>