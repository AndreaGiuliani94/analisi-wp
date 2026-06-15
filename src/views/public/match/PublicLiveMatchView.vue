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
        'ring-4 animate-pulse transition-all duration-300': flashingTeam === 'home' || flashingTeam === 'away'
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

  <!-- Notifica Generica (es. Timeout) -->
  <NotificationToast
    v-model="showNotificationToast"
    :title="notificationTitle"
    :message="notificationMessage"
    :is-home="isHomeNotification"
    :icon="notificationIcon"
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
import ShotToast from '@/components/toasts/ShotToast.vue';
import FoulToast from '@/components/toasts/FoulToast.vue';
import NotificationToast from './NotificationToast.vue';
import { ClockIcon } from '@heroicons/vue/24/outline';
import { FoulType } from '@/enum/ExclutionDescription';

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

// Stati per Notifiche Generiche
const showNotificationToast = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const isHomeNotification = ref(false);
const notificationIcon = ref<any>(null);

/**
 * Monitora i nuovi eventi per rilevare i gol in tempo reale
 */
watch(() => gameStore.events.length, (newLength, oldLength) => {
  // Interrompiamo sempre l'animazione del giocatore all'arrivo di un nuovo evento
  if (gameStore.highlightTimeoutId) {
    clearTimeout(gameStore.highlightTimeoutId);
    gameStore.highlightTimeoutId = null;
  }
  gameStore.highlightedPlayerId = null;

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

    // Se è un fallo grave (EXCL o PEN), attiva l'animazione sul giocatore
    if (lastEvent.playerId && (lastEvent.foulType === FoulType.EXCL || lastEvent.foulType === FoulType.PEN)) {
      gameStore.highlightedPlayerId = lastEvent.playerId;
      
      // Timer di 18 secondi per rimuovere l'evidenziazione
      gameStore.highlightTimeoutId = setTimeout(() => {
        gameStore.highlightedPlayerId = null;
      }, 18000);
    }
    
    // Avvia il Toast dei falli
    showFoulToast.value = true;
    
    // Facciamo lampeggiare l'header anche per le espulsioni
    flashingTeam.value = isHomeFoul.value ? 'home' : 'away';

    setTimeout(() => {
      showFoulToast.value = false;
      flashingTeam.value = null;
    }, 5000);
  } else if (lastEvent.eventType === MatchEventType.TIME_OUT) {
    // Imposta i valori per la notifica di timeout
    notificationTitle.value = 'TIME OUT';
    notificationMessage.value = `${lastEvent.team} ha richiesto un timeout.`;
    isHomeNotification.value = lastEvent.team === gameStore.match?.homeTeam?.name;
    notificationIcon.value = ClockIcon;

    // Avvia il Toast della notifica
    showNotificationToast.value = true;

    setTimeout(() => {
      showNotificationToast.value = false;
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
