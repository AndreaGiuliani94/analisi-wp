import { createRouter, createWebHistory } from 'vue-router'
import ScoreboardView from '../views/ScoreboardView.vue';
import MatchSetupView from '../views/MatchSetupView.vue';
import ReportView from '@/views/ReportView.vue';
import EventView from '@/views/EventView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalysisView from '@/views/AnalysisView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import CallbackView from '@/views/CallbackView.vue';
import { useAuthStore } from '@/stores/authStore';
import SettingsView from '@/views/SettingsView.vue';
import SessionCreate from '@/components/SessionsItem.vue';
import JoinSession from '@/views/session/JoinSession.vue';
import SessionDetail from '@/views/session/SessionDetail.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: 'Login', component: LoginView },
    { path: "/auth/callback", component: CallbackView },
    { path: "/profile", component: ProfileView , meta: { requiresAuth: true }},
    { path: "/dashboard", component: DashboardView },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
    {
      path: '/match/:id',
      component: JoinSession,
      meta: { requiresAuth: true },
      children: [
        { 
          path: 'setup', 
          name: 'MatchSetup',
          component: MatchSetupView 
        },
        { 
          path: 'live', 
          name: 'MatchLive',
          component: ScoreboardView 
        },
        { 
          path: 'events', 
          name: 'MatchEvents',
          component: EventView 
        },
        { 
          path: 'report', 
          name: 'MatchReport',
          component: ReportView 
        },
        { 
          path: 'settings', 
          name: 'MatchSettings',
          component: SettingsView 
        },
        {
          path: '',
          redirect: { name: 'MatchLive' }
        }
      ]
    },
    { path: '/analysis', component: AnalysisView, meta: { requiresAuth: true } },
    { path: '/session', component: SessionCreate, meta: { requiresAuth: true } },
    { path: '/session/:id', component: SessionDetail, meta: { requiresAuth: true } }
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
