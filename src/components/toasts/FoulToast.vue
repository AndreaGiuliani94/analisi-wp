<template>
  <Transition
    enter-active-class="transform transition ease-out duration-500"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed top-24 right-4 z-100 w-72 pointer-events-none">
      <div :class="[
        'bg-white rounded-2xl shadow-2xl border-l-8 overflow-hidden flex items-center p-4 gap-4 transition-all',
        isHome ? 'border-red-800' : 'border-blue-800'
      ]">
        <!-- Icona dinamica -->
        <div :class="[
          'size-12 rounded-full flex items-center justify-center shrink-0 animate-bounce',
          isHome ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-800'
        ]">
          <component :is="currentConfig.icon" class="size-7" />
        </div>

        <!-- Dati Giocatore -->
        <div class="flex flex-col min-w-0">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ currentConfig.label }} {{ teamName }}!
          </span>
          <h4 class="text-blue-950 font-bold truncate text-lg leading-tight">
            {{ event?.player?.number }}. {{ event?.player?.name }}
          </h4>
          <div class="flex flex-col gap-0.5 mt-0.5">
            <div v-if="foulPositionLabel" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Posizione:</span>
              <span class="text-sm font-bold text-red-800">{{ foulPositionLabel }}</span>
            </div>
            <div v-if="earnedByPlayerName" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Guadagnato da:</span>
              <span class="text-sm font-bold text-blue-800">{{ earnedByPlayerName }}</span>
            </div>
            <div v-if="edcsLabel" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Dettaglio:</span>
              <span class="text-sm font-bold text-red-900">{{ edcsLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon, 
  ShieldExclamationIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import { foulCategoryLabels, foulPositionLabels, edcsCategoryLabels, numberToMatchPeriod } from '@/const/consts';
import { FoulType } from '@/enum/ExclutionDescription';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps<{
  modelValue: boolean;
  event: MatchEvent | null;
  isHome: boolean;
  teamName: string;
}>();

const gameStore = useGameStore();
const foulConfig: Record<string, { label: string, icon: any }> = {
  [FoulType.EXCL]: { label: 'ESPULSIONE', icon: ExclamationCircleIcon },
  [FoulType.EDCS]: { label: 'ESP. DEFINITIVA', icon: ExclamationTriangleIcon },
  [FoulType.PEN]: { label: 'RIGORE CONTRO', icon: ShieldExclamationIcon },
};

const currentConfig = computed(() => {
  return (props.event?.foulType && foulConfig[props.event.foulType]) 
    || { label: 'SANZIONE', icon: QuestionMarkCircleIcon };
});

const foulPositionLabel = computed(() => {
  return props.event?.foulPosition ? foulPositionLabels[props.event.foulPosition] : '';
});

const edcsLabel = computed(() => {
  return props.event?.edcsType ? edcsCategoryLabels[props.event.edcsType] : '';
});

const earnedByPlayerName = computed(() => {
  if (!props.event?.earnedByPlayerId) return '';

  // Determina la squadra che ha commesso il fallo per trovare il giocatore avversario
  const committingTeam = props.event.team === gameStore.match?.homeTeam.name 
    ? gameStore.match.homeTeam 
    : gameStore.match.awayTeam;

  return gameStore.getOpponentsPlayerName(props.event.earnedByPlayerId, committingTeam);
});

</script>
