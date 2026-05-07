<template>
  <div class="flex flex-col md:flex-row justify-center gap-6">
    <div v-for="team in teams" :key="team.name" class="flex flex-col items-center gap-2">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ team.name }}</span>
      <div class="flex flex-wrap gap-1.5 justify-center">
        <div 
          v-for="i in Math.max(5, turnNumber)" 
          :key="i" 
          class="size-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all duration-300"
          :class="getDotClass(team.name, i-1)"
        >
          {{ getDotIcon(team.name, i-1) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ShotOutcome } from '@/enum/ShotDescription';

const props = defineProps<{
  turnNumber: number;
  homeTeamName: string;
  awayTeamName: string;
  penaltyEvents: any[];
}>();

const teams = computed(() => [
  { name: props.homeTeamName },
  { name: props.awayTeamName }
]);

const getDotClass = (teamName: string, index: number) => {
  const teamEvents = props.penaltyEvents.filter(e => e.team === teamName);
  const outcome = teamEvents[index]?.shotOutcome;
  if (!outcome) return 'bg-slate-50 border-slate-200 text-slate-300';
  return outcome === ShotOutcome.GOAL 
    ? 'bg-green-500 border-green-600 text-white shadow-sm' 
    : 'bg-red-500 border-red-600 text-white shadow-sm';
};

const getDotIcon = (teamName: string, index: number) => {
  const teamEvents = props.penaltyEvents.filter(e => e.team === teamName);
  const outcome = teamEvents[index]?.shotOutcome;
  if (!outcome) return index + 1;
  return outcome === ShotOutcome.GOAL ? '✓' : '✕';
};
</script>
