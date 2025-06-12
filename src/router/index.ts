import { createRouter, createWebHistory } from 'vue-router'
import ElementManager from '../views/ScoreboardView.vue';
import NameManager from '../views/NameManager.vue';
import ReportView from '@/views/ReportView.vue';
import EventView from '@/views/EventView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalysisView from '@/views/AnalysisView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: LoginView },
    { path: "/profile", component: ProfileView, meta: { requiresAuth: true } },
    { path: "/dashboard", component: DashboardView, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/game', component: NameManager, meta: { requiresAuth: true } },
    { path: '/game/live', component: ElementManager, meta: { requiresAuth: true } },
    { path: '/game/report', component: ReportView, meta: { requiresAuth: true } },
    { path: '/game/events', component: EventView, meta: { requiresAuth: true } },
    { path: '/analysis', component: AnalysisView, meta: { requiresAuth: true } },
  ]
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  auth.loadFromStorage(); // assicurati che lo stato sia caricato
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router
