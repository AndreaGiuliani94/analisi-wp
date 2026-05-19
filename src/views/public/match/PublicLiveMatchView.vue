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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useTimerStore } from '@/stores/timerStore';
import type { Team } from '@/interfaces/Team';
import MatchHeader from '@/components/match/public/MatchHeader.vue';
import TeamItem from '@/components/match/public/TeamItem.vue';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { matchPeriodToNumber } from '@/const/consts';
import { MatchEventType } from "@/enum/MatchEventDescription";

const gameStore = useGameStore();
const timerStore = useTimerStore();

const isShrinked = ref(false);
const showConfirmModal = ref(false);
const team = ref<Team | null>(null);

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
