<template>
  <h1 class ="text-3xl text-center font-bold p-2">Distinta</h1>
  <div class="mt-1 mb-3 ">
    <input class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none" 
      v-model="store.match.name" id="match-id" placeholder="Match"
      @input="store.updateMatch(store.match.name)" />
  </div>
  <div class="p-2.5 border border-gray-300 rounded-md mb-2.5 flex flex-col justify-between items-stretch">
    <div v-for="player in store.players" :key="player.number" class="flex justify-start items-center p-1">
      <div class="w-[1.7em]">
        {{ player.number }}.
      </div>
      <input v-model="player.name" @input="store.updateElementName(player.number, player.name)" class="w-full px-3 py-1.5 text-sm md:text-md font-small md:font-small leading-4 md:leading-6 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
    </div>
  </div>
  <div class="flex justify-center items-center">
    <button @click="$router.push('/game')" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['fas', 'play']" /> Live!</button>
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
