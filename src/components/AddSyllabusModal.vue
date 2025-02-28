<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { XMarkIcon, AcademicCapIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  existingSyllabi: Array<{ grade: string; subject: string }>;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add', grade: string, subject: string): void;
}>();

// Fixed to Grade 11 and Mathematics for Syllabus ID 5
const grade = ref('11');
const subject = ref('Mathematics');

// Disable other options
const grades = ['11'];
const subjects = ['Mathematics'];

const handleAdd = () => {
  emit('add', grade.value, subject.value);
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
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <!-- Close button -->
          <div class="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              class="rounded-md bg-white text-gray-400 hover:text-gray-500"
              @click="emit('close')"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Content -->
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <AcademicCapIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 class="text-lg font-semibold leading-6 text-gray-900">
                Add New Syllabus
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Create a new syllabus for Grade 11 Mathematics. This syllabus is linked to Syllabus ID 5.
                </p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="mt-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                v-model="grade"
                class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled
              >
                <option
                  v-for="g in grades"
                  :key="g"
                  :value="g"
                  class="text-gray-900"
                >
                  Grade {{ g }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                v-model="subject"
                class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled
              >
                <option
                  v-for="sub in subjects"
                  :key="sub"
                  :value="sub"
                  class="text-gray-900"
                >
                  {{ sub }}
                </option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              @click="handleAdd"
            >
              Add Syllabus
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>