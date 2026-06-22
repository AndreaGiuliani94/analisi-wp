import { createRouter, createWebHistory } from 'vue-router'
import ScoreboardView from '../views/match/ScoreboardView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AnalysisView from '@/views/AnalysisView.vue';
import LoginView from '@/views/login/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import CallbackView from '@/views/login/CallbackView.vue';
import { useAuthStore } from '@/stores/authStore';
import SettingsView from '@/views/match/SettingsView.vue';
import AppLayout from '@/views/AppLayout.vue';
import LandingView from '@/views/public/LandingView.vue';
import OnboardView from '@/views/backoffice/OnboardView.vue';
import PublicLayout from '@/views/public/PublicLayout.vue';
import AboutView from '@/views/public/AboutView.vue';
import CookiePolicyView from '@/views/public/CookiePolicyView.vue';
import PrivacyPolicyView from '@/views/public/PrivacyPolicyView.vue';
import BackofficeView from '@/views/backoffice/BackofficeView.vue';
import OrganizationDetailView from '@/views/backoffice/OrganizationDetailView.vue';
import RostersView from '@/views/RostersView.vue';
import MatchDetail from '@/views/match/MatchDetail.vue';
import JoinMatch from '@/views/match/JoinMatch.vue';
import MatchSetupView from '@/views/match/MatchSetupView.vue';
import EventView from '@/views/match/EventView.vue';
import ReportView from '@/views/match/ReportView.vue';
import StatsView from '@/views/StatsView.vue';
import PublicLiveMatchView from '@/views/public/match/PublicLiveMatchView.vue';
import PublicLiveLayout from '@/views/public/match/PublicLiveLayout.vue';
import MatchesView from '@/views/MatchesView.vue';
import TournamentsView from '@/views/tournament/TournamentsView.vue';
import TournamentDetailView from '@/views/tournament/TournamentDetailView.vue';
import PublicLiveMatchEventsView from '@/views/public/match/PublicLiveMatchEventsView.vue';
import AnalysisView2 from '@/views/AnalysisView2.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'Landing',
          component: LandingView
        },
        {
          path: 'about',
          name: 'About',
          component: AboutView
        },
        {
          path: 'cookies',
          name: 'Cookies',
          component: CookiePolicyView
        },
        {
          path: 'privacy',
          name: 'Privacy',
          component: PrivacyPolicyView
        },
        {
          path: "login",
          name: "Login",
          component: LoginView
        },
        {
          path: '/live/:slug',
          name: 'ClubLiveHub',
          component: () => import('@/views/public/ClubLiveHub.vue')
        },
      ]
    },
    { path: "/auth/callback", component: CallbackView },
    {
      path: '/live/:slug/match/:matchId',
      component: PublicLiveLayout,
      children: [
        {
          path: '',
          name: 'PublicMatchLive',
          component: PublicLiveMatchView
        },
        {
          path: 'events',
          name: 'PublicMatchEvents',
          component: PublicLiveMatchEventsView
        }
      ]
    },
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
          path: 'backoffice/onboard',
          name: 'Registrazione società',
          component: OnboardView
        },
        {
          path: 'backoffice/organization/:id',
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
        {
          path: 'analysis',
          name: 'Analisi video',
          component: AnalysisView2
        },
        {
          path: 'rosters',
          name: 'Roster',
          component: RostersView
        },
        {
          path: 'stats',
          name: 'Statistiche',
          component: StatsView
        },
        {
          path: 'matches/:id',
          component: MatchDetail
        },
        {
          path: 'tournaments',
          name: 'Tornei',
          component: TournamentsView
        },
        {
          path: 'tournaments/:id',
          name: 'Dettagli Torneo',
          component: TournamentDetailView
        },
        {
          path: 'matches',
          name: 'Storico partite',
          component: MatchesView
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

  // Prova a recuperare la sessione se non è ancora stato fatto (es. refresh pagina)
  if (!authStore.isInitialized && !authStore.accessToken) {
    await authStore.refresh()
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      return next({ name: 'Login' })
    }
  }

  next()
})

export default router
