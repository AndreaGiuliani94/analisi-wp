<template>
  <div class="w-full" :class="{'mb-5': userRole && userRole ==='viewer'}">
    <div class="grid grid-cols-3">
      <div class="justify-self-start">
        <NavButton
        :label="'Distinta'"
        :icon="ArrowLeftIcon"
          to="/game">
        </NavButton>
      </div>
      <div class="text-xl font-bold text-center text-blue-950">
        <div >{{ store.match.homeTeam.score }} - {{ store.match.awayTeam.score}}</div>
        <div v-if="userRole && userRole !== 'viewer'">{{ store.match.quarter }} T</div>
      </div>
      <div class="justify-self-end">
        <NavButton
          v-if="userRole && userRole !== 'viewer'"
          :label="'Restart'"
          :icon="ArrowPathIcon"
          :onClick="store.resetTimer">
        </NavButton>
      </div>
    </div>
  
  </div>
  
  <div v-if="userRole && userRole !== 'viewer'">

    <div class="text-4xl font-bold text-center m-2 text-blue-950">{{ store.formatTime(store.countdown) }}</div>
  
    <ClockManager />

  </div>

  <div :style="{ marginTop: `${headerHeight}px` }" class="mb-2.5 flex flex-col xl:flex-row justify-between gap-3">

    <TeamItem :teamKey="'HOME'" :team="store.match.homeTeam" :players="store.actualPlayers"
      @openModal="openModal"
      @toggleTimeOut="toggleTimeOut"></TeamItem>

    <TeamItem :teamKey="'AWAY'" :team="store.match.awayTeam" :players="store.actualOpponents"
      @openModal="openModal"
      @toggleTimeOut="toggleTimeOut"></TeamItem>

  </div>

  <div class="flex justify-center items-center gap-10" role="group">
    <ActionButton :icon="TableCellsIcon" label="Report" to="/game/report" color="green" position="center"/>
    <ActionButton :icon="CalendarDaysIcon" label="Eventi" to="/game/events" color="green" position="center" :disabled="store.events.length == 0"/>
  </div>

  <!-- Modale con statistiche -->
  <QuickReportModal :isOpen="showConfirmModal" :team="team"
        @confirm="confirmCleanup" @close="showConfirmModal = false" />
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import ClockManager from '@/components/ClockManager.vue';
import { ArrowLeftIcon, ArrowPathIcon, CalendarDaysIcon, TableCellsIcon } from '@heroicons/vue/20/solid';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import type { Team } from '@/components/Interfaces/Team';
import NavButton from '@/components/buttons/NavButton.vue';
import TeamItem from '@/components/TeamItem.vue';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserRole } from '@/composables/useUserRole';

const store = useGameStore();
const sessionStore = useSessionStore()
const authStore = useAuthStore()

const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)

const { role: userRole } = useUserRole(sessionStore.currentSession.participants)

const updateHeaderHeight = () => {
  if (headerRef.value) {
    headerHeight.value = headerRef.value.getBoundingClientRect().height
  }
}

onMounted(async () => {
  const sessionIdLS = localStorage.getItem("session_id");
  if (sessionIdLS !== null && authStore.user != null) {
      console.log("Ruolo utente:", userRole.value);
  }
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeaderHeight)
})

const toggleTimeOut = (payload : { number: number, teamName: string}) => {
  store.toggleTimeOut(payload.number, payload.teamName);
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

</script>