<template>
    <div :class="isModal ? 'mb-2' : 'bg-slate-50 shadow-inner'">
        <div class="flex flex-col sm:flex-row justify-between items-center border-b border-slate-200"
            :class="isModal ? 'mb-2 pb-2' : 'mx-2'">
        
            <div class="flex items-center gap-2 text-lg text-blue-950">
                <div class="font-bold">
                    {{ player.number }}.
                </div>
                <div class="font-bold">{{ player.name }}</div>
                <div class="text-sm text-gray-600 flex gap-3 ml-2 border-l border-blue-200 pl-3">
                    <span>Dentro: <strong class="font-mono text-blue-950">{{ formatTime(player.activeTime) }}</strong></span>
                    <span>Fuori: <strong class="font-mono text-blue-950">{{ formatTime(player.benchTime) }}</strong></span>
                </div>
            </div>

            <QuarterFilter
                v-model="selectedQuarter" 
                :is-modal="isModal" 
            />
    
            <!-- <div class="flex bg-gray-100 rounded-lg space-x-1"
                :class="isModal ? 'mb-2' : 'my-2 p-1 bg-slate-200'">
                <button 
                    @click="selectedQuarter = null"
                    class="px-3 py-1 text-xs font-semibold rounded-md transition-colors"
                    :class="selectedQuarter === null ? 'bg-blue-950 text-white shadow' : 'text-gray-600 hover:bg-gray-200'"
                >
                    Tutti
                </button>
                
                <button 
                    v-for="q in 4" :key="q"
                    @click="selectedQuarter = q"
                    class="px-3 py-1 text-xs font-semibold rounded-md transition-colors"
                    :class="selectedQuarter === q ? 'bg-blue-950 text-white shadow' : 'text-gray-600 hover:bg-gray-200'"
                >
                    {{ q }}° Q
                </button>
            </div> -->
    
        </div>
        
        <div class="flex flex-col lg:flex-row gap-4 w-full"
            :class="isModal? '': 'p-2'">
    
            <div class="flex-1">
    
                <div v-if="player.isGK" :class="isModal? '': 'mb-4'">
                    <div class="flex items-center justify-between mb-2 ">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiri Subiti (Portiere)</h4>
                        
                        <div class="flex items-center gap-2">
                            <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                                {{ playerShotsFaced.saves.length }}/{{ playerShotsFaced.shots.length }}
                            </span>
                        </div>
                    </div>
    
                    <div class="grid grid-cols-2 md:grid-cols-2 gap-4">                    
                        <ShotAnalysisCard 
                            title="Pari"
                            shotType="evens"
                            :successCount="totalShotsFaced.evens.parati.length"
                            :totalCount="totalShotsFaced.evens.shots.length"
                            :zones="evenZones"
                            :categories="shotFacedCategories"
                            :getShotsLengthByType="getShotsFacedLengthByType"
                            :getZoneValue="getFacedZoneValue"
                            />
    
                        <ShotAnalysisCard 
                            title="Superiorità"
                            shotType="sup"
                            :successCount="totalShotsFaced.sup.parati.length"
                            :totalCount="totalShotsFaced.sup.shots.length"
                            :zones="supZones"
                            :categories="shotFacedCategories"
                            :getShotsLengthByType="getShotsFacedLengthByType"
                            :getZoneValue="getFacedZoneValue"
                            />
                    </div>
                </div>
    
                <div v-if="!player.isGK || props.showGKShots" :class="isModal? '': ''">
    
                    <div class="flex items-center justify-between mb-2 ">
                        <div class="flex items-center gap-2">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiri Effettuati</h4>
                            
                            <div class="flex items-center gap-2">
                                <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                                    {{ gameStore.getAllPlayerShots(player, selectedQuarter).goals }}/{{ gameStore.getAllPlayerShots(player, selectedQuarter).shots }}
                                </span>
                            </div>
                        </div>
    
                        <div class="flex bg-slate-200 p-0.5 rounded-lg">
                            <button 
                                @click="viewMode = 'map'"
                                class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
                                :class="viewMode === 'map' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-blue-900'"
                            >
                                Mappa
                            </button>
                            <button 
                                @click="viewMode = 'stats'"
                                class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
                                :class="viewMode === 'stats' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-blue-900'"
                            >
                                Stats
                            </button>
                        </div>
                    </div>
                    
                    <Transition name="fade" mode="out-in">
                        <div v-if="viewMode === 'stats'" class="grid grid-cols-2 md:grid-cols-2 gap-4">
    
                            <ShotAnalysisCard 
                                title="Pari"
                                shotType="evens"
                                :successCount="totalShots.evens.goals.length"
                                :totalCount="totalShots.evens.shots.length"
                                :zones="evenZones"
                                :categories="shotCategories"
                                :getShotsLengthByType="getShotsLengthByType"
                                :getZoneValue="getZoneValue"
                                />
    
                            <ShotAnalysisCard 
                                title="Superiorità"
                                shotType="sup"
                                :successCount="totalShots.sup.goals.length"
                                :totalCount="totalShots.sup.shots.length"
                                :zones="supZones"
                                :categories="shotCategories"
                                :getShotsLengthByType="getShotsLengthByType"
                                :getZoneValue="getZoneValue"
                                />
                            
                        </div>
    
                        <div v-else>
                            <ShotMap :player="player" :stats="totalShots" />
                        </div>
                    </Transition>
                </div>
    
            </div>
    
            <div class="border-slate-200"
                    :class="[isModal? 'border rounded-lg p-2 shadow-sm lg:p-4 w-full ': 'lg:px-4 pt-2 lg:border-l border-t lg:border-t-0',
                    (viewMode === 'map' && !isModal) ? 'lg:w-1/2' : 'lg:w-1/3']" >
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Disciplina</h4>
                
                <div v-if="mappedCommessi.length + mappedGuadagnati.length > 0" class="flex flex-col gap-4">
                    <FoulAccordionCard 
                        title="Falli Commessi"
                        :items="mappedCommessi"
                        theme="red"
                        emptyMessage="Nessun fallo commesso"
                    />
                    <FoulAccordionCard 
                        title="Falli Guadagnati"
                        :items="mappedGuadagnati"
                        theme="green"
                    />
                </div>
                <div v-else class="text-xs text-slate-400 italic bg-white p-2 rounded-md border border-dashed border-slate-200">
                    Nessun fallo commesso o guadagnato
                </div>
            </div>
    
        </div>
    </div>

