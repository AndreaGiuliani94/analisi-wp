<template>
  <!-- Layout Standard: Cronometro e controlli avanzati -->
  <div v-if="settingsStore.enableTimekeeping" class="flex justify-evenly justify-items-center items-center p-2 mb-2 transition-all duration-300" role="group">
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="timerStore.masterBack(settingsStore.periodDuration)"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      ">
      <ArrowUturnLeftIcon :class="['stroke-3', shrink ? 'size-3' : 'size-4' ]" />
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="timerStore.masterBack(10)"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      ">
      <BackwardIcon :class="['me-2', shrink ? 'size-3' : 'size-4' ]" />10s
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="timerStore.masterBack(1)"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      ">
      <BackwardIcon :class="['me-2', shrink ? 'size-3' : 'size-4' ]" />1s
    </button>
    <button @click="handleToggleTimer"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      "
      class="font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-4 border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-200 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200">
      <component :is="timerStore.isTimerRunning ? PauseIcon : PlayIcon" :class="['stroke-3', shrink ? 'size-5 min-w-5 min-h-5' : 'size-5 min-w-7 min-h-7']" />
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="timerStore.masterForward(1)"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      ">
      1s<ForwardIcon :class="['ms-2', shrink ? 'size-3' : 'size-4' ]" />
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="timerStore.masterForward(10)"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      ">
      10s<ForwardIcon :class="['ms-2', shrink ? 'size-3' : 'size-4' ]" />
    </button>
    <button
      class="border-amber-500 text-amber-500 active:text-white active:bg-amber-500 transition-all duration-300 disabled:text-gray-400 disabled:border-gray-400 disabled:bg-gray-200"
      :class="['font-medium rounded-full py-1 px-1.5 text-sm text-center inline-flex items-center', shrink ? 'border-2' : 'border-3' ]"
      @click="timerStore.masterForward(settingsStore.periodDuration)"
      :disabled="
        (settingsStore.enableHomePlayersTime && gameStore.activeCount > 7) || 
        (settingsStore.enableAwayPlayersTime && gameStore.activeOppCount > 7)
      ">
      <ArrowUturnRightIcon :class="['stroke-3', shrink ? 'size-3' : 'size-4' ]" />
    </button>
  </div>

  <!-- Layout Semplificato: Solo Inizio/Fine periodo -->
  <div v-else class="flex justify-center items-center p-4">
    <ActionButton
      @click="handleTogglePeriod"
      :color="'amber'"
      :tracking="'widest'"
      :icon="timerStore.isTimerRunning ? PauseIcon : PlayIcon"
      :icon-size="'size-6'"
      :label="timerStore.isTimerRunning ? 'TERMINA ' + timerStore.currentPeriod + '° TEMPO' : 'INIZIA ' + timerStore.currentPeriod + '° TEMPO'"
      :font="'black'"
      :uppercase="true"
      :size="'lg'"
      :text-size="'base'"
      :disabled="matchEnded"
    />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimerStore } from '@/stores/timerStore';
import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon } from '@heroicons/vue/20/solid';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/vue/24/outline';
import { useToast } from 'vue-toastification';
import ActionButton from './buttons/ActionButton.vue';
import { computed } from 'vue';

const toast = useToast();
const settingsStore = useSettingsStore();
const timerStore = useTimerStore();
const gameStore = useGameStore();
const props = defineProps<{
  shrink: boolean
}>()

const matchEnded = computed(() => {
  return (timerStore.currentPeriod === settingsStore.totalPeriods && !timerStore.isTimerRunning);
});

/**
 * Esegue le validazioni sui giocatori attivi prima di iniziare un periodo.
 * @returns boolean true se la validazione è superata.
 */
const validateActivePlayers = (): boolean => {
  const homeCount = gameStore.activeCount;
  const awayCount = gameStore.activeOppCount;

  if ((settingsStore.enableHomePlayersTime && homeCount > 7) || 
      (settingsStore.enableAwayPlayersTime && awayCount > 7)) {
    toast.error("Impossibile iniziare: troppi giocatori in acqua!");
    return false;
  }

  if (settingsStore.enableHomePlayersTime && homeCount < 7) {
    toast.warning(`Attenzione: ${gameStore.match.homeTeam.name} ha solo ${homeCount} giocatori attivi.`);
  }
  if (settingsStore.enableAwayPlayersTime && awayCount < 7) {
    toast.warning(`Attenzione: ${gameStore.match.awayTeam.name} ha solo ${awayCount} giocatori attivi.`);
  }
  
  return true;
};

/**
 * Gestione Play/Pause standard (con cronometro)
 */
const handleToggleTimer = async () => {
  if (!timerStore.isTimerRunning) {
    if (!validateActivePlayers()) return;
    await gameStore.startMatch();
  }
  await timerStore.toggleGlobalTimer();
};

/**
 * Gestione Inizio/Fine periodo (senza cronometro)
 */
const handleTogglePeriod = async () => {
  if (timerStore.isTimerRunning) {
    // Il timer sta correndo: fermiamo il periodo e passiamo al successivo
    if (window.confirm("Vuoi terminare ufficialmente questo periodo di gioco?")) {
      await timerStore.handleEndOfQuarter();
    }
  } else {
    // Il periodo è fermo: eseguiamo i controlli e iniziamo
    if (!validateActivePlayers()) return;
    await gameStore.startMatch();
    await timerStore.masterPlay();
  }
};
</script>