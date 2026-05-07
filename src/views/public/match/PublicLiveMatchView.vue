<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"></div>
    <p class="text-blue-950 font-bold animate-pulse">Caricamento partita in corso...</p>
  </div>

  <div v-else>
    <nav class="bg-blue-950 text-white p-2 h-12 flex items-center justify-between">
        <div class="flex justify-between items-center">
            <router-link :to="'/live/' + slug " class="flex items-center space-x-1"
                :class="{ 'font-bold': $route.path === '/' }">
                  <!-- <Icon name="dashboard" size="w-5 h-5" /> -->
                <ArrowLeftIcon class="size-5"></ArrowLeftIcon>
                <span class="hidden sm:inline">Live Hub</span>
            </router-link>
        </div>
        <div class="space-x-2 flex bg-blue-900/50 p-1 rounded-lg">
            <router-link :to="'/live/' + slug + '/match/' + sessionId " class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
              active-class="font-bold bg-blue-600 text-white">
              <!-- <Icon name="analisi" size="w-5 h-5" view-box="0 0 122.88 108.06" /> -->
              <span class="hidden sm:inline">Live</span>
            </router-link>
            <router-link :to="'/live/' + slug + '/match/' + sessionId + '/events' " 
              class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
              active-class="font-bold bg-blue-600 text-white">
              <!-- <WrenchScrewdriverIcon class="size-5"></WrenchScrewdriverIcon> -->
              <span class="hidden sm:inline">Cronaca</span>
            </router-link>
        </div>
        <!-- Badge -->
        <MatchStatusBadge :status="gameStore.match.status" :is-live="gameStore.match.isLive"/>
    </nav>
    <div class="p-2 md:p-4">
        <!-- Header della Partita -->
        <MatchHeader
          :home-team="gameStore.match?.homeTeam"
          :away-team="gameStore.match?.awayTeam"
          :formatted-time="timerStore.formattedTime"
          :partials="gameStore.partials"
          :current-period="timerStore.currentPeriod"
          :is-shrinked="isShrinked"
          :status="gameStore.match.status"
          :is-live="gameStore.match.isLive"
          :penalty-partial="penaltyScorePartial"
          :penalty-events="penaltyEvents"
        />
    
        <!-- Team Rosters (Read-only) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4" :class="{ 'mt-50': isShrinked }">
          <TeamItem v-if="gameStore.match?.homeTeam" :teamKey="'HOME'" :team="gameStore.match.homeTeam"
            :players="gameStore.actualPlayers" @openModal="openModal" />
          <TeamItem v-if="gameStore.match?.awayTeam" :teamKey="'AWAY'" :team="gameStore.match.awayTeam"
            :players="gameStore.actualOpponents" @openModal="openModal" />
        </div>
      </div>
    </div>
  <QuickReportModal v-if="team" :isOpen="showConfirmModal" :team="team" @confirm="confirmCleanup"
    @close="showConfirmModal = false" />
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { useTimerStore } from '@/stores/timerStore';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { useSessionStateStore } from '@/stores/sessionStateStore';
import { useRoute } from 'vue-router';
import type { Team } from '@/interfaces/Team';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import TeamItem from '@/components/match/public/TeamItem.vue';
import MatchHeader from '@/components/match/public/MatchHeader.vue';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { matchPeriodToNumber } from '@/const/consts';
import { MatchEventType } from "@/enum/MatchEventDescription";

const route = useRoute();
const sessionId = route.params.sessionId as string;
const slug = route.params.slug as string;

const gameStore = useGameStore();
const timerStore = useTimerStore();
const realtimeStore = useRealtimeStore();
const penaltyScorePartial = computed(() => gameStore.penaltyScorePartial);
const penaltyEvents = computed(() => 
  gameStore.events.filter(e => e.quarter === matchPeriodToNumber[MatchPeriod.PENALTIES] && e.eventType === MatchEventType.SHOT)
);
const sessionStateStore = useSessionStateStore();

const loading = ref(true);
const isShrinked = ref(false);

const showConfirmModal = ref(false);

const confirmCleanup = async () => {
  showConfirmModal.value = false;
};

const team = ref();

const openModal = (team_: Team) => {
  showConfirmModal.value = true;
  team.value = team_;
}

const handleScroll = () => {
  // Definisci una soglia di scroll, ad esempio 100px
  const scrollThreshold = 100; 
  isShrinked.value = window.scrollY > scrollThreshold;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onMounted(async () => {
  try {
    await sessionStateStore.joinPublicSession(sessionId);
    realtimeStore.subscribeToMatch();
  } catch (err) {
    console.error("Errore durante l'idratazione della sessione pubblica:", err);
  } finally {
    loading.value = false;
  }
})

onUnmounted(() => {
  realtimeStore.unsubscribe();
  window.removeEventListener('scroll', handleScroll);
})
</script>
