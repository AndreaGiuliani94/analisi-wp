import { createRouter, createWebHistory } from 'vue-router'
import ElementManager from '../views/ScoreboardView.vue';
import NameManager from '../views/NameManager.vue';
import ReportView from '@/views/ReportView.vue';
import EventView from '@/views/EventView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalysisView from '@/views/AnalysisView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import CallbackView from '@/views/CallbackView.vue';
import { useAuthStore } from '@/stores/authStore';
import SettingsView from '@/views/SettingsView.vue';
import SessionView from '@/views/SessionView.vue';
import SessionCreate from '@/components/SessionsItem.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: 'Login', component: LoginView },
    { path: "/auth/callback", component: CallbackView },
    { path: "/profile", component: ProfileView , meta: { requiresAuth: true }},
    { path: "/dashboard", component: DashboardView },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
    { path: '/game', component: NameManager, meta: { requiresAuth: true } },
    { path: '/game/live', component: ElementManager },
    { path: '/game/report', component: ReportView },
    { path: '/game/events', component: EventView },
    { path: '/analysis', component: AnalysisView },
    { path: '/settings', component: SettingsView },
    { path: '/session', component: SessionCreate },
    { path: '/session/join/:id', component: SessionView }
  ]
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.accessToken) {
      const ok = await authStore.refresh()
      if (!ok) {
        return next({ name: 'Login' })
      }
    }
  }

  next()
})

export default router
