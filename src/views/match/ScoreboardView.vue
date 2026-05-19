<template>
  <ScoreboardHeader
    :match="gameStore.match"
    :partials="gameStore.partials"
    :formatted-time="timerStore.formattedTime"
    :current-period="timerStore.currentPeriod"
    :is-shrinked="isShrinked"
    :user-role="userRole"
    :is-correction-mode="gameStore.isCorrectionMode"
    :is-timer-master="timerStore.isTimerMaster && timerStore.currentPeriod !== matchPeriodToNumber[MatchPeriod.PENALTIES]"
    :penalty-partial="penaltyScorePartial"
    @restart-match="openConfirmRestart"
    @end-match="isEndMatchModalOpen = true"
    @suspend-match="openConfirmSuspend"
    @cancel-match="openConfirmCancel"
    @remove-quarter="gameStore.removeQuarter"
    @start-public-live="gameStore.startPublicLive"
    @end-public-live="gameStore.endPublicLive"
  />

  <div v-if="timerStore.currentPeriod === matchPeriodToNumber[MatchPeriod.PENALTIES]" class="h-fit">
    <PenaltyArena 
      :turn-number="currentPenaltyTurn"
      :home-team-name="gameStore.match.homeTeam.name"
      :away-team-name="gameStore.match.awayTeam.name"
      :shooting-team-name="activeTeam.name"
      :shooters="activeTeamShooters"
      :opposing-goalies="defendingTeamGoalies"
      :penalty-events="penaltyEvents"
      :isMatchInProgress="isMatchInProgress"
      @save-penalty="handlePenaltySave"
      @set-starting-team="homeStartsFirst = $event"
    />
  </div>

  <div class="mb-2.5 flex flex-col xl:flex-row justify-between gap-3"
    :class="{ 'mt-50': isShrinked }">

    <TeamItem :teamKey="'HOME'" :team="gameStore.match.homeTeam" :players="gameStore.actualPlayers"
      @openModal="openModal"
      @toggleTimeOut="toggleTimeOut"></TeamItem>

    <TeamItem :teamKey="'AWAY'" :team="gameStore.match.awayTeam" :players="gameStore.actualOpponents"
      @openModal="openModal"
      @toggleTimeOut="toggleTimeOut"></TeamItem>

  </div>

  <QuickReportModal 
    v-if="team" 
    :isOpen="showConfirmModal" 
    :team="team"
    @confirm="confirmCleanup" 
    @close="showConfirmModal = false" />

  <EndMatchModal 
    :isOpen="isEndMatchModalOpen"
    :hide-penalties="timerStore.currentPeriod === matchPeriodToNumber[MatchPeriod.PENALTIES]"
    @close="isEndMatchModalOpen = false"
    @confirmEnd="handleConfirmEnd"
    @goToPenalties="handleGoToPenalties"
  />

  <ConfirmModal
    :isOpen="isActionConfirmModalOpen"
    :title="actionConfirmModalTitle"
    :message="actionConfirmModalMessage"
    :button-color="actionConfirmModalButtonColor"
    @confirm="handleActionConfirm"
    @close="isActionConfirmModalOpen = false"
  />

