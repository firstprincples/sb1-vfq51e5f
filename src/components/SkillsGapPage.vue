<script setup lang="ts">
import { ref } from 'vue';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
} from '@heroicons/vue/24/outline';

const performanceData = {
  overallScore: 85,
  comparisonMetrics: [
    { month: 'Jan', value: 75 },
    { month: 'Feb', value: 82 },
    { month: 'Mar', value: 78 },
    { month: 'Apr', value: 85 },
    { month: 'May', value: 80 },
    { month: 'Jun', value: 88 },
  ],
  objectivesScore: 80,
  skillsTable: [
    {
      skillName: 'Specific Objective 1',
      attempted: 4500,
      correct: 3800,
      incorrect: 700,
      score: 84,
      status: 'Mastered',
      severity: 'Low'
    },
    {
      skillName: 'Specific Objective 2',
      attempted: 3200,
      correct: 2800,
      incorrect: 400,
      score: 88,
      status: 'In Progress',
      severity: 'Medium'
    },
    {
      skillName: 'Specific Objective 3',
      attempted: 5100,
      correct: 4590,
      incorrect: 510,
      score: 90,
      status: 'Mastered',
      severity: 'Low'
    }
  ],
  objectivesTested: [
    'Algebra',
    'Geometry',
    'Statistics',
    'Calculus'
  ]
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-red-600';
    default: return 'text-gray-600';
  }
};
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <div class="bg-white border-b px-6 py-4">
      <h1 class="text-2xl font-semibold text-gray-900">Skills Gap Report</h1>
      <p class="text-sm text-gray-500 mt-1">
        Access comprehensive insights about your learning progress with this complete skill progress report. Use this information to identify areas for improvement and track your progress.
      </p>
    </div>
    <div class="flex-1 p-6 space-y-6 overflow-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ChartPieIcon class="h-5 w-5 text-blue-600" />
            Overall Performance
          </h2>
          <div class="relative w-48 h-48 mx-auto">
            <svg class="w-full h-full" viewBox="0 0 100 100">
              <circle
                class="text-gray-200"
                stroke-width="10"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                class="text-blue-600 transition-all duration-1000 ease-out"
                stroke-width="10"
                :stroke-dasharray="`${performanceData.overallScore * 2.827}, 282.7`"
                stroke-linecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
                style="transform: rotate(-90deg); transform-origin: 50% 50%"
              />
              <text
                x="50"
                y="50"
                class="text-3xl font-bold"
                text-anchor="middle"
                dy=".3em"
                fill="#1e40af"
              >{{ performanceData.overallScore }}%</text>
            </svg>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon class="h-5 w-5 text-blue-600" />
            Progress Trend
          </h2>
          <div class="h-48">
            <div class="relative h-full">
              <div class="absolute inset-0 flex items-end justify-between">
                <div
                  v-for="(metric, index) in performanceData.comparisonMetrics"
                  :key="index"
                  class="w-1/6 flex flex-col items-center"
                >
                  <div 
                    class="w-full bg-blue-600 rounded-t"
                    :style="{ height: `${metric.value}%` }"
                  ></div>
                  <span class="text-xs text-gray-500 mt-2">{{ metric.month }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AcademicCapIcon class="h-5 w-5 text-blue-600" />
            Objectives Mastery
          </h2>
          <div class="relative w-48 h-48 mx-auto">
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Mastery
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block text-blue-600">
                    {{ performanceData.objectivesScore }}%
                  </span>
                </div>
              </div>
              <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                  :style="{ width: `${performanceData.objectivesScore}%` }"
                ></div>
              </div>
            </div>
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Objectives Tested</h3>
              <div class="space-y-2">
                <div
                  v-for="objective in performanceData.objectivesTested"
                  :key="objective"
                  class="flex items-center text-sm"
                >
                  <div class="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                  <span>{{ objective }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-semibold text-gray-900">Detailed Skills Analysis</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions Attempted
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions Correct
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions Incorrect
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Learning Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity Level
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="skill in performanceData.skillsTable" :key="skill.skillName">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ skill.skillName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatNumber(skill.attempted) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatNumber(skill.correct) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatNumber(skill.incorrect) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getScoreColor(skill.score)">
                  {{ skill.score }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {{ skill.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getSeverityColor(skill.severity)">
                  {{ skill.severity }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Report Summary</h2>
        <div class="prose max-w-none">
          <p class="text-gray-600">
            Based on your performance data, here are the key insights:
          </p>
          <ul class="mt-4 space-y-2">
            <li class="text-gray-600">Overall performance is strong at {{ performanceData.overallScore }}%</li>
            <li class="text-gray-600">Showing consistent improvement in monthly progress</li>
            <li class="text-gray-600">Successfully mastered {{ performanceData.objectivesTested.length }} core objectives</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
circle {
  transition: stroke-dasharray 1s ease-in-out;
}
</style>
