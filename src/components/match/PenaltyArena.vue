<template>
  <div class="relative bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-col h-full transition-all duration-300 mb-4">
    
    <!-- SUMMARY: Riepilogo pallini (Verdi/Rossi) -->
    <div class="flex flex-col md:flex-row justify-center gap-4 mb-4 pb-4 border-b border-slate-100">
      <PenaltySummary 
        :turn-number="turnNumber"
        :home-team-name="homeTeamName"
        :away-team-name="awayTeamName"
        :penalty-events="penaltyEvents"
      />
    </div>

    <!-- OVERLAY: Selezione squadra iniziale (solo se 0 rigori) -->
    <div v-if="penaltyEvents.length === 0 && !startingTeamSelected" class="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center p-2.5 pt-6 rounded-xl">
        <div class="text-center mb-4">
          <h3 class="text-2xl font-black text-blue-950 uppercase tracking-tight">Inizio Rigori</h3>
          <p class="text-slate-500 font-medium mt-2">Scegli chi inizia a tirare</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button @click="selectStartingTeam(true)" class="flex-1 px-8 py-5 bg-slate-100 text-blue-950 font-black uppercase tracking-widest rounded-3xl border border-slate-200 shadow-lg hover:bg-slate-200 active:scale-95 transition-all">
              <span class="block text-[10px] opacity-60 mb-1">CASA</span>
              {{ homeTeamName }}
            </button>
            <button @click="selectStartingTeam(false)" class="flex-1 px-8 py-5 bg-blue-950 text-white font-black uppercase tracking-widest rounded-3xl shadow-lg hover:bg-blue-900 active:scale-95 transition-all">
              <span class="block text-[10px] opacity-40 mb-1 text-blue-200">OSPITE</span>
              {{ awayTeamName }}
            </button>
        </div>
    </div>

    <div v-if="isMatchInProgress">
        <!-- HEADER: Info sul Turno -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-blue-950 uppercase tracking-tight">
            Turno {{ turnNumber }}
          </h2>
          <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Al tiro: <span class="text-blue-600">{{ shootingTeamName }}</span>
          </p>
        </div>
    
        <!-- ARENA: I 3 Blocchi -->
        <div class="flex-1 flex flex-col md:flex-row gap-8 items-stretch justify-between">
        
          <!-- BLOCCO 1: Tiratori (Griglia) -->
          <div class="flex-1 flex flex-col items-center lg:border-r border-slate-100 lg:pr-6">
            <h3 class="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Seleziona Tiratore</h3>
            <div class="grid grid-cols-2 gap-2 w-full">
              <button
                v-for="player in shooters"
                :key="player.id"
                @click="selectedShooter = player.id"
                :class="[
                  'py-2 px-3 rounded-xl font-semibold text-sm flex items-center justify-start transition-all duration-200 shadow-sm active:scale-90 text-left',
                  selectedShooter === player.id 
                    ? 'bg-blue-950 text-white ring-4 ring-blue-100' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
              >
                <span class="truncate">{{ player.number }}. {{ player.name }}</span>
              </button>
            </div>
          </div>
    
          <!-- BLOCCO 2: L'Esito (Pulsanti Giganti) -->
          <div class="flex-1 flex flex-col items-center gap-1 min-w-50">
            <h3 class="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest text-center">Esito Rigore</h3>
            <div class="grid grid-cols-2 gap-2 w-full">
              <button
                v-for="outcome in outcomeOptions"
                :key="outcome.value"
                @click="submitPenalty(outcome.value)"
                :disabled="!selectedShooter || !selectedGoalie"
                class="py-2 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-90 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white"
                :class="outcome.color"
              >
                <component :is="outcome.icon" class="size-5" />
                {{ outcome.label }}
              </button>
            </div>
          </div>
    
          <!-- BLOCCO 3: Portieri Avversari -->
          <div class="flex-1 flex flex-col items-center lg:border-l border-slate-100 lg:pl-6">
            <h3 class="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Portiere Difendente</h3>
            <div class="grid grid-cols-2 gap-2 w-full">
              <button
                v-for="goalie in opposingGoalies"
                :key="goalie.id"
                @click="selectedGoalie = goalie.id"
                :class="[
                  'py-2 px-3 rounded-xl font-semibold text-sm flex items-center justify-start transition-all duration-200 shadow-sm active:scale-90 text-left',
                  selectedGoalie === goalie.id 
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
              >
                <span class="truncate">{{ goalie.number }}. {{ goalie.name }}</span>
              </button>
            </div>
          </div>
    
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ShotOutcome } from '@/enum/ShotDescription';
import { ref, watch } from 'vue';
import type { Player } from '@/interfaces/Player';
import PenaltySummary from '@/components/match/PenaltySummary.vue';
import { 
  HandRaisedIcon,
  NoSymbolIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

// 2. Le Props che riceve dal componente Padre (ScoreboardView)
const props = defineProps<{
  turnNumber: number;
  homeTeamName: string;
  awayTeamName: string;
  shootingTeamName: string;
  shooters: Player[];       // Tutti i giocatori di movimento NON espulsi della squadra che tira
  opposingGoalies: Player[]; // Solo i giocatori con isGK = true della squadra che subisce
  penaltyEvents: any[];  
  isMatchInProgress: boolean;
}>();

// 3. Gli Eventi da sparare verso il Padre
const emit = defineEmits(['save-penalty', 'set-starting-team']);

// 4. Stato Reattivo
const selectedShooter = ref<string | null | undefined>(null);
const selectedGoalie = ref<string | null | undefined>(null);
const startingTeamSelected = ref(props.penaltyEvents.length > 0);

const selectStartingTeam = (isHome: boolean) => {
  emit('set-starting-team', isHome);
  startingTeamSelected.value = true;
};

const outcomeOptions = [
  { value: ShotOutcome.GOAL, label: 'GOL', color: 'bg-green-600 hover:bg-green-700', icon: CheckIcon },
  { value: ShotOutcome.SAVED, label: 'PARATO', color: 'bg-amber-500 hover:bg-amber-600', icon: HandRaisedIcon },
  { value: ShotOutcome.MISSED, label: 'FUORI', color: 'bg-red-600 hover:bg-red-700', icon: XMarkIcon },
  { value: ShotOutcome.NULL, label: 'NULLO', color: 'bg-slate-400 hover:bg-slate-500', icon: NoSymbolIcon },
];

// 5. La logica di "Pre-compilazione"
// Ogni volta che cambia il turno, resetto il tiratore ma PRE-SELEZIONO il primo portiere disponibile
watch(
  [() => props.turnNumber, () => props.shootingTeamName],
  () => {
    selectedShooter.value = null; // Il tiratore va sempre scelto a mano
    if (props.opposingGoalies && props.opposingGoalies.length > 0) {
      selectedGoalie.value = props.opposingGoalies[0].id; // Seleziono il portiere 1 (o il 13)
    } else {
      selectedGoalie.value = null;
    }
  },
  { immediate: true } // Lo eseguo anche al primissimo caricamento
);

// 6. Invio dei dati
const submitPenalty = (outcome: ShotOutcome) => {
  if (!selectedShooter.value || !selectedGoalie.value) return;

  // Emetto l'oggetto payload perfetto per il tuo Backend
  emit('save-penalty', {
    turn_number: props.turnNumber,
    shooter_id: selectedShooter.value,
    goalkeeper_id: selectedGoalie.value,
    outcome: outcome,
  });
};
</script>