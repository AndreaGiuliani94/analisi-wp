<template>
  <div class="text-xl font-bold text-center mt-2">{{ store.match.quarter }} T</div>
  <div class="text-4xl font-bold text-center">{{ store.formatTime(store.countdown) }}</div>
  <div class="flex justify-evenly justify-items-center items-center p-2" role="group">
    <button class="text-xs md:text-sm bg-amber-400 rounded-full min-h-8 min-w-8 md:min-h-12 md:min-w-12 text-white active:outline-none active:ring-3 active:ring-amber-200" @click="" :disabled="store.activeCount !== 7">
      <font-awesome-icon :icon="['fas', 'backward']" /> 10s</button>
    <button class="text-xs md:text-sm bg-amber-400 rounded-full min-h-8 min-w-8 md:min-h-12 md:min-w-12 text-white active:outline-none active:ring-3 active:ring-amber-200" @click="" :disabled="store.activeCount !== 7">
      <font-awesome-icon :icon="['fas', 'backward']" /> 1s</button>
    <button @click="store.toggleGlobalTimer()" :disabled="store.activeCount !== 7" class="text-2xl md:text-5xl text-center align-middle text-white rounded-full px-2 min-h-10 min-w-10 md:min-h-15 md:min-w-15 bg-amber-500 active:outline-none active:ring-3 active:ring-amber-300">
      <span v-if="store.globalInterval"><font-awesome-icon :icon="['far', 'circle-pause']"/></span>
      <span v-else><font-awesome-icon :icon="['far', 'circle-play']" /></span>
    </button>
    <button class="text-xs md:text-sm bg-amber-400 rounded-full min-h-8 min-w-8 md:min-h-12 md:min-w-12 text-white active:outline-none active:ring-3 active:ring-amber-200" @click="" :disabled="store.activeCount !== 7">
      1s <font-awesome-icon :icon="['fas', 'forward']" /></button>
    <button class="text-xs md:text-sm bg-amber-400 rounded-full min-h-8 min-w-8 md:min-h-12 md:min-w-12 text-white active:outline-none active:ring-3 active:ring-amber-200" @click="" :disabled="store.activeCount !== 7">
      10s <font-awesome-icon :icon="['fas', 'forward']" /></button>
  </div>

  <div class="mt-2 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-5">
    <div v-for="player in store.players" :key="player.number" class="border border-gray-300 rounded-lg m-2 flex justify-between items-center overflow-x-auto">
      <div class="p-2 w-5/11 flex justify-start border border-gray-300 rounded-s-lg text-sm md:text-regular font-medium" :class="[player.active ? 'bg-red-800 text-white' : 'bg-gray-200', store.activeCount < 7 || player.active ? 'active:shadow-lg active:transalte-y-[-2px]': '']"
        @click="store.toggleElement(player.number)">
        <span class="truncate">{{ player.number }}. {{ player.name }}</span>
      </div>
      <div class="text-sm md:text-regular font-medium ml-1">{{ player.active ? '🕒' : '⏳' }}{{ store.formatTime(player.actualTime) }}</div>
      <div class="inline-flex rounded-md ml-auto" role="group">
        <button @click="store.addShoot(player.number)" :disabled="!player.active"  class="px-3 py-2 text-sm font-medium text-white bg-blue-400 border border-gray-200 active:bg-blue-700 ">S</button>
        <button @click="store.addGoal(player.number)" :disabled="!player.active" class="px-3 py-2 text-sm font-medium text-white bg-blue-400 border-t border-b border-gray-200  active:bg-blue-700">G</button>
        <button @click="store.addExclution(player.number)" :disabled="!player.active"  class="px-3 py-2 text-sm font-medium text-white bg-blue-400 border border-gray-200 rounded-e-lg active:bg-blue-700">E</button>
      </div>
    </div>
  </div>
  

  <div class="flex justify-center items-center gap-10 p-2" role="group">
    <button @click="$router.push('/report')" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300">Report</button>
    <button @click="$router.push('/events')" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300">Eventi</button>
  </div>
</template>

<script setup lang="ts">
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>