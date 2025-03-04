<template>
    <div class="flex justify-evenly justify-items-center items-center p-2 mb-2" role="group">
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.back(10)" :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      <font-awesome-icon :icon="['fas', 'backward']" class="w-3.5 h-3.5 me-2" />10s</button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.back(1)" :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      <font-awesome-icon :icon="['fas', 'backward']" class="w-3.5 h-3.5 me-2" />1s</button>
    <button @click="store.toggleGlobalTimer()" :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)"
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-4 border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-colors duration-200 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200">
      <font-awesome-icon v-if="store.globalInterval" :icon="['fas', 'pause']" fill="currentColor"
        class="min-w-6 min-h-6 md:min-w-10 md:min-h-10" />
      <font-awesome-icon v-else :icon="['fas', 'play']" class="min-w-6 min-h-6 md:min-w-10 md:min-h-10" />
    </button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.forward(1)" :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      1s<font-awesome-icon :icon="['fas', 'forward']" class="w-3.5 h-3.5 ms-2" /></button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.forward(10)" :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      10s<font-awesome-icon :icon="['fas', 'forward']" class="w-3.5 h-3.5 ms-2" /></button>
  </div>
</template>

<script lang="ts">
import { useElementStore } from '@/stores/gameStore';

export default {
  setup() {
    const store = useElementStore();
    return { store };
  },
};
</script>