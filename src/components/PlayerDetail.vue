<template>
    <div class="flex flex-col lg:flex-row gap-4 w-full"
        :class="isModal? '': 'bg-slate-50 shadow-inner p-2'">
        
        <div class="flex-1">

            <div v-if="player.isGK" :class="isModal? '': 'mb-4'">
                <div class="flex items-center justify-between mb-2 ">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiri Subiti (Portiere)</h4>
                    
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                            {{ gameStore.getAllSaves(player).saves }}/{{ gameStore.getAllSaves(player).shots }}
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
                                {{ gameStore.getAllPlayerShots(player).goals }}/{{ gameStore.getAllPlayerShots(player).shots }}
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

</template>

<script setup lang="ts">
import type { Player } from './Interfaces/Player';
import type { Exclution } from './Interfaces/Exclution';
import { shotCategories,shotFacedCategories } from '@/const/consts';
import { evenZones, supZones } from './Interfaces/Shot/Zone';
import { EvenShot, MenUpShot, ShotCategory, ShotOutcome } from '@/enum/ShotDescription';
import { computed, ref } from 'vue';
import type { CategoryKey } from './Interfaces/Shot/Category';
import type { Shot } from './Interfaces/Shot';
import { useGameStore } from '@/stores/gameStore';
import type { Team } from './Interfaces/Team';
import ShotMap from './ShotMap.vue';
import ShotAnalysisCard from './cards/ShotAnalysisCard.vue';
import type { ShotKey } from './Interfaces/Shot/ShotKey';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { getExclution } from '@/utils/utils';
import FoulAccordionCard from './cards/FoulAccordionCard.vue';

const gameStore = useGameStore()

const props = defineProps<{
    team: Team;
    player: Player;
    align: 'row' | 'col';
    showGKShots: boolean;
    getExclution: (excl: Exclution) => string;
    isModal: boolean;
}>();

const viewMode = ref('map');

const totalShots = computed(() => ({
  evens: getShotsByType(props.player.shotsEven),
  sup: getShotsByType(props.player.shotsSup)
}))

const exclEarned = computed( () => gameStore.getAllExclutionsEarned(props.team, props.player));

const totalShotsFaced = computed(() => ({
  evens: { 
    shots: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.EVEN && (shot.outcome === ShotOutcome.GOAL || shot.outcome === ShotOutcome.SAVED)),
    goals: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.EVEN && shot.outcome === ShotOutcome.GOAL),
    parati: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.EVEN && shot.outcome === ShotOutcome.SAVED),
    fuori: [],
    stoppati: [],
  },
  sup: {
    shots: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.SUP && (shot.outcome === ShotOutcome.GOAL || shot.outcome === ShotOutcome.SAVED)),
    goals: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.SUP && shot.outcome === ShotOutcome.GOAL),
    parati: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.SUP && shot.outcome === ShotOutcome.SAVED),
    fuori: [],
    stoppati: [],
  },
  penalties: {
    shots: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.PENALTY && (shot.outcome === ShotOutcome.GOAL || shot.outcome === ShotOutcome.SAVED)),
    goals: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.PENALTY && shot.outcome === ShotOutcome.GOAL),
    parati: props.player.shotsFaced.filter(shot => shot.type === ShotCategory.PENALTY && shot.outcome === ShotOutcome.SAVED),
    fuori: [],
    stoppati: [],
  }
}))


function getShotsByType(shots: Shot[]): {
  goals: Shot[]
  parati: Shot[]
  fuori: Shot[]
  stoppati: Shot[]
  shots: Shot[]
} {
  const toUpper = (s: string) => s.toUpperCase()

  return {
    goals: shots.filter(shot => toUpper(shot.outcome) === toUpper(ShotOutcome.GOAL)),
    parati: shots.filter(shot => toUpper(shot.outcome) === toUpper(ShotOutcome.SAVED)),
    fuori: shots.filter(shot => toUpper(shot.outcome) === toUpper(ShotOutcome.MISSED)),
    stoppati: shots.filter(shot => toUpper(shot.outcome) === toUpper(ShotOutcome.BLOCKED)),
    shots
  }
}

function getShotsByPosition(type: ShotKey, category: CategoryKey, positions: string[]): number {
    switch (type) {
        case 'evens':
            return totalShots.value.evens[category].filter(shot => positions.includes(shot.position)).length;
        case 'sup':
            return totalShots.value.sup[category].filter(shot => positions.includes(shot.position)).length;
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
            return totalShotsFaced.value.evens[category].filter(shot => positions.includes(shot.position)).length;
        case 'sup':
            return totalShotsFaced.value.sup[category].filter(shot => positions.includes(shot.position)).length;
        default:
            return 0;
    }
}

// Mappiamo i falli commessi
const mappedCommessi = computed(() => {
    return props.player.exclutions.map(ex => ({
        primaryText: getExclution(ex),
        secondaryText: ex.earnedBy ? `su ${gameStore.getOpponentsPlayerName(props.team, ex.earnedBy)}` : undefined
    }));
});

// Mappiamo i falli guadagnati
const mappedGuadagnati = computed(() => {
    return exclEarned.value.map(ex => ({
        primaryText: getExclution(ex),
        secondaryText: ex.earnedOn ? `da ${ex.earnedOn}` : undefined
    }));
});

</script>