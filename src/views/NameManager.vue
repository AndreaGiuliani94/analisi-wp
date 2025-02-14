<template>
  <div class="w-full">
    <div class="flex justify-start items-center gap-2">
      <button @click="store.clearDistinta()"
        class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-2 py-1 text-center shadow-lg cursor-pointer">
        <font-awesome-icon :icon="['fas', 'eraser']" /> Pulisci
      </button>
      <button @click="store.resetAll()"
        class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-2 py-1 text-center shadow-lg cursor-pointer ml-auto">
        <font-awesome-icon :icon="['fas', 'refresh']" /> Reset
      </button>
      
    </div>
  </div>
  <h1 class="text-3xl text-center font-bold mb-4">Distinta</h1>
  <div class="mb-4">
    <input
      class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      v-model="store.match.name" id="match-id" placeholder="Match" @input="store.updateMatch(store.match.name)" />
  </div>
  <div class="px-2.5 py-1.5 border border-gray-300 rounded-md mb-2.5 flex flex-col justify-between items-stretch">
    <div v-for="player in store.players" :key="player.number" class="flex justify-start items-center p-1">
      <div class="w-[1.7em]">
        {{ player.number }}.
      </div>
      <input v-model="player.name" @input="store.updatePlayerName(player.number, player.name)"
        :placeholder="'Giocatore ' + player.number"
        class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
    </div>
  </div>
  <div class="flex justify-center items-center">
    <button @click="$router.push('/game')"
      class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon
        :icon="['fas', 'play']" class="w-3.5 h-3.5 text-white me-2" /> Live!</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();
onMounted(() => {
  store.loadStore();
});
</script>
