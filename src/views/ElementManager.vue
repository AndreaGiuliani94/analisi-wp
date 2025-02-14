<template>
  <div class="absolute">
    <button @click="$router.push('/')"
      class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-3 py-2 text-center shadow-lg cursor-pointer">
      <font-awesome-icon :icon="['fas', 'arrow-left']" /> Distinta
    </button>
  </div>
  <div class="text-xl font-bold text-center mt-2">{{ store.match.quarter }} T</div>
  <div class="text-4xl font-bold text-center m-2">{{ store.formatTime(store.countdown) }}</div>
  <div class="flex justify-evenly justify-items-center items-center p-2 mb-2" role="group">
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.back(10)" :disabled="store.activeCount !== 7">
      <font-awesome-icon :icon="['fas', 'backward']" class="w-3.5 h-3.5 me-2"/>10s</button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.back(1)" :disabled="store.activeCount !== 7">
      <font-awesome-icon :icon="['fas', 'backward']" class="w-3.5 h-3.5 me-2"/>1s</button>
    <button @click="store.toggleGlobalTimer()" :disabled="store.activeCount !== 7"
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-4 border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-colors duration-200 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200">
      <font-awesome-icon v-if="store.globalInterval" :icon="['fas', 'pause']" fill="currentColor"  class="min-w-6 min-h-6 md:min-w-10 md:min-h-10" />
      <font-awesome-icon v-else :icon="['fas', 'play']" class="min-w-6 min-h-6 md:min-w-10 md:min-h-10"/>
    </button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.forward(1)" :disabled="store.activeCount !== 7">
      1s<font-awesome-icon :icon="['fas', 'forward']" class="w-3.5 h-3.5 ms-2"/></button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.forward(10)" :disabled="store.activeCount !== 7">
      10s<font-awesome-icon :icon="['fas', 'forward']" class="w-3.5 h-3.5 ms-2"/></button>
  </div>

  <div class=" flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-5">
    <div v-for="player in store.actualPlayers" :key="player.number"
      class="border border-gray-300 rounded-lg m-2 flex justify-between items-center overflow-x-auto ">
      <PlayerItem :player="player" />
    </div>
  </div>

  <div class="flex justify-center items-center gap-10 p-2 m-5" role="group">
    <button @click="$router.push('/report')"
      class="p-2.5 text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300">
      <font-awesome-icon :icon="['fas', 'table-list']" /> Report</button>
    <button @click="$router.push('/events')" :disabled="store.events.length == 0"
      class="p-2.5 text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300">
      <font-awesome-icon :icon="['fas', 'calendar-days']" /> Eventi</button>
  </div>
</template>

<script lang="ts">
import { useElementStore } from '@/stores/store';
import PlayerItem from '@/components/PlayerItem.vue';

export default {
  components: { PlayerItem },
  setup() {
    const store = useElementStore();
    return { store };
  },
};
</script>