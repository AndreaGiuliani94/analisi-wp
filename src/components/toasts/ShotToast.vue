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
            <div class="flex items-center gap-2">
              <span class="text-sm font-black text-slate-600">Punteggio:</span>
              <span class="text-base font-black text-blue-950 tabular-nums">
                {{ event?.homeScore }} - {{ event?.awayScore }}
              </span>
            </div>
            <div v-if="shotTypeLabel" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Situazione:</span>
              <span class="text-sm font-bold text-blue-800">{{ shotTypeLabel }}</span>
            </div>
            <div v-if="shotPositionLabel" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Posizione:</span>
              <span class="text-sm font-bold text-blue-800">{{ shotPositionLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckIcon, HandRaisedIcon, XMarkIcon, NoSymbolIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import { shotCategoryLabels, shotPositionLabels } from '@/const/consts';
import { ShotOutcome } from '@/enum/ShotDescription';

const props = defineProps<{
  modelValue: boolean;
  event: MatchEvent | null;
  isHome: boolean;
  teamName: string;
}>();

const outcomeConfig: Record<string, { label: string, icon: any }> = {
  [ShotOutcome.GOAL]: { label: 'GOL', icon: CheckIcon },
  [ShotOutcome.SAVED]: { label: 'TIRO PARATO', icon: HandRaisedIcon },
  [ShotOutcome.MISSED]: { label: 'TIRO FUORI', icon: XMarkIcon },
  [ShotOutcome.BLOCKED]: { label: 'TIRO BLOCCATO', icon: XMarkIcon },
  [ShotOutcome.NULL]: { label: 'RIGORE NULLO', icon: NoSymbolIcon },
};

const currentConfig = computed(() => {
  return (props.event?.shotOutcome && outcomeConfig[props.event.shotOutcome]) 
    || { label: 'TIRO', icon: QuestionMarkCircleIcon };
});

const shotTypeLabel = computed(() => {
  return props.event?.shotCategory ? shotCategoryLabels[props.event.shotCategory] : '';
});

const shotPositionLabel = computed(() => {
  return props.event?.shotPosition ? shotPositionLabels[props.event.shotPosition] : '';
});
</script>
