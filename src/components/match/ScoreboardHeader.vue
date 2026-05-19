<template>
    <div class="transition-all duration-300 ease-in-out"
        :class="{
            'fixed top-0 left-0 right-0 mx-4 my-2 z-50 rounded mb-0': isShrinked,
            'bg-white shadow rounded-2xl overflow-hidden border border-slate-200 mb-4': !isShrinked
        }">
        <!-- Top Banner (Nomi Squadre e Punteggio Totale) - Solo quando non rimpicciolito -->
        <div v-if="!isShrinked" class="relative text-white bg-linear-to-br from-blue-950 to-blue-800 w-full transition-all duration-300 ease-in-out p-4">
            <!-- Badge in alto a sinistra -->
            <div class="absolute top-4 left-4">
                <MatchStatusBadge :status="match.status" :is-live="match.isLive" :size="'sm'" />
            </div>

            <div class="grid grid-cols-3 items-baseline">
                <h1 class="text-right font-black text-2xl uppercase tracking-tight truncate ps-4">
                    {{ match.homeTeam.name }}
                </h1>
        
                <div class="flex flex-col items-center">
                    <div class="text-4xl font-black text-center tabular-nums tracking-tighter">
                        {{ match.homeTeam.score }} - {{ match.awayTeam.score }}
                    </div>
                    <PartialsItem
                        :theme="'dark'"
                        :home-score="match.homeTeam.score"
                        :away-score="match.awayTeam.score"
                        :partials="partials"
                        :currentPeriod="currentPeriod"
                        :penalty-partial="penaltyPartial"
                        :status="match.status"
                    />
                </div>
        
                <h1 class="text-left font-black text-2xl uppercase tracking-tight truncate pe-4">
                    {{ match.awayTeam.name }}
                </h1>
            </div>

            <div class="absolute top-4 right-4">
              <ActionButton v-if="!match.isLive"
                color="green"
                :icon="SignalIcon"
                @click="$emit('startPublicLive')"
                :label="isMd ? 'Avvia Diretta' : ''"
                :solid="false"
                :size="'sm'"
              />
              <ActionButton v-else
                color="red"
                :icon="SignalIcon"
                @click="$emit('endPublicLive')"
                :label="isMd ? 'Termina Diretta' : ''"
                :solid="false"
                :size="'sm'"
              />
            </div>
        </div>
      
        <!-- Barra di Controllo Sticky (Mode, Timer, Actions) -->
        <div v-if="usePermissions().canEditMatch(userRole)" 
          class="sticky bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border transition-all duration-300 z-50"
          :class="[isShrinked ? 'shadow-xl border-slate-300 top-2' : 'border-transparent top-0']">
      
          <div class="grid grid-cols-3 items-center">
            <!-- Sinistra: Toggle della Modalità -->
            <div class="flex justify-start">
              <ModeToggleItem :hide-labels="isShrinked" class="transition-transform duration-300" />
            </div>
      
            <!-- Centro: Cronometro -->
            <div class="flex flex-col items-center justify-center">
              <div class="font-black tabular-nums text-blue-950 leading-none transition-all duration-300"
                :class="isShrinked ? 'text-5xl' : 'text-6xl'">
                {{ formattedTime }}
              </div>
            </div>
      
            <!-- Destra: Area Azioni Dinamica -->
            <div class="flex justify-end items-center">
              <!-- Stato Rimpicciolito: Mostra badge punteggio e controlli rapidi -->
              <div v-if="isShrinked" class="flex flex-col items-end gap-1.5 duration-300">
                <MatchBadgeScore
                  :home-team="{ name: match.homeTeam.name, score: match.homeTeam.score, category: match.homeTeam.category }"
                  :away-team="{ name: match.awayTeam.name, score: match.awayTeam.score, category: match.awayTeam.category }"
                />
                <div class="flex items-center gap-2">
                  <button v-if="isCorrectionMode" @click="$emit('removeQuarter')" 
                    class="flex items-center justify-center w-5 h-5 rounded-full transition-colors text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm">
                    <MinusIcon class="size-3 stroke-4" /> 
                  </button>
                  <PartialsItem
                    :text-size="'text-sm'"
                    :currentPeriod="currentPeriod"
                    :home-score="match.homeTeam.score"
                    :away-score="match.awayTeam.score"
                    :partials="partials"
                    :penalty-partial="penaltyPartial"
                    :status="match.status"
                  />
                </div>
              </div>
              
              <!-- Stato Normale: Pulsante di Restart -->
              <div v-else class="duration-300">
                <MatchActionButton
                    @restart="$emit('restartMatch')"
                    @cancel="$emit('cancelMatch')"
                    @suspend="$emit('suspendMatch')"
                    @end="$emit('endMatch')"
                />
              </div>
            </div>
          </div>
          
          <!-- Controlli del Timer (ClockManager) -->
          <div v-if="isTimerMaster" class="pt-2 transition-all duration-300 overflow-hidden" >
               <!-- :class="isShrinked ? 'max-h-16 opacity-90 scale-95 origin-top' : 'max-h-32 opacity-100'"> -->
            <ClockManager :shrink="isShrinked" />
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PartialsItem from '@/components/match/PartialsItem.vue';
import MatchBadgeScore from '@/components/badges/MatchBadgeScore.vue';
import ModeToggleItem from '@/components/ModeToggleItem.vue';
import ClockManager from '@/components/ClockManager.vue';
import MatchActionButton from '@/components/buttons/MatchActionButton.vue';
import { MinusIcon, SignalIcon } from '@heroicons/vue/24/outline';
import type { Match } from '@/interfaces/Match';
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { usePermissions } from '@/composables/usePermissions';
import type { MatchRole } from '@/enum/RoleType';

defineProps<{
  match: Match;
  partials: Array<{ home: number, away: number }>;
  formattedTime: string;
  currentPeriod: number;
  isShrinked: boolean;
  userRole?: MatchRole | null;
  isCorrectionMode: boolean;
  isTimerMaster: boolean;
  penaltyPartial?: { home: number, away: number } | null;
}>();

defineEmits(['removeQuarter', 'restartMatch', 'endMatch', 'suspendMatch', 'cancelMatch', 'startPublicLive', 'endPublicLive']);

const windowWidth = ref(window.innerWidth);
const isMd = computed(() => windowWidth.value >= 900);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
