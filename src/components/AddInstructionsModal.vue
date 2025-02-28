<script setup lang="ts">
import { ref } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  show: boolean;
  existingInstructions: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', instructions: string[]): void;
}>();

const instruction = ref('');

const handleSave = () => {
  if (instruction.value.trim()) {
    emit('save', [instruction.value.trim()]);
  }
  emit('close');
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
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Custom Instructions</h2>
            <button
              class="rounded-full p-1 text-gray-400 hover:text-gray-500"
              @click="emit('close')"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="space-y-4">
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-2">
                How would you like UNA AI to assist with this syllabus?
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Add custom instructions to tailor how UNA AI should approach topics, explain concepts, or format responses for this specific syllabus.
              </p>

              <div class="border border-gray-300 rounded-lg p-4">
                <textarea
                  v-model="instruction"
                  rows="4"
                  class="w-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none resize-none"
                  placeholder='e.g. "Use grade-appropriate language. Include practical examples. Focus on visual learning techniques. Break down complex topics into simpler steps."'
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3">
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                @click="emit('close')"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-900"
                @click="handleSave"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
