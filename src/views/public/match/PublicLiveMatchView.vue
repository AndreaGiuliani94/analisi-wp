<template>
  <div class="p-2 md:p-4">
    <MatchHeader 
      :home-team="gameStore.match?.homeTeam"
      :away-team="gameStore.match?.awayTeam"
      :formatted-time="timerStore.formattedTime"
      :partials="gameStore.partials"
      :current-period="timerStore.currentPeriod"
      :is-shrinked="isShrinked"
      :status="gameStore.match?.status"
      :is-live="gameStore.match?.isLive"
      :penalty-partial="penaltyScorePartial"
      :penalty-events="penaltyEvents"
      :class="{ 
        'ring-4 ring-blue-500 animate-pulse transition-all duration-300': flashingTeam === 'home',
        'ring-4 ring-red-700 animate-pulse transition-all duration-300': flashingTeam === 'away'
      }"
      class="rounded-3xl"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4" :class="{ 'mt-50': isShrinked }">
      <TeamItem v-if="gameStore.match?.homeTeam" :teamKey="'HOME'" :team="gameStore.match.homeTeam"
        :players="gameStore.actualPlayers" @openModal="openModal" />
      <TeamItem v-if="gameStore.match?.awayTeam" :teamKey="'AWAY'" :team="gameStore.match.awayTeam"
        :players="gameStore.actualOpponents" @openModal="openModal" />
    </div>
  </div>

  <QuickReportModal v-if="team" :isOpen="showConfirmModal" :team="team" @confirm="confirmCleanup"
    @close="showConfirmModal = false" />

  <!-- Notifica Tiro -->
  <ShotToast
    v-model="showGoalToast" 
    :event="lastGoalEvent" 
    :is-home="isHomeGoal" 
    :team-name="goalTeamName"
  />

  <!-- Notifica Fallo -->
  <FoulToast 
    v-model="showFoulToast" 
    :event="lastFoulEvent" 
    :is-home="isHomeFoul" 
    :team-name="foulTeamName"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useTimerStore } from '@/stores/timerStore';
import type { Team } from '@/interfaces/Team';
import MatchHeader from '@/components/match/public/MatchHeader.vue';
import TeamItem from '@/components/match/public/TeamItem.vue';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { matchPeriodToNumber } from '@/const/consts';
import { MatchEventType } from "@/enum/MatchEventDescription";
import { ShotOutcome } from '@/enum/ShotDescription';
import ShotToast from '@/components/toasts/ShotToast.vue';
import FoulToast from '@/components/toasts/FoulToast.vue';

const gameStore = useGameStore();
const timerStore = useTimerStore();

const isShrinked = ref(false);
const showConfirmModal = ref(false);
const team = ref<Team | null>(null);

// Stati per Animazione Gol
const showGoalToast = ref(false);
const lastGoalEvent = ref<any>(null);
const isHomeGoal = ref(false);
const goalTeamName = ref('');
const flashingTeam = ref<'home' | 'away' | null>(null);

// Stati per Animazione Falli
const showFoulToast = ref(false);
const lastFoulEvent = ref<any>(null);
const isHomeFoul = ref(false);
const foulTeamName = ref('');

/**
 * Monitora i nuovi eventi per rilevare i gol in tempo reale
 */
watch(() => gameStore.events.length, (newLength, oldLength) => {
  // Evitiamo di triggerare l'animazione al caricamento iniziale della pagina
  if (newLength < oldLength) return;

  const lastEvent = gameStore.events[newLength - 1];
  
  // Verifica se l'ultimo evento è un TIRO (qualsiasi esito)
  if (lastEvent.eventType === MatchEventType.SHOT) {
    lastGoalEvent.value = lastEvent;
    isHomeGoal.value = lastEvent.team === gameStore.match?.homeTeam?.name;
    goalTeamName.value = lastEvent.team || '';
    
    // Avvia il Toast
    showGoalToast.value = true;
    
    // Avvia il lampeggiamento dell'header
    flashingTeam.value = isHomeGoal.value ? 'home' : 'away';

    setTimeout(() => {
      showGoalToast.value = false;
      flashingTeam.value = null;
    }, 5000);
  } else if (lastEvent.eventType === MatchEventType.FOUL) {
    lastFoulEvent.value = lastEvent;
    isHomeFoul.value = lastEvent.team === gameStore.match?.homeTeam?.name;
    foulTeamName.value = lastEvent.team || '';
    
    // Avvia il Toast dei falli
    showFoulToast.value = true;
    
    // Facciamo lampeggiare l'header anche per le espulsioni
    flashingTeam.value = isHomeFoul.value ? 'home' : 'away';

    setTimeout(() => {
      showFoulToast.value = false;
      flashingTeam.value = null;
    }, 5000);
  }
});

const penaltyScorePartial = computed(() => gameStore.penaltyScorePartial);
const penaltyEvents = computed(() =>
  gameStore.events.filter(e => e.quarter === matchPeriodToNumber[MatchPeriod.PENALTIES] && e.eventType === MatchEventType.SHOT)
);

const confirmCleanup = async () => {
  showConfirmModal.value = false;
};

const openModal = (team_: Team) => {
  showConfirmModal.value = true;
  team.value = team_;
}

const handleScroll = () => {
  const scrollThreshold = 100;
  isShrinked.value = window.scrollY > scrollThreshold;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
