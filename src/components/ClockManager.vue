<template>
  <div class="flex justify-evenly justify-items-center items-center p-2 mb-2" role="group">
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.back(10)"
      :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      <BackwardIcon class="size-5 me-2" />10s
    </button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.back(1)"
      :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      <BackwardIcon class="size-5 me-2" />1s
    </button>
    <button @click="store.toggleGlobalTimer()"
      :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)"
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-4 border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-colors duration-200 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200">
      <PauseIcon v-if="store.globalInterval" fill="currentColor" class="min-w-6 min-h-6 md:min-w-10 md:min-h-10" />
      <PlayIcon v-else class="min-w-6 min-h-6 md:min-w-10 md:min-h-10" />
    </button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.forward(1)"
      :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      1s
      <ForwardIcon class="size-5 ms-2" />
    </button>
    <button
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-3 border-amber-400 text-amber-400 active:text-white active:bg-amber-400 transition-colors disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      @click="store.forward(10)"
      :disabled="store.activeCount !== 7 || (store.opponentsTimerActivated && store.activeOppCount !== 7)">
      10s
      <ForwardIcon class="size-5 ms-2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useElementStore } from '@/stores/gameStore';
import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon } from '@heroicons/vue/20/solid';



const store = useElementStore();


</script>