</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { onMounted, onUnmounted, ref, toRef, computed } from 'vue';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import type { Team } from '@/interfaces/Team';
import TeamItem from '@/components/TeamItem.vue';
import { useTimerStore } from '@/stores/timerStore';
import ScoreboardHeader from '@/components/match/ScoreboardHeader.vue';
import EndMatchModal from '@/components/modals/EndMatchModal.vue';
import { useToast } from 'vue-toastification';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { matchPeriodToNumber } from '@/const/consts';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import PenaltyArena from '@/components/match/PenaltyArena.vue';
import { MatchEventType } from "@/enum/MatchEventDescription";
import { ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import { MatchStatus } from '@/enum/MatchStatus';
import { useMatchStateStore } from '@/stores/matchStateStore';
import { usePermissions } from '@/composables/usePermissions';

const gameStore = useGameStore()
const timerStore = useTimerStore()

const isShrinked = ref(false)
const isEndMatchModalOpen = ref(false)
const isActionConfirmModalOpen = ref(false)
const actionConfirmModalTitle = ref('')
const actionConfirmModalMessage = ref('')
const actionConfirmModalButtonColor = ref<'red' | 'green' | 'blue' | 'gray'>('red')

const matchStateStore = useMatchStateStore();
const userRole = matchStateStore.userRole;

const updateScroll = () => {
  // Se siamo ai rigori, l'header non deve rimpicciolirsi mai
  if (timerStore.currentPeriod === matchPeriodToNumber[MatchPeriod.PENALTIES]) {
    isShrinked.value = false;
    return;
  }

  const scrollThreshold = 100 
  isShrinked.value = window.scrollY > scrollThreshold
}

const toggleTimeOut = (payload : { number: number, teamName: string}) => {
  gameStore.toggleTimeOut(payload.number, payload.teamName);
}

const showConfirmModal = ref(false);

const confirmCleanup = async () => {
  showConfirmModal.value = false;
};

const team = ref();

const openModal = (team_: Team) => {
  showConfirmModal.value = true;
  team.value = team_;
}

const restartMatch = async () => {
  gameStore.restartMatch();
  timerStore.resetTimer();
};

const handleConfirmEnd = async () => {
  await gameStore.endMatch();
  isEndMatchModalOpen.value = false;
};

const handleGoToPenalties = async () => {
  isEndMatchModalOpen.value = false;
  isShrinked.value = false; // Reset immediato dello stato shrink
  await timerStore.goToPenalties(gameStore.match.id);
};

const penaltyScorePartial = computed(() => gameStore.penaltyScorePartial);
const isMatchInProgress = computed(() => gameStore.match.status === MatchStatus.IN_PROGRESS);

/** 
 * LOGICA RIGORI
 */
const penaltyEvents = computed(() => 
  gameStore.events.filter(e => e.quarter === matchPeriodToNumber[MatchPeriod.PENALTIES] && e.eventType === MatchEventType.SHOT)
);

const homeStartsFirst = ref(true);

const currentPenaltyTurn = computed(() => Math.floor(penaltyEvents.value.length / 2) + 1);

const isHomeTurn = computed(() => {
  const isEven = penaltyEvents.value.length % 2 === 0;
  return homeStartsFirst.value ? isEven : !isEven;
});

const activeTeam = computed(() => isHomeTurn.value ? gameStore.match.homeTeam : gameStore.match.awayTeam);
const defendingTeam = computed(() => isHomeTurn.value ? gameStore.match.awayTeam : gameStore.match.homeTeam);

const activeTeamShooters = computed(() => 
  activeTeam.value.players.filter(p => p.name && p.name.trim() !== '' && !gameStore.isOut(p))
);

const defendingTeamGoalies = computed(() => 
  defendingTeam.value.players.filter(p => p.isGK && p.name && p.name.trim() !== '')
);

const handlePenaltySave = async (payload: any) => {
  const shooter = activeTeam.value.players.find(p => p.id === payload.shooter_id);
  if (!shooter) return;

  if (payload.outcome === ShotOutcome.GOAL) {
    activeTeam.value.score++;
  }

  await gameStore.saveEvent({
    eventType: MatchEventType.SHOT,
    currentTeam: activeTeam.value,
    player: shooter,
    details: {
      shotCategory: ShotCategory.PENALTY,
      shotOutcome: payload.outcome,
      defendingGoalkeeperId: payload.goalkeeper_id
    }
  });
};

const openConfirmRestart = () => {
  actionConfirmModalTitle.value = 'Riavvia Partita';
  actionConfirmModalMessage.value = 'Sei sicuro di voler riavviare la partita? Tutti i dati salvati fino a questo momento verranno cancellati.';
  actionConfirmModalButtonColor.value = 'red';
  isActionConfirmModalOpen.value = true;
  currentAction.value = 'restart';
};

const openConfirmSuspend = () => {
  actionConfirmModalTitle.value = 'Sospendi Partita';
  actionConfirmModalMessage.value = 'Sei sicuro di voler sospendere la partita? Il cronometro verrà messo in pausa e lo stato del match cambierà in "Sospeso".';
  actionConfirmModalButtonColor.value = 'blue';
  isActionConfirmModalOpen.value = true;
  currentAction.value = 'suspend';
};

const openConfirmCancel = () => {
  actionConfirmModalTitle.value = 'Annulla Partita';
  actionConfirmModalMessage.value = 'Sei sicuro di voler annullare la partita? Questa azione è irreversibile e il match verrà contrassegnato come "Annullato".';
  actionConfirmModalButtonColor.value = 'red';
  isActionConfirmModalOpen.value = true;
  currentAction.value = 'cancel';
};

const currentAction = ref<'suspend' | 'cancel' | 'restart' | null>(null);

const handleActionConfirm = async () => {
  if (currentAction.value === 'suspend') {
    await timerStore.masterStop();
    await gameStore.suspendMatch();
    useToast().info("Partita sospesa con successo!");
  } else if (currentAction.value === 'cancel') {
    await gameStore.cancelMatch();
    useToast().info("Partita annullata con successo!");
  } else if (currentAction.value === 'restart') {
    await restartMatch();
    useToast().info("Partita riavviata con successo!");
  }
  isActionConfirmModalOpen.value = false;
  currentAction.value = null;
};

onMounted(() => {
  window.addEventListener('scroll', updateScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
})

</script>