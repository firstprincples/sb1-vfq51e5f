<script setup lang="ts">
import { 
  ShoppingCartIcon, 
  BellIcon, 
  UserCircleIcon, 
  Bars3Icon,
  BeakerIcon
} from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';

const router = useRouter();
defineEmits<{
  (e: 'toggleMobileMenu'): void;
}>();

const navigateToMemory = () => {
  router.push('/memory');
};
</script>

<template>
  <header class="flex items-center justify-between bg-white h-12 px-4 border-b border-gray-200">
    <button
      class="md:hidden text-gray-500 hover:text-gray-700"
      @click="$emit('toggleMobileMenu')"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>
    <div class="flex items-center space-x-4 flex-1 max-w-xl">
      <input
        type="text"
        placeholder="Search Courses and Tutors"
        class="w-full h-7 px-3 text-xs border rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
    <div class="flex items-center space-x-2 md:space-x-4">
      <div class="flex items-center space-x-2 md:space-x-3">
        <button 
          class="text-gray-500 hover:text-gray-700 hidden md:block"
          @click="navigateToMemory"
          title="General Memory Management"
        >
          <BeakerIcon class="h-5 w-5" />
        </button>
        <button class="text-gray-500 hover:text-gray-700 hidden md:block">
          <ShoppingCartIcon class="h-5 w-5" />
        </button>
        <button class="text-gray-500 hover:text-gray-700 relative">
          <BellIcon class="h-5 w-5" />
          <span class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">2</span>
        </button>
        <button class="text-gray-500 hover:text-gray-700">
          <UserCircleIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="h-6 border-l border-gray-200 hidden md:block"></div>
      <button class="bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 hidden md:block">
        Upgrade
      </button>
    </div>
  </header>
</template>