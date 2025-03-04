import { createRouter, createWebHistory } from 'vue-router'
import ElementManager from '../views/ScoreboardView.vue';
import NameManager from '../views/NameManager.vue';
import ReportView from '@/views/ReportView.vue';
import EventView from '@/views/EventView.vue';
import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/game', component: NameManager },
    { path: '/live', component: ElementManager },
    { path: '/report', component: ReportView },
    { path: '/events', component: EventView },
  ]
});

export default router
