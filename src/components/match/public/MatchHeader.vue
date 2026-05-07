<template>
  <div class="transition-all duration-300 ease-in-out"
    :class="{
      'fixed top-0 left-0 right-0 m-2 z-50 rounded mb-0': isShrinked,
      'bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200 mb-8': !isShrinked
    }">

    <!-- Header Completo (non ridotto) -->
    <div v-if="!isShrinked" class="bg-linear-to-br from-blue-950 to-blue-800 p-6 flex flex-col items-center text-white relative">
      <!-- Nomi Squadre e Punteggio -->
      <div class="grid grid-cols-3 w-full items-center relative z-10">
        <h1 class="text-right text-2xl md:text-4xl font-black uppercase tracking-tight truncate">
          {{ homeTeam?.name }}
        </h1>
        <div class="flex flex-col items-center">
          <div class="text-4xl md:text-6xl font-black tabular-nums tracking-tighter">
            {{ homeTeam?.score }} - {{ awayTeam?.score }}
          </div>
        </div>
        <h1 class="text-left text-2xl md:text-4xl font-black uppercase tracking-tight truncate">
          {{ awayTeam?.name }}
        </h1>
      </div>
    </div>

    <!-- Timer & Parziali (solo quando non ridotto) -->
    <div v-if="!isShrinked" class="p-6 flex flex-row items-center justify-around gap-8 bg-slate-50">
      <div class="flex flex-col items-center">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempo di gioco</span>
        <div class="text-4xl md:text-5xl font-black tabular-nums text-blue-950 tracking-tighter">{{ formattedTime }}</div>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parziali</span>
        <PartialsItem
        :home-score="homeTeam?.score || 0"
        :away-score="awayTeam?.score || 0"
        :partials="partials"
        :currentPeriod="currentPeriod"
        :penalty-partial="penaltyPartial"
        :status="status"
        />
        <div v-if="currentPeriod === penaltyPeriodNumber" class="flex flex-col items-center mt-4">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sequenza Rigori</span>
          <PenaltySummary 
            :turn-number="Math.floor(penaltyEvents.length / 2) + 1"
            :home-team-name="homeTeam.name"
            :away-team-name="awayTeam.name"
            :penalty-events="penaltyEvents"
          />
        </div>
      </div>
    </div>

    <!-- Header Ridotto (quando isShrinked è true) -->
    <div v-else class="bg-linear-to-br from-blue-950 to-blue-800 backdrop-blur-md p-2 rounded-lg shadow-lg mb-0.5 transition-all duration-300 grid grid-cols-3 items-center text-white">
      <!-- Nome Squadra Casa -->
      <div class="flex gap-4 items-center justify-center">
          <div class="text-xl font-bold tabular-nums">{{ formattedTime }}</div>
      </div>

      <!-- Punteggio, Timer, Periodo -->
      <div class="flex items-center flex-col justify-center gap-3">
        <MatchBadgeScore
            :theme="'dark'"
            :home-team="{ name: homeTeam?.name, score: homeTeam?.score, category: homeTeam?.category }"
            :away-team="{ name: awayTeam?.name, score: awayTeam?.score, category: awayTeam?.category }"
        />
        <PartialsItem
            :theme="'dark'"
            :text-size="'text-xs'"
            :home-score="homeTeam?.score || 0"
            :away-score="awayTeam?.score || 0"
            :partials="partials"
            :currentPeriod="currentPeriod"
            :penalty-partial="penaltyPartial"
            :status="status"
            />
      </div>

      <MatchStatusBadge class="justify-self-end" :status="status" :is-live="isLive" :size="'sm'" />
    </div>
  </div>
</template>

<script setup lang="ts">

import MatchBadgeScore from '@/components/badges/MatchBadgeScore.vue';
import PartialsItem from '@/components/match/PartialsItem.vue';
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue';
import PenaltySummary from '@/components/match/PenaltySummary.vue';
import { MatchPeriod } from '@/enum/MatchPeriod';
import { matchPeriodToNumber } from '@/const/consts';
import type { MatchStatus } from '@/enum/MatchStatus';


interface TeamData {
  name: string;
  score: number;
  category?: string;
}

defineProps<{
  homeTeam: TeamData;
  awayTeam: TeamData;
  formattedTime: string;
  partials: Array<{ home: number, away: number }>;
  currentPeriod: number;
  isShrinked: boolean;
  status: MatchStatus;
  isLive: boolean;
  penaltyPartial?: { home: number, away: number } | null;
  penaltyEvents: any[];
}>();

const penaltyPeriodNumber = matchPeriodToNumber[MatchPeriod.PENALTIES];
</script>
