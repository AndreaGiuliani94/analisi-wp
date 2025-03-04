<template>
  <div class="w-full">
    <div class="flex justify-start items-center gap-2">
      <button @click="$router.push('/game')"
        class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-2 py-1 text-center shadow-lg cursor-pointer">
        <font-awesome-icon :icon="['fas', 'arrow-left']" /> Distinta
      </button>
      <button @click="store.resetTimer()"
        class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-2 py-1 text-center shadow-lg cursor-pointer ml-auto">
        <font-awesome-icon :icon="['fas', 'refresh']" /> Restart
      </button>
    </div>
  </div>
  <div class="text-xl font-bold text-center mt-2 text-blue-950">{{ store.match.goals }} - {{ store.match.opponentsGoals }}</div>
  <div class="text-xl font-bold text-center mt-2 text-blue-950">{{ store.match.quarter }} T</div>
  <div class="text-4xl font-bold text-center m-2 text-blue-950">{{ store.formatTime(store.countdown) }}</div>

  <ClockManager />

  <div class="mb-2.5 flex flex-col md:flex-row justify-between gap-3">

    <div class="px-2.5 py-1.5 border border-gray-300 rounded-md mb-2.5 flex flex-col justify-between w-full">
      <div class="m-2.5 align-middle font-medium text-lg text-red-700">
        <span>SC QUINTO</span>
      </div>
      <div class="flex flex-col md:grid md:grid-cols-2 ">
        <div v-for="player in store.actualPlayers" :key="player.number"
          class="border border-gray-300 rounded-lg m-2 flex justify-between items-center overflow-x-auto ">
          <PlayerItem :player="player" :team="homeTeam" />
        </div>
      </div>
    </div>

    <div class="px-2.5 py-1.5 border border-gray-300 rounded-md mb-2.5 flex flex-col w-full">
      <div class="m-2.5 align-middle font-medium text-lg text-red-700 flex">
        <span>{{ store.match.opponentsTeam }}</span>
        <label class="inline-flex items-center cursor-pointer ml-auto">
          <input type="checkbox" v-model="store.opponentsTimerActivated" class="sr-only peer">
          <div
            class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
          </div>
          <span class="ms-3 text-sm font-medium text-gray-900">Abilita Tempo</span>
        </label>
      </div>
      <div class="flex flex-col md:grid md:grid-cols-2">
        <div v-for="player in store.actualOpponents" :key="player.number"
          class="border border-gray-300 rounded-lg m-2 flex justify-between items-center overflow-x-auto ">
          <PlayerItem :player="player" :team="opponentTeam" />
        </div>
      </div>
    </div>

  </div>

  <div class="flex justify-center items-center gap-10 p-2 m-5" role="group">
    <button @click="$router.push('/report')"
      class="p-2.5 text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors">
      <font-awesome-icon :icon="['fas', 'table-list']" /> Report</button>
    <button @click="$router.push('/events')" :disabled="store.events.length == 0"
      class="p-2.5 text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed">
      <font-awesome-icon :icon="['fas', 'calendar-days']" /> Eventi</button>
  </div>
</template>

<script lang="ts">
import { useElementStore } from '@/stores/gameStore';
import PlayerItem from '@/components/PlayerItem.vue';
import ClockManager from '@/components/ClockManager.vue';
import type { Team } from '@/components/Interfaces/Team';

export default {
  components: { PlayerItem, ClockManager },
  setup() {
    const store = useElementStore();
    var homeTeam: Team = {
      name: 'HOME',
      activatedTimer: true,
    };
    var opponentTeam: Team = {
      name: 'AWAY',
      activatedTimer: store.opponentsTimerActivated,
    };
    return { store, homeTeam, opponentTeam };
  },
};
</script>