<script setup lang="ts">
import { ref } from 'vue';
import { 
  Bars3Icon,
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChatBubbleLeftIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import type { Syllabus, Chat } from '../types';

const props = defineProps<{
  syllabusList: Array<Syllabus>;
}>();

const emit = defineEmits<{
  (e: 'addSyllabus', grade: string, subject: string): void;
  (e: 'selectSyllabus', id: string): void;
  (e: 'selectChat', syllabusId: string, chat: Chat): void;
  (e: 'toggleMobileMenu'): void;
  (e: 'showAddModal'): void;
  (e: 'navigate', path: string): void;
}>();

const sidebarOpen = ref(true);
const showTutorSubMenu = ref(false);
const expandedSyllabi = ref<Set<string>>(new Set());

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const handleSyllabusClick = (event: Event, syllabusId: string) => {
  event.stopPropagation();
  emit('selectSyllabus', syllabusId);
};

const toggleSyllabus = (syllabusId: string, hasChats: boolean) => {
  if (!hasChats) return;
  if (expandedSyllabi.value.has(syllabusId)) {
    expandedSyllabi.value.delete(syllabusId);
  } else {
    expandedSyllabi.value.add(syllabusId);
  }
};

const handleTutorClick = () => {
  showTutorSubMenu.value = !showTutorSubMenu.value;
  if (!showTutorSubMenu.value) {
    expandedSyllabi.value.clear();
  }
};

const getRecentChats = (chats: Chat[]) => {
  return chats.slice(0, 5);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
</script>

<template>
  <aside class="bg-blue-900 text-white h-full flex flex-col w-full">
    <div class="h-12 flex items-center justify-between px-3 border-b border-blue-800">
      <Bars3Icon 
        class="h-5 w-5 cursor-pointer text-gray-300 hover:text-white md:block" 
        @click="toggleSidebar" 
      />
      <button
        class="md:hidden text-gray-300 hover:text-white"
        @click="$emit('toggleMobileMenu')"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="flex flex-col py-2 space-y-0.5">
        <div class="flex items-center h-9 px-3 hover:bg-blue-800 cursor-pointer">
          <HomeIcon class="h-4 w-4" />
          <span class="ml-3 text-xs font-medium">Dashboard</span>
        </div>
        <div class="flex items-center h-9 px-3 hover:bg-blue-800 cursor-pointer">
          <BookOpenIcon class="h-4 w-4" />
          <span class="ml-3 text-xs font-medium">Courses</span>
        </div>
        <div class="flex items-center h-9 px-3 hover:bg-blue-800 cursor-pointer">
          <CalendarIcon class="h-4 w-4" />
          <span class="ml-3 text-xs font-medium">Timetable</span>
        </div>
        <div 
          class="flex items-center h-9 px-3 hover:bg-blue-800 cursor-pointer"
          @click="$emit('navigate', '/skills-gap')"
        >
          <StarIcon class="h-4 w-4" />
          <span class="ml-3 text-xs font-medium">Skills Gap Testing</span>
        </div>
        <div class="flex items-center h-9 px-3 hover:bg-blue-800 cursor-pointer">
          <ClipboardDocumentListIcon class="h-4 w-4" />
          <span class="ml-3 text-xs font-medium">Grade Book</span>
        </div>
        <div>
          <div
            class="flex items-center h-9 px-3 hover:bg-blue-800 cursor-pointer"
            @click="handleTutorClick"
          >
            <BookOpenIcon class="h-4 w-4" />
            <span class="ml-3 text-xs font-medium flex-grow">UNA Tutor</span>
            <component
              :is="showTutorSubMenu ? ChevronDownIcon : ChevronRightIcon"
              class="h-3 w-3"
            />
          </div>
          <div v-if="showTutorSubMenu" class="bg-blue-800/50">
            <button
              class="w-full text-left text-white hover:text-gray-300 px-6 py-1.5 text-xs"
              @click="$emit('showAddModal')"
            >
              + New Syllabus
            </button>
            <div class="space-y-0.5 mt-0.5">
              <div
                v-for="syllabus in syllabusList"
                :key="syllabus.id"
                class="text-white"
              >
                <div
                  class="flex items-center h-8 px-6 hover:bg-blue-700/50 cursor-pointer group"
                  @click="toggleSyllabus(syllabus.id, syllabus.chats.length > 0)"
                  :class="{ 'cursor-default': syllabus.chats.length === 0 }"
                >
                  <component
                    v-if="syllabus.chats.length > 0"
                    :is="expandedSyllabi.has(syllabus.id) ? ChevronDownIcon : ChevronRightIcon"
                    class="h-3 w-3 mr-1.5"
                  />
                  <div v-else class="w-3 h-3 mr-1.5"></div>
                  <span 
                    class="text-xs flex-grow hover:text-gray-300"
                    @click.stop="handleSyllabusClick($event, syllabus.id)"
                  >
                    Grade {{ syllabus.grade }} - {{ syllabus.subject }}
                  </span>
                </div>
                <div
                  v-if="expandedSyllabi.has(syllabus.id) && syllabus.chats.length > 0"
                  class="pl-8 py-0.5 space-y-0.5 bg-blue-700/30"
                >
                  <div
                    v-for="chat in getRecentChats(syllabus.chats)"
                    :key="chat.id"
                    class="flex items-center h-7 px-3 hover:bg-blue-700/50 cursor-pointer text-gray-200 hover:text-white"
                    @click="emit('selectChat', syllabus.id, chat)"
                  >
                    <ChatBubbleLeftIcon class="h-3 w-3 mr-1.5" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] truncate">{{ chat.title }}</span>
                        <span class="text-[11px] text-gray-400 ml-2">{{ formatDate(chat.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    v-if="syllabus.chats.length > 5"
                    class="w-full text-left px-3 py-1 text-[11px] text-gray-400 hover:text-white hover:bg-blue-700/50"
                    @click="emit('selectSyllabus', syllabus.id)"
                  >
                    View all chats...
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
