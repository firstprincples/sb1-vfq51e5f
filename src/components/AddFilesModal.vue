<script setup lang="ts">
import { ref } from 'vue';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-files', files: File[]): void;
}>();

const dragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragOver.value = false;
  if (!e.dataTransfer?.files) return;
  const files = Array.from(e.dataTransfer.files);
  emit('add-files', files);
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files?.length) return;
  const files = Array.from(input.files);
  emit('add-files', files);
  input.value = ''; // Reset input
};

const handleClickAddFiles = () => {
  fileInputRef.value?.click();
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="transform opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="emit('close')" />

      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Project files</h2>
            <div class="flex items-center gap-4">
              <button
                class="rounded-full px-4 py-1 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                @click="handleClickAddFiles"
              >
                Add files
              </button>
              <button
                class="rounded-full p-1 text-gray-400 hover:text-gray-500"
                @click="emit('close')"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Drop Zone -->
          <div
            class="w-full border-2 border-dashed rounded-lg p-12"
            :class="[
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            ]"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <div class="text-center">
              <ArrowUpTrayIcon class="mx-auto h-12 w-12 text-gray-400" />
              <div class="mt-4">
                <p class="text-sm text-gray-500">
                  Add documents, code files, images, and more.
                  <span class="font-semibold text-gray-900">UNA AI Tutor</span>
                  can access their contents when you chat inside the project.
                </p>
              </div>
              <div class="mt-6">
                <label class="cursor-pointer">
                  <input
                    ref="fileInputRef"
                    type="file"
                    multiple
                    class="hidden"
                    @change="handleFileSelect"
                  />
                  <span class="inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Select files
                  </span>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                or drag and drop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
