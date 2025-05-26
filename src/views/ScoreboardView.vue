<template>
  <div class="w-full">
    <div class="flex justify-between items-start gap-2">
      <NavButton
        :label="'Distinta'"
        :icon="ArrowLeftIcon"
        to="/game">
      </NavButton>
      <div>
        <div class="text-xl font-bold text-center text-blue-950">{{ store.match.homeTeam.score }} - {{ store.match.awayTeam.score}}</div>
        <div class="text-xl font-bold text-center text-blue-950">{{ store.match.quarter }} T</div>
      </div>
      <NavButton
        :label="'Restart'"
        :icon="ArrowPathIcon"
        :onClick="store.resetTimer">
      </NavButton>
    </div>
  
  </div>
  
  <div class="text-4xl font-bold text-center m-2 text-blue-950">{{ store.formatTime(store.countdown) }}</div>

  <ClockManager />

  <div :style="{ marginTop: `${headerHeight}px` }" class="mb-2.5 flex flex-col xl:flex-row justify-between gap-3">

    <div class="p-2.5 border border-gray-300 rounded-md mb-2.5 flex flex-col font-medium text-lg w-full">
      <div class="ms-2.5 mb-1.5 flex justify-start items-center">
        <a class="text-red-800 flex justify-start items-center cursor-pointer"
        @click="openModal(store.match.homeTeam)">
          <span>SC QUINTO</span>
          <ArrowRightIcon class="size-5 ms-2"/>
        </a>
        <div class="ml-auto flex items-center justify-end gap-1">
          <span class="text-blue-950">TO</span>
          <TimeOutButton 
          :number="1" :teamName="'HOME'" :used="store.match.homeTeam.timeOut1" @toggleTimeOut="toggleTimeOut($event)" />
          <TimeOutButton 
          :number="2" :teamName="'HOME'" :used="store.match.homeTeam.timeOut2" @toggleTimeOut="toggleTimeOut($event)" />
        </div>
      </div>
      
      <div class="flex flex-col text-sm">
        <div v-for="player in store.actualPlayers" :key="player.number"
          class="border border-gray-300 rounded-lg mt-1 flex justify-between items-center overflow-x-auto ">
          <PlayerItem :player="player" :team="store.match.homeTeam" />
        </div>
      </div>
    </div>

    <div class="p-2.5 border border-gray-300 rounded-md mb-2.5 flex flex-col font-medium text-lg w-full">
      <div class="ms-2.5 mb-1.5 flex justify-start items-center">
        <a class="text-red-800 flex justify-start items-center cursor-pointer"
        @click="openModal(store.match.awayTeam)">
          <span>{{store.match.awayTeam.name}}</span>
          <ArrowRightIcon class="size-5 ms-2"/>
        </a>
        <div class="ml-auto flex items-center justify-end gap-1">
          <span class="text-blue-950">TO</span>
          <TimeOutButton 
          :number="1" :teamName="'HOME'" :used="store.match.homeTeam.timeOut1" @toggleTimeOut="toggleTimeOut($event)" />
          <TimeOutButton 
          :number="2" :teamName="'HOME'" :used="store.match.homeTeam.timeOut2" @toggleTimeOut="toggleTimeOut($event)" />
          <!--
          <label class="inline-flex items-center cursor-pointer ml-auto">
            <input type="checkbox" v-model="store.opponentsTimerActivated" class="sr-only peer">
            <div
              class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
            </div>
            <span class="ms-3 text-sm font-medium text-gray-900">Abilita Tempo</span>
          </label> 
          -->
        </div>
      </div>
      
      <div class="flex flex-col text-sm">
        <div v-for="player in store.actualOpponents" :key="player.number"
          class="border border-gray-300 rounded-lg mt-1 flex justify-between items-center overflow-x-auto ">
          <PlayerItem :player="player" :team="store.match.awayTeam" />
        </div>
      </div>
    </div>

  </div>

  <div class="flex justify-center items-center gap-10 p-2 m-5" role="group">
    <button @click="$router.push('/game/report')"
      class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors">
      <TableCellsIcon class="size-6 me-1" />Report</button>
    <button @click="$router.push('/game/events')" :disabled="store.events.length == 0"
      class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed">
      <CalendarDaysIcon class="size-6 me-1" />Eventi</button>
  </div>

  <!-- Modale con statistiche -->
  <QuickReportModal :isOpen="showConfirmModal" :team="team"
        @confirm="confirmCleanup" @close="showConfirmModal = false" />
</template>

<script setup lang="ts">
import { useElementStore } from '@/stores/gameStore';
import PlayerItem from '@/components/PlayerItem.vue';
import ClockManager from '@/components/ClockManager.vue';
import { ArrowLeftIcon, ArrowPathIcon, ArrowRightIcon, CalendarDaysIcon, TableCellsIcon } from '@heroicons/vue/20/solid';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import QuickReportModal from '@/components/modals/QuickReportModal.vue';
import type { Team } from '@/components/Interfaces/Team';
import TimeOutButton from '@/components/buttons/TimeOutButton.vue';
import NavButton from '@/components/buttons/NavButton.vue';

const store = useElementStore();

const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)

const updateHeaderHeight = () => {
  if (headerRef.value) {
    headerHeight.value = headerRef.value.getBoundingClientRect().height
  }
}

onMounted(() => {
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