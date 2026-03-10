<script setup lang="ts">

import { storeToRefs } from 'pinia'
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore()
const { isCorrectionMode } = storeToRefs(gameStore)
const props = defineProps<{
  hideLabels: boolean
}>()

</script>

<template>
  <div class="flex items-center py-1 bg-gray-100 rounded-full border border-gray-200 shadow-inner h-min"
    :class="[hideLabels? 'gap-1' : 'px-3 gap-3']">
    <span :class="['text-xs font-bold rounded-full transition-all duration-300', 
                  !isCorrectionMode ? 'bg-blue-950 text-white shadow-sm' : 'text-gray-500',
                  hideLabels ? 'max-w-0 opacity-0' : 'max-w-25 opacity-100 p-1 mr-1']">
      INSERIMENTO
    </span>

    <button 
      @click="gameStore.toggleCorrectionMode()"
      class="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-gray-300"
      :class="[hideLabels ? 'h-5 w-10' : 'h-7 w-14', isCorrectionMode ? 'bg-red-800' : 'bg-blue-900']"
    >
      <span
        class="pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        :class="isCorrectionMode ? 'translate-x-7' : 'translate-x-0'"
      >
        <span class="absolute inset-0 flex items-center justify-center transition-opacity"
              :class="isCorrectionMode ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'">
          <PlusCircleIcon class="h-4 w-4 text-blue-900" />
        </span>
        <span class="absolute inset-0 flex items-center justify-center transition-opacity"
              :class="isCorrectionMode ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'">
          <PencilSquareIcon class="h-4 w-4 text-red-800" />
        </span>
      </span>
    </button>

    <span :class="['text-xs font-bold rounded-full transition-all duration-300', 
                  isCorrectionMode ? 'bg-red-800 text-white shadow-sm' : 'text-gray-500',
                  hideLabels ? 'max-w-0 opacity-0' : 'max-w-25 opacity-100 p-1 ml-1']">
      CORREZIONE
    </span>
  </div>
</template>