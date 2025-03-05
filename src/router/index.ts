import { createRouter, createWebHistory } from 'vue-router'
import ElementManager from '../views/ScoreboardView.vue';
import NameManager from '../views/NameManager.vue';
import ReportView from '@/views/ReportView.vue';
import EventView from '@/views/EventView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalysisView from '@/views/AnalysisView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/game', component: NameManager },
    { path: '/game/live', component: ElementManager },
    { path: '/game/report', component: ReportView },
    { path: '/game/events', component: EventView },
    { path: '/analysis', component: AnalysisView },
  ]
});

export default router
