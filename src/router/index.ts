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
import AppLayout from '@/views/AppLayout.vue';
import LandingView from '@/views/LandingView.vue';
import OnboardView from '@/views/backoffice/OnboardView.vue';
import BackofficeVIew from '@/views/backoffice/BackofficeVIew.vue';
import OrganizationDetailView from '@/views/backoffice/OrganizationDetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: "/", 
      name: "Landing", 
      component: LandingView
    },
    { 
      path: "/login", 
      name: "Login", 
      component: LoginView 
    },
    { path: "/auth/callback", component: CallbackView },
    { 
      path: "/workspace", 
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { 
          path: '', 
          redirect: '/workspace/dashboard' 
        },
        { 
          path: 'backoffice', 
          name: 'Backoffice',
          component: BackofficeVIew,
        },
        {
          path:'backoffice/onboard',
          name:'Registrazione società',
          component: OnboardView
        },
        {
          path:'backoffice/organization/:id',
          component: OrganizationDetailView
        },
        {
          path: 'profile', 
          name: 'Profilo',
          component: ProfileView
        },
        { 
          path: 'dashboard', 
          name: 'Dashboard',
          component: DashboardView
        },
        { path: 'analysis', 
          name: 'Analisi video',
          component: AnalysisView
        },
        { 
          path: 'session', 
          component: SessionCreate
        },
        { 
          path: 'session/:id', 
          component: SessionDetail
        }
      ]
    },
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
    }    
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
