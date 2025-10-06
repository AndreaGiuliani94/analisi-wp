<template>
  <div class="w-full">
    <div v-if="userRole !== 'viewer'" class="flex justify-between items-center">
      <NavButton
        :label="'Pulisci'"
        :icon="TrashIcon"
        :onClick="store.clearDistinta">
      </NavButton>
      <NavButton
        :label="'Reset'"
        :icon="ArrowPathIcon"
        :onClick="store.resetAll">
      </NavButton>
    </div>
  </div>
  <h1 class="text-3xl text-center font-bold mb-4 text-blue-950">Distinta</h1>
  <div
    class="mb-2.5 flex flex-col md:flex-row justify-between gap-3">
    <div
      class="px-2.5 py-1.5 border border-gray-300 rounded-md mb-2.5 flex flex-col justify-between w-full">
      <div class="m-2.5 align-middle font-medium text-lg text-red-700">
        <span>{{ store.match.homeTeam?.name }}</span>
      </div>
      <div v-for="player in store.match.homeTeam?.players" :key="player.number" class="flex justify-start items-center p-1">
        <div class="w-[1.7em]">
          {{ player.number }}.
        </div>
        <input v-if="userRole !== 'viewer'" v-model="player.name" @blur="store.updatePlayerName(player.number, player.name, 0)"
          :placeholder="'Giocatore ' + player.number"
          class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
        <div v-else>
          {{ player.name }}
        </div>
      </div>
    </div>
    <div
      class="px-2.5 py-1.5 border border-gray-300 rounded-md mb-2.5 flex flex-col justify-between w-full">
      <div v-if="userRole !== 'viewer'" class="mb-1.5 mt-1 me-1">
        <input v-if="store.match.awayTeam"
          class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          v-model="store.match.awayTeam.name" id="match-id" placeholder="Avversari" @blur="store.updateMatch(store.match.awayTeam.name)" />
        <input v-else
          class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          v-model="store.opponentsTeamName" id="match-id" placeholder="Avversari" @blur="store.updateMatch(store.opponentsTeamName)" />
      </div>
      <div v-else class="m-2.5 align-middle font-medium text-lg text-red-700">
        {{ store.match.awayTeam.name }}
      </div>
      <div v-for="player in store.match.awayTeam?.players" :key="player.number" class="flex justify-start items-center p-1">
        <div class="w-[1.7em]">
          {{ player.number }}.
        </div>
        <input v-if="userRole !== 'viewer'" v-model="player.name" @blur="store.updatePlayerName(player.number, player.name, 1)"
          :placeholder="'Giocatore ' + player.number"
          class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
        <div v-else>
          {{ player.name }}
        </div>
      </div>
    </div>
  </div>
  <ActionButton :icon="PlayIcon" label="Live!" to="/game/live" :disabled="store.actualPlayers?.length < 7 || store.actualOpponents?.length < 7 || store.match.awayTeam?.name == ''" color="green"/>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { ArrowPathIcon, PlayIcon, TrashIcon } from '@heroicons/vue/20/solid';
import NavButton from '@/components/buttons/NavButton.vue';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { useUserRole } from '@/composables/useUserRole';
import { useSessionStore } from '@/stores/sessionStore';

const store = useGameStore();
const sessionStore = useSessionStore();
const { role: userRole } = useUserRole(sessionStore.currentSession.participants);

onMounted(() => {
  store.loadStore();
});
</script>
