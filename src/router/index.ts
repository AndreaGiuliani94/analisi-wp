import { createRouter, createWebHistory } from 'vue-router'
import ScoreboardView from '../views/match/ScoreboardView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalysisView from '@/views/AnalysisView.vue';
import LoginView from '@/views/login/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import CallbackView from '@/views/login/CallbackView.vue';
import { useAuthStore } from '@/stores/authStore';
import SettingsView from '@/views/match/SettingsView.vue';
import SessionCreate from '@/components/SessionsItem.vue';
import AppLayout from '@/views/AppLayout.vue';
import LandingView from '@/views/LandingView.vue';
import OnboardView from '@/views/backoffice/OnboardView.vue';
import BackofficeView from '@/views/backoffice/BackofficeView.vue';
import OrganizationDetailView from '@/views/backoffice/OrganizationDetailView.vue';
import RostersView from '@/views/RostersView.vue';
import MatchDetail from '@/views/match/MatchDetail.vue';
import JoinMatch from '@/views/match/JoinMatch.vue';
import MatchSetupView from '@/views/match/MatchSetupView.vue';
import EventView from '@/views/match/EventView.vue';
import ReportView from '@/views/match/ReportView.vue';
import StatsView from '@/views/StatsView.vue';

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
          component: BackofficeView,
        },
        {
          path:'backoffice/onboard',
          name:'Registrazione società',
          component: OnboardView
        },
        {
          path:'backoffice/organization/:id',
          name: 'Società',
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
        { path: 'rosters', 
          name: 'Roster',
          component: RostersView
        },
        { path: 'stats', 
          name: 'Statistiche',
          component: StatsView
        },
        { 
          path: 'session', 
          component: SessionCreate
        },
        { 
          path: 'session/:id', 
          component: MatchDetail
        }
      ]
    },
    {
      path: '/match/:id',
      component: JoinMatch,
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
