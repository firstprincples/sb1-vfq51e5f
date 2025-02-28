<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  BeakerIcon,
  ChartBarIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline';

interface Skill {
  id: string;
  name: string;
  status: 'struggling' | 'strong' | 'recent';
  lastUpdated: number;
  score: number;
  attempts: number;
  successRate: number;
}

interface Memory {
  id: string;
  type: 'short' | 'mid' | 'long';
  content: string;
  timestamp: number;
  source: 'syllabus' | 'general';
  context?: string;
}

const props = defineProps<{
  syllabusId?: string;
  isGeneral?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', memory: Memory): void;
  (e: 'clear'): void;
}>();

const memories = ref<Memory[]>([]);
const skills = ref<Skill[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Computed properties for skill categorization
const strugglingSkills = computed(() => 
  skills.value
    .filter(s => s.status === 'struggling')
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
);

const strongSkills = computed(() => 
  skills.value
    .filter(s => s.status === 'strong')
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
);

const recentSkills = computed(() => 
  skills.value
    .filter(s => s.status === 'recent')
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 3)
);

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'struggling': return 'text-red-600 bg-red-50 border-red-200';
    case 'strong': return 'text-green-600 bg-green-50 border-green-200';
    case 'recent': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'struggling': return ExclamationCircleIcon;
    case 'strong': return CheckCircleIcon;
    case 'recent': return ClockIcon;
    default: return ChartBarIcon;
  }
};

const clearMemory = async () => {
  try {
    isLoading.value = true;
    // TODO: Implement API call to clear memory
    emit('clear');
    memories.value = [];
  } catch (err) {
    error.value = 'Failed to clear memory';
  } finally {
    isLoading.value = false;
  }
};

const refreshMemory = async () => {
  try {
    isLoading.value = true;
    // TODO: Implement API call to refresh memory
    // This would typically fetch the latest memory data from the backend
  } catch (err) {
    error.value = 'Failed to refresh memory';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm">
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <BeakerIcon class="h-5 w-5 text-blue-600" />
          <h2 class="text-lg font-semibold text-gray-900">
            {{ isGeneral ? 'General Memory Management' : 'Syllabus Memory Management' }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="text-gray-500 hover:text-gray-700"
            @click="refreshMemory"
            :disabled="isLoading"
          >
            <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': isLoading }" />
          </button>
          <button
            class="text-red-500 hover:text-red-700"
            @click="clearMemory"
            :disabled="isLoading"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Error Display -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <!-- Skill Analysis Section -->
      <div class="space-y-4">
        <h3 class="text-base font-medium text-gray-900">Skill Analysis</h3>
        
        <!-- Struggling Skills -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700">Struggling Skills</h4>
          <div class="space-y-2">
            <div
              v-for="skill in strugglingSkills"
              :key="skill.id"
              class="flex items-center gap-2 p-2 rounded-lg border"
              :class="getStatusColor('struggling')"
            >
              <ExclamationCircleIcon class="h-5 w-5" />
              <span class="flex-1">{{ skill.name }}</span>
              <span class="text-sm">{{ skill.score }}%</span>
            </div>
            <div v-if="!strugglingSkills.length" class="text-sm text-gray-500 italic">
              No struggling skills identified
            </div>
          </div>
        </div>

        <!-- Strong Skills -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700">Strong Skills</h4>
          <div class="space-y-2">
            <div
              v-for="skill in strongSkills"
              :key="skill.id"
              class="flex items-center gap-2 p-2 rounded-lg border"
              :class="getStatusColor('strong')"
            >
              <CheckCircleIcon class="h-5 w-5" />
              <span class="flex-1">{{ skill.name }}</span>
              <span class="text-sm">{{ skill.score }}%</span>
            </div>
            <div v-if="!strongSkills.length" class="text-sm text-gray-500 italic">
              No strong skills identified yet
            </div>
          </div>
        </div>

        <!-- Recently Acquired Skills -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700">Recently Acquired Skills</h4>
          <div class="space-y-2">
            <div
              v-for="skill in recentSkills"
              :key="skill.id"
              class="flex items-center gap-2 p-2 rounded-lg border"
              :class="getStatusColor('recent')"
            >
              <ClockIcon class="h-5 w-5" />
              <span class="flex-1">{{ skill.name }}</span>
              <span class="text-sm">{{ formatDate(skill.lastUpdated) }}</span>
            </div>
            <div v-if="!recentSkills.length" class="text-sm text-gray-500 italic">
              No recently acquired skills
            </div>
          </div>
        </div>
      </div>

      <!-- Memory Timeline -->
      <div class="space-y-4">
        <h3 class="text-base font-medium text-gray-900">Memory Timeline</h3>
        <div class="space-y-4">
          <div
            v-for="memory in memories"
            :key="memory.id"
            class="border rounded-lg p-4 space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">
                {{ memory.type === 'short' ? 'Short-term' : memory.type === 'mid' ? 'Mid-term' : 'Long-term' }}
                Memory
              </span>
              <span class="text-sm text-gray-500">{{ formatDate(memory.timestamp) }}</span>
            </div>
            <p class="text-gray-600">{{ memory.content }}</p>
            <div v-if="memory.context" class="text-sm text-gray-500 italic">
              Context: {{ memory.context }}
            </div>
          </div>
          <div v-if="!memories.length" class="text-center text-gray-500 py-8">
            No memories stored yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>