<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  XMarkIcon,
  TrashIcon,
  BeakerIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline';
import type { Memory } from '../types';

const props = defineProps<{
  show: boolean;
  memories: Memory[];
  type: 'syllabus' | 'general';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'clear'): void;
  (e: 'delete', memoryId: string): void;
}>();

const searchQuery = ref('');

const filteredMemories = computed(() => {
  if (!searchQuery.value) return props.memories;
  const query = searchQuery.value.toLowerCase();
  return props.memories.filter(memory => 
    memory.content.toLowerCase().includes(query) ||
    (memory.context?.toLowerCase().includes(query))
  );
});

const getMemoryTypeColor = (type: 'short' | 'mid' | 'long') => {
  switch (type) {
    case 'short': return 'text-blue-600 bg-blue-50';
    case 'mid': return 'text-purple-600 bg-purple-50';
    case 'long': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleClearAll = () => {
  if (confirm('Are you sure you want to clear all memories? This action cannot be undone.')) {
    emit('clear');
  }
};

const handleDeleteMemory = (memoryId: string) => {
  if (confirm('Are you sure you want to delete this memory?')) {
    emit('delete', memoryId);
  }
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="emit('close')" />

      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <!-- Header -->
          <div class="border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <BeakerIcon class="h-6 w-6 text-blue-600" />
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ type === 'general' ? 'General Memory' : 'Syllabus Memory' }}
                </h2>
              </div>
              <div class="flex items-center gap-4">
                <button
                  class="text-red-600 hover:text-red-700 flex items-center gap-1"
                  @click="handleClearAll"
                >
                  <TrashIcon class="h-5 w-5" />
                  <span class="text-sm">Clear All</span>
                </button>
                <button
                  class="rounded-full p-1 text-gray-400 hover:text-gray-500"
                  @click="emit('close')"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="border-b border-gray-200 px-6 py-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search memories..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <!-- Content -->
          <div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <div v-if="filteredMemories.length === 0" class="text-center py-8">
              <ExclamationCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No memories found</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ searchQuery ? 'Try a different search term.' : 'Start chatting to create memories.' }}
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="memory in filteredMemories"
                :key="memory.id"
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="text-xs font-medium px-2 py-1 rounded-full"
                        :class="getMemoryTypeColor(memory.type)"
                      >
                        {{ memory.type === 'short' ? 'Short-term' : memory.type === 'mid' ? 'Mid-term' : 'Long-term' }}
                      </span>
                      <span class="text-sm text-gray-500">
                        {{ formatDate(memory.timestamp) }}
                      </span>
                    </div>
                    <p class="text-gray-900">{{ memory.content }}</p>
                    <p v-if="memory.context" class="mt-1 text-sm text-gray-500">
                      Context: {{ memory.context }}
                    </p>
                  </div>
                  <button
                    class="text-gray-400 hover:text-red-600"
                    @click="handleDeleteMemory(memory.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>