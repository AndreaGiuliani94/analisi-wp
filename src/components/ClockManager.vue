<template>
  <div class="flex justify-evenly justify-items-center items-center p-2 mb-2 transition-all duration-300" role="group">
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="store.back(10)"
      :disabled="store.activeCount !== 7 || (store.match.awayTeam.activatedTimer && store.activeOppCount !== 7)">
      <BackwardIcon :class="['me-2', shrink ? 'size-3' : 'size-4' ]" />10s
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="store.back(1)"
      :disabled="store.activeCount !== 7 || (store.match.awayTeam.activatedTimer && store.activeOppCount !== 7)">
      <BackwardIcon :class="['me-2', shrink ? 'size-3' : 'size-4' ]" />1s
    </button>
    <button @click="store.toggleGlobalTimer()"
      :disabled="store.activeCount !== 7 || (store.match.awayTeam.activatedTimer && store.activeOppCount !== 7)"
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-4 border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-colors duration-200 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200">
      <component :is="store.globalInterval ? PauseIcon : PlayIcon" :class="['stroke-3', shrink ? 'size-5 min-w-5 min-h-5' : 'size-5 min-w-7 min-h-7']" />
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="store.forward(1)"
      :disabled="store.activeCount !== 7 || (store.match.awayTeam.activatedTimer && store.activeOppCount !== 7)">
      1s<ForwardIcon :class="['ms-2', shrink ? 'size-3' : 'size-4' ]" />
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="store.forward(10)"
      :disabled="store.activeCount !== 7 || (store.match.awayTeam.activatedTimer && store.activeOppCount !== 7)">
      10s<ForwardIcon :class="['ms-2', shrink ? 'size-3' : 'size-4' ]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon } from '@heroicons/vue/20/solid';

const store = useGameStore();
const props = defineProps<{
  shrink: boolean
}>()

</script>