<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavSidebar from './components/NavSidebar.vue';
import TopNav from './components/TopNav.vue';
import AddSyllabusModal from './components/AddSyllabusModal.vue';
import type { Syllabus, Chat } from './types';

const router = useRouter();
const route = useRoute();

const syllabusList = ref<Syllabus[]>([
  { 
    id: '1', 
    grade: '9', 
    subject: 'Mathematics',
    instructions: [],
    files: [],
    chats: []
  },
  { 
    id: '2', 
    grade: '10', 
    subject: 'Science',
    instructions: [],
    files: [],
    chats: []
  }
]);

const selectedSyllabus = ref<Syllabus | null>(null);
const selectedChat = ref<Chat | null>(null);
const isMobileMenuOpen = ref(false);
const showAddSyllabusModal = ref(false);

const handleAddSyllabus = (grade: string, subject: string) => {
  const exists = syllabusList.value.some(
    s => s.grade === grade && s.subject === subject
  );

  if (!exists) {
    const newSyllabus: Syllabus = { 
      id: `${grade}-${subject}-${Date.now()}`, 
      grade, 
      subject,
      instructions: [],
      files: [],
      chats: []
    };
    syllabusList.value.push(newSyllabus);
  }
};

const handleSelectSyllabus = (id: string) => {
  selectedSyllabus.value = syllabusList.value.find(s => s.id === id) || null;
  selectedChat.value = null;
  isMobileMenuOpen.value = false;
  router.push(`/syllabus/${id}`);
};

const handleSelectChat = (syllabusId: string, chat: Chat) => {
  const syllabus = syllabusList.value.find(s => s.id === syllabusId);
  if (syllabus) {
    selectedSyllabus.value = syllabus;
    selectedChat.value = chat;
    isMobileMenuOpen.value = false;
    router.push(`/syllabus/${syllabusId}/chat/${chat.id}`);
  }
};

const updateSyllabus = (updatedSyllabus: Syllabus) => {
  const index = syllabusList.value.findIndex(s => s.id === updatedSyllabus.id);
  if (index !== -1) {
    syllabusList.value[index] = updatedSyllabus;
    selectedSyllabus.value = updatedSyllabus;
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleNavigate = (path: string) => {
  router.push(path);
  isMobileMenuOpen.value = false;
};

// Watch route changes to update selected syllabus and chat
watch(route, () => {
  const { syllabusId, chatId } = route.params;
  
  if (syllabusId) {
    const syllabus = syllabusList.value.find(s => s.id === syllabusId);
    if (syllabus) {
      selectedSyllabus.value = syllabus;
      
      if (chatId) {
        const chat = syllabus.chats.find(c => c.id === chatId);
        if (chat) {
          selectedChat.value = chat;
        }
      }
    }
  }
}, { immediate: true });
</script>

<template>
  <div class="w-full h-screen flex flex-col md:flex-row">
    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="toggleMobileMenu"
    ></div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed md:relative md:flex w-64 h-full z-30 transform transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <NavSidebar
        :syllabus-list="syllabusList"
        @add-syllabus="handleAddSyllabus"
        @select-syllabus="handleSelectSyllabus"
        @select-chat="handleSelectChat"
        @toggle-mobile-menu="toggleMobileMenu"
        @show-add-modal="showAddSyllabusModal = true"
        @navigate="handleNavigate"
      />
    </div>

    <div class="flex-1 flex flex-col min-w-0">
      <TopNav @toggle-mobile-menu="toggleMobileMenu" />
      <router-view
        :key="$route.fullPath"
        :syllabus="selectedSyllabus"
        :chat="selectedChat"
        @back="router.push('/')"
        @update="updateSyllabus"
        @select-chat="handleSelectChat"
      ></router-view>
    </div>

    <!-- Add Syllabus Modal -->
    <AddSyllabusModal
      :show="showAddSyllabusModal"
      :existing-syllabi="syllabusList"
      @close="showAddSyllabusModal = false"
      @add="handleAddSyllabus"
    />
  </div>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>