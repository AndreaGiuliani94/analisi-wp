<template>
  <div class="flex items-center justify-center gap-1 font-bold mt-1">
    <template v-for="(p, i) in partials" :key="i">
      <!-- Separatore per i quarti -->
      <span class="flex items-center"
        :class="textSize">
        <span class="text-gray-300 font-normal mx-0.5 text-xs" v-if="i > 0">|</span>
        <span :class="{
            'text-gray-400': (i + 1 > currentPeriod && theme === 'light'), 
            'text-gray-200': (i + 1 > currentPeriod && theme === 'dark'), 
            'bg-blue-950 text-white px-1 rounded-full scale-105 shadow-sm': (i + 1 == currentPeriod && theme === 'light'),
            'bg-white text-blue-950 px-1 rounded-full scale-105 shadow-sm': (i + 1 == currentPeriod && theme === 'dark'),
            'animate-pulse': (i + 1 == currentPeriod && status === MatchStatus.IN_PROGRESS),
            'text-blue-950': (i + 1 < currentPeriod && theme === 'light'),
            'text-white': (i + 1 < currentPeriod && theme === 'dark')
          }">
          {{ p.home }}-{{ p.away }}
        </span>
      </span>
    </template>

    <!-- Parziale Rigori (se presente e attivo) -->
    <span v-if="penaltyPartial && currentPeriod === penaltyPeriodNumber" class="flex items-center" :class="textSize">
      <span class="text-gray-300 font-normal mx-0.5 text-xs">|</span>
      <span :class="{
          'bg-blue-950 text-white px-1 rounded-full scale-105 shadow-sm': (theme === 'light'),
          'bg-white text-blue-950 px-1 rounded-full scale-105 shadow-sm': (theme === 'dark'),
          'animate-pulse': (status === MatchStatus.IN_PROGRESS),
        }">
        {{ penaltyPartial.home }}-{{ penaltyPartial.away }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { matchPeriodToNumber } from '@/const/consts';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { MatchStatus } from '@/enum/MatchStatus';

withDefaults(defineProps<{
  homeScore: number;
  awayScore: number;
  partials: Array<{ home: number, away: number }>;
  currentPeriod: number;
  hideTotal?: boolean;
  theme?: 'light' | 'dark';
  textSize?: 'text-xs' | 'text-sm' | 'text-lg';
  penaltyPartial?: { home: number, away: number } | null; // Nuovo prop per i rigori
  status?: MatchStatus;
}>(), {
  hideTotal: false,
  theme: 'light',
  textSize: 'text-sm',
  penaltyPartial: null, // Default a null
  status: MatchStatus.IN_PROGRESS
});

const penaltyPeriodNumber = matchPeriodToNumber[MatchPeriod.PENALTIES];
</script>
