<template>
  <div 
    class="text-xs px-2 py-1 rounded border whitespace-nowrap"
    :class="badgeColorClasses"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import { FoulType } from '@/enum/ExclutionDescription'; // Assicurati che il percorso sia corretto

const props = defineProps<{
  event: MatchEvent;
  text: string;
}>();

// Calcoliamo classi Tailwind diverse in base al tipo di fallo
const badgeColorClasses = computed(() => {
  switch (props.event.foulType) {
    case FoulType.EDCS:
      // Fallo da espulsione definitiva: Rosso scuro, testo bianco
      return 'bg-red-600 text-white border-red-700 font-bold shadow-sm';
      
    // case FoulType.PEN:
    //   // Rigore: Arancione
    //   return 'bg-orange-100 text-orange-800 border-orange-200';
      
    default:
      // Fallo Grave normale: Rosso chiaro
      return 'bg-red-50 text-red-700 border-red-200';
  }
});
</script>