</template>

<script setup lang="ts">
import type { Player } from '../interfaces/Player';
import { shotCategories,shotFacedCategories } from '@/const/consts';
import { evenZones, supZones } from '../interfaces/shot/Zone';
import { EvenShot, MenUpShot, ShotCategory, ShotOutcome } from '@/enum/ShotDescription';
import { computed, ref } from 'vue';
import type { CategoryKey } from '../interfaces/shot/Category';
import { useGameStore } from '@/stores/gameStore';
import type { Team } from '../interfaces/Team';
import ShotMap from './ShotMap.vue';
import ShotAnalysisCard from './cards/ShotAnalysisCard.vue';
import type { ShotKey } from '../interfaces/shot/ShotKey';
import { formatTime, getExclution } from '@/utils/utils';
import FoulAccordionCard from './cards/FoulAccordionCard.vue';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import QuarterFilter from './filters/QuarterFilter.vue';

const gameStore = useGameStore()

const props = defineProps<{
    team: Team;
    player: Player;
    align: 'row' | 'col';
    showGKShots: boolean;
    getExclution: (excl: MatchEvent) => string;
    isModal: boolean;
}>();

const selectedQuarter = ref<number | null>(null);

const viewMode = ref('map');
const exclEarned = computed(() => props.player.id ? gameStore.getFoulsEarnedByPlayer(props.player.id, selectedQuarter.value) : []);

const playerShots = computed(() => {
  if(props.player.id) {
    return gameStore.getPlayerShotsByCategory(props.player.id, selectedQuarter.value) 
  } 
  else {
    return{ even: [], sup: [], penalty: [] }
  }
}
);

const playerShotsFaced = computed(() => {
    if(props.player.id && props.player.isGK) 
        return gameStore.getGoalkeeperShotsFaced(props.player.id, selectedQuarter.value)
    else
        return {saves: [], shots: []}
  }
);

const totalShots = computed(() => ({
  evens: getShotsByType(playerShots.value.even),
  sup: getShotsByType(playerShots.value.sup)
}))

