import { createRouter, createWebHistory } from 'vue-router';
import SkillsGapPage from '../components/SkillsGapPage.vue';
import ChatView from '../components/ChatView.vue';
import SyllabusPage from '../components/SyllabusPage.vue';
import GeneralMemoryPage from '../components/GeneralMemoryPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: ChatView,
      props: (route) => ({
        chat: {
          id: 'default',
          title: 'New Chat',
          subtitle: '',
          messages: [],
          createdAt: Date.now()
        },
        syllabus: null
      })
    },
    {
      path: '/skills-gap',
      component: SkillsGapPage
    },
    {
      path: '/syllabus/:id',
      component: SyllabusPage,
      props: true
    },
    {
      path: '/syllabus/:syllabusId/chat/:chatId',
      component: ChatView,
      props: true
    },
    {
      path: '/memory',
      component: GeneralMemoryPage
    }
  ]
});

export default router;