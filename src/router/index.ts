import { createRouter, createWebHistory } from 'vue-router'
import ElementManager from '../views/ElementManager.vue';
import NameManager from '../views/NameManager.vue';
import ReportView from '@/views/ReportView.vue';
import EventView from '@/views/EventView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: NameManager },
    { path: '/game', component: ElementManager },
    { path: '/report', component: ReportView },
    { path: '/events', component: EventView },
  ]
});

export default router