const totalShotsFaced = computed(() => ({
  evens: { 
    shots: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.EVEN && (shot.shotOutcome === ShotOutcome.GOAL || shot.shotOutcome === ShotOutcome.SAVED)),
    goals: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.EVEN && shot.shotOutcome === ShotOutcome.GOAL),
    parati: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.EVEN && shot.shotOutcome === ShotOutcome.SAVED),
    fuori: [],
    stoppati: [],
  },
  sup: {
    shots: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.SUP && (shot.shotOutcome === ShotOutcome.GOAL || shot.shotOutcome === ShotOutcome.SAVED)),
    goals: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.SUP && shot.shotOutcome === ShotOutcome.GOAL),
    parati: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.SUP && shot.shotOutcome === ShotOutcome.SAVED),
    fuori: [],
    stoppati: [],
  },
  penalties: {
    shots: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.PENALTY && (shot.shotOutcome === ShotOutcome.GOAL || shot.shotOutcome === ShotOutcome.SAVED)),
    goals: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.PENALTY && shot.shotOutcome === ShotOutcome.GOAL),
    parati: playerShotsFaced.value.shots.filter(shot => shot.shotCategory === ShotCategory.PENALTY && shot.shotOutcome === ShotOutcome.SAVED),
    fuori: [],
    stoppati: [],
  }
}))


function getShotsByType(shots: MatchEvent[]): {
  goals: MatchEvent[]
  parati: MatchEvent[]
  fuori: MatchEvent[]
  stoppati: MatchEvent[]
  shots: MatchEvent[]
} {
  return {
    goals: shots.filter(shot => shot.shotOutcome === ShotOutcome.GOAL),
    parati: shots.filter(shot => shot.shotOutcome === ShotOutcome.SAVED),
    fuori: shots.filter(shot => shot.shotOutcome === ShotOutcome.MISSED),
    stoppati: shots.filter(shot => shot.shotOutcome === ShotOutcome.BLOCKED),
    shots
  }
}

function getShotsByPosition(type: ShotKey, category: CategoryKey, positions: string[]): number {
    switch (type) {
        case 'evens':
            return totalShots.value.evens[category].filter(shot => shot.shotPosition ? positions.includes(shot.shotPosition) : false ).length;
        case 'sup':
            return totalShots.value.sup[category].filter(shot => shot.shotPosition ? positions.includes(shot.shotPosition) : false ).length;
        default:
            return 0;
    }
}

function getZoneValue(type: ShotKey, category: CategoryKey, values: (EvenShot | MenUpShot | string)[]): number {
  const stringPositions = values.map(v => v.toString())
  return getShotsByPosition(type, category, stringPositions)
}

function getShotsLengthByType(type: ShotKey, category: CategoryKey): number {
    switch (type) {
        case 'evens':
            return totalShots.value.evens[category].length;
        case 'sup':
            return totalShots.value.sup[category].length;
        default:
            return 0;
    }
}

function getShotsFacedLengthByType(type: ShotKey, category: CategoryKey): number {
    switch (type) {
        case 'evens':
            return totalShotsFaced.value.evens[category].length;
        case 'sup':
            return totalShotsFaced.value.sup[category].length;
        case 'penalties':
            return totalShotsFaced.value.penalties[category].length;
        default:
            return 0;
    }
}

function getFacedZoneValue(type: ShotKey, category: CategoryKey, values: (EvenShot | MenUpShot | string)[]): number {
  const stringPositions = values.map(v => v.toString())
  return getShotsFacedByPosition(type, category, stringPositions)
}

function getShotsFacedByPosition(type: ShotKey, category: CategoryKey, positions: string[]): number {
    switch (type) {
        case 'evens':
            return totalShotsFaced.value.evens[category].filter(shot => shot.shotPosition ? positions.includes(shot.shotPosition) : false ).length;
        case 'sup':
            return totalShotsFaced.value.sup[category].filter(shot => shot.shotPosition ? positions.includes(shot.shotPosition) : false ).length;
        default:
            return 0;
    }
}

// Mappiamo i falli commessi
const mappedCommessi = computed(() => {
    if(props.player.id)
        return gameStore.getPlayerFouls(props.player.id, selectedQuarter.value).map(ex => ({
            primaryText: getExclution(ex),
            secondaryText: ex.earnedByPlayerId ? `su ${gameStore.getOpponentsPlayerName(ex.earnedByPlayerId, props.team)}` : undefined
        }));
    else
        return []
});

// Mappiamo i falli guadagnati
const mappedGuadagnati = computed(() => {
    return exclEarned.value.map((ex: MatchEvent) => ({
        primaryText: getExclution(ex),
        secondaryText: ex.playerId ? `su ${gameStore.getOpponentsPlayerName(ex.playerId, props.team)}` : undefined
    }));
});

</script>