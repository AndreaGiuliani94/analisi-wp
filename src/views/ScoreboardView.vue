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

  <div class="flex flex-col h-min-screen">
    <div v-if="userRole && userRole !== 'viewer'" class="sticky top-0 bg-white/90 backdrop-blur-md pb-2 transition-all duration-300">
      <div class="grid grid-cols-3">
        <div class="inline-flex items-end m-2">
          <ModeToggleItem :hide-labels="isShrinked" class="transition-all duration-300" />
        </div>
        <div class="font-bold flex justify-center text-end m-2 text-blue-950 text-4xl">
          {{ store.formatTime(store.countdown) }}
        </div>
      </div>
      <ClockManager :shrink="isShrinked" />
      
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
  </div>

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
import ModeToggleItem from '@/components/ModeToggleItem.vue';

const store = useGameStore();
const sessionStore = useSessionStore()
const authStore = useAuthStore()

const isShrinked = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)

const { role: userRole } = useUserRole(sessionStore.currentSession.participants)

const updateHeaderHeight = () => {
  if (headerRef.value) {
    headerHeight.value = headerRef.value.getBoundingClientRect().height
  }
}

const updateScroll = () => {
  // Verifichiamo la posizione verticale della finestra
  const scrollThreshold = 60 
  isShrinked.value = window.scrollY > scrollThreshold
}

onMounted(async () => {
  const sessionIdLS = localStorage.getItem("session_id");
  if (sessionIdLS !== null && authStore.user != null) {
      console.log("Ruolo utente:", userRole.value);
  }
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
  window.addEventListener('scroll', updateScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeaderHeight)
  window.removeEventListener('scroll', updateScroll)
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