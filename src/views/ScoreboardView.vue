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
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-3">
          <div class="text-3xl font-bold text-center text-blue-950">
            <div v-if="!isShrinked">
              <div >{{ gameStore.match.homeTeam.score }} - {{ gameStore.match.awayTeam.score}}</div>
              <div class="flex gap-1 text-sm font-medium self-end mb-1">
                <template v-for="(p, i) in gameStore.partials" :key="i">
                  <span class="flex items-center" >
                    <span class="text-xs mr-0.5 text-gray-400" v-if="i > 0">|</span>
                    <span :class="[
                      i + 1 > gameStore.match.quarter ? 'text-gray-400' : 'text-blue-950', 
                      i + 1 == gameStore.match.quarter ? 'animate-pulse bg-blue-950 text-white px-1 rounded-2xl' : '']" 
                      >{{ p.home }}-{{ p.away }}</span>
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="justify-self-end">
        <NavButton
          v-if="userRole && userRole !== 'viewer'"
          :label="'Restart'"
          :icon="ArrowPathIcon"
          :onClick="gameStore.resetTimer">
        </NavButton>
      </div>
    </div>
  
  </div>

  <div class="flex flex-col h-min-screen">
    <div v-if="userRole && userRole !== 'viewer'" class="sticky bg-white/90 backdrop-blur-md pb-2 rounded-lg border transition-all duration-300"
      :class="[isShrinked ? 'shadow-lg border-gray-300 top-1 z-10' : 'border-white top-0']">
      <div class="grid grid-cols-3">
        <div class="inline-flex items-end transition-all duration-300" :class="isShrinked ? 'm-2' : ''">
          <ModeToggleItem :hide-labels="isShrinked" class="transition-all duration-300" />
        </div>
        <div class="font-bold flex justify-center text-end m-2 text-blue-950 text-4xl">
          {{ gameStore.formatTime(gameStore.countdown) }}
        </div>
        <div v-if="isShrinked" class="flex justify-end items-center mr-2 text-xl font-bold text-center text-blue-950 transition-all duration-300">
          <div class="grid grid-rows-2 transition-all duration-300">
            <div >{{ gameStore.match.homeTeam.score }} - {{ gameStore.match.awayTeam.score}}</div>
            <div class="flex justify-center items-center text-base transition-all duration-300">
              <button v-if="isCorrectionMode" @click="gameStore.removeQuarter()" 
                class="flex items-center justify-center w-5 h-5 rounded-full
                        transition text-white bg-red-800 border border-red-800
                        disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200" >
                <MinusIcon class="size-3 stroke-4 text-white" /> 
              </button>
              <div :class="isCorrectionMode ? 'ml-2' : ''">{{ gameStore.match.quarter }} T</div>
            </div>
          </div>
        </div>
      </div>
      <ClockManager :shrink="isShrinked" />
      
    </div>
  
    <div :style="{ marginTop: `${headerHeight}px` }" class="mb-2.5 flex flex-col lg:flex-row justify-between gap-3">
  
      <TeamItem :teamKey="'HOME'" :team="gameStore.match.homeTeam" :players="gameStore.actualPlayers"
        @openModal="openModal"
        @toggleTimeOut="toggleTimeOut"></TeamItem>
  
      <TeamItem :teamKey="'AWAY'" :team="gameStore.match.awayTeam" :players="gameStore.actualOpponents"
        @openModal="openModal"
        @toggleTimeOut="toggleTimeOut"></TeamItem>
  
    </div>
  
    <div class="flex justify-center items-center gap-10" role="group">
      <ActionButton :icon="TableCellsIcon" label="Report" to="/game/report" color="green" position="center"/>
      <ActionButton :icon="CalendarDaysIcon" label="Eventi" to="/game/events" color="green" position="center" :disabled="gameStore.events.length == 0"/>
    </div>
    <!-- Modale con statistiche -->
    <QuickReportModal v-if="team" :isOpen="showConfirmModal" :team="team"
          @confirm="confirmCleanup" @close="showConfirmModal = false" />
  </div>

</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import ClockManager from '@/components/ClockManager.vue';
import { ArrowLeftIcon, ArrowPathIcon, CalendarDaysIcon, TableCellsIcon } from '@heroicons/vue/20/solid';
import { onBeforeUnmount, onMounted, onUnmounted, ref, toRef } from 'vue';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import type { Team } from '@/interfaces/Team';
import NavButton from '@/components/buttons/NavButton.vue';
import TeamItem from '@/components/TeamItem.vue';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserRole } from '@/composables/useUserRole';
import ModeToggleItem from '@/components/ModeToggleItem.vue';
import { MinusIcon } from '@heroicons/vue/24/outline';
import { useRealtimeStore } from '@/stores/realtimeStore';

const authStore = useAuthStore()
const gameStore = useGameStore();
const sessionStore = useSessionStore()
const realtimeStore = useRealtimeStore()
const isCorrectionMode = toRef(gameStore, 'isCorrectionMode');

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

onMounted(async () => {
  const sessionIdLS = localStorage.getItem("session_id");
  if (sessionIdLS !== null && authStore.user != null) {
      console.log("Ruolo utente:", userRole.value);
  }
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
  window.addEventListener('scroll', updateScroll)

  realtimeStore.subscribeToMatch();
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeaderHeight)
  window.removeEventListener('scroll', updateScroll)
})

onUnmounted(() => {
  // Quando usciamo dalla pagina Live, chiudiamo il WebSocket
  realtimeStore.unsubscribe();
});

</script>