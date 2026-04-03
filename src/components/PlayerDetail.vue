<template>
    <div class="bg-slate-50 shadow-inner flex flex-col lg:flex-row gap-2 lg:gap-4 p-2 w-full">
        
        <div class="flex-1">

            <div v-if="player.isGK" class="mb-4">
                <div class="flex items-center justify-between mb-2 ">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiri Subiti (Portiere)</h4>
                    
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                            {{ gameStore.getAllSaves(player).saves }}/{{ gameStore.getAllSaves(player).shots }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-2 gap-4">                    
                    <div class="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <span class="font-bold text-blue-950 uppercase">Pari</span>
                            <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
                                {{ totalShotsFaced.evens.parati.length }}/{{ totalShotsFaced.evens.shots.length }}
                            </span>
                        </div>
                        <div v-for="(category, index) in shotFacedCategories" :key="index" class="mb-3 last:mb-0">
                            <div class="text-xs font-bold uppercase text-slate-500 mb-1 border-b border-slate-50">
                                {{ category.label }} <span class="font-mono ml-1">({{ getShotsFacedLengthByType('evens', category.key) }})</span>
                            </div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <div v-for="(zone, zIndex) in evenZones" :key="zIndex" 
                                    class="flex justify-between"
                                    :class="getFacedZoneValue('evens', category.key, zone.values) == 0 ? 'text-slate-300' : 'font-semibold text-blue-900'">
                                    <span>{{ zone.label }}</span>
                                    <span class="font-mono">{{ getFacedZoneValue('evens', category.key, zone.values) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <span class="font-bold text-blue-950 uppercase">Superiorità</span>
                            <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
                                {{ totalShotsFaced.sup.parati.length }}/{{ totalShotsFaced.sup.shots.length }}
                            </span>
                        </div>
                        <div v-for="(category, index) in shotFacedCategories" :key="index" class="mb-3 last:mb-0">
                            <div class="text-xs font-bold uppercase text-slate-500 mb-1 border-b border-slate-50">
                                {{ category.label }} <span class="font-mono ml-1">({{ getShotsFacedLengthByType('sup', category.key) }})</span>
                            </div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <div v-for="(zone, zIndex) in supZones" :key="zIndex" 
                                    class="flex justify-between"
                                    :class="getFacedZoneValue('sup', category.key, zone.values) == 0 ? 'text-slate-300' : 'font-semibold text-blue-900'">
                                    <span>{{ zone.label }}</span>
                                    <span class="font-mono">{{ getFacedZoneValue('sup', category.key, zone.values) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!player.isGK || props.showGKShots">

                <div class="flex items-center justify-between mb-2 ">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiri Effettuati</h4>
                    
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                            {{ gameStore.getAllPlayerShots(player).goals }}/{{ gameStore.getAllPlayerShots(player).shots }}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <div class="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <span class="font-bold text-blue-950 uppercase">Pari</span>
                            <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
                                {{ totalShots.evens.goals.length }}/{{ totalShots.evens.shots.length }}
                            </span>
                        </div>
                        <div v-for="(category, index) in shotCategories" :key="index" class="mb-3 last:mb-0">
                            <div class="text-xs font-bold uppercase text-slate-500 mb-1 border-b border-slate-50">
                                {{ category.label }} <span class="font-mono ml-1">({{ getShotsLengthByType('evens', category.key) }})</span>
                            </div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <div v-for="(zone, zIndex) in evenZones" :key="zIndex" 
                                    class="flex justify-between"
                                    :class="getZoneValue('evens', category.key, zone.values) == 0 ? 'text-slate-300' : 'font-semibold text-blue-900'">
                                    <span>{{ zone.label }}</span>
                                    <span class="font-mono">{{ getZoneValue('evens', category.key, zone.values) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div class="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <span class="font-bold text-blue-950 uppercase">Superiorità</span>
                            <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
                                {{ totalShots.sup.goals.length }}/{{ totalShots.sup.shots.length }}
                            </span>
                        </div>
                        <div v-for="(category, index) in shotCategories" :key="index" class="mb-3 last:mb-0">
                            <div class="text-xs font-bold uppercase text-slate-500 mb-1 border-b border-slate-50">
                                {{ category.label }} <span class="font-mono ml-1">({{ getShotsLengthByType('sup', category.key) }})</span>
                            </div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                <div v-for="(zone, zIndex) in supZones" :key="zIndex" 
                                    class="flex justify-between"
                                    :class="getZoneValue('sup', category.key, zone.values) == 0 ? 'text-slate-300' : 'font-semibold text-blue-900'">
                                    <span>{{ zone.label }}</span>
                                    <span class="font-mono">{{ getZoneValue('sup', category.key, zone.values) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="w-full lg:w-1/3 lg:border-l border-slate-200 lg:pl-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Disciplina</h4>
            
            <div class="flex flex-col gap-4">
                <div v-if="props.player.exclutions.length > 0" class="bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                    <div class="text-xs font-bold text-red-800 flex items-center mb-2 border-b border-red-50 pb-1">
                        Falli Commessi ({{ props.player.exclutions.length }})
                    </div>
                    <ul class="text-[12px] text-slate-600 space-y-1.5">
                        <li v-for="(ex, i) in props.player.exclutions" :key="i" class="flex flex-col">
                            <span class="font-semibold">{{ getExclution(ex) }}</span>
                            <span v-if="ex.earnedBy" class="text-slate-400 text-[10px] uppercase">su {{ gameStore.getOpponentsPlayerName(team, ex.earnedBy) }}</span>
                        </li>
                    </ul>
                </div>
                <div v-else class="text-xs text-slate-400 italic bg-white p-2 rounded-md border border-dashed border-slate-200">
                    Nessun fallo commesso
                </div>

                <div v-if="exclEarned.length > 0" class="bg-white rounded-lg p-3 border border-green-100 shadow-sm">
                    <div class="text-xs font-bold text-green-600 flex items-center mb-2 border-b border-green-50 pb-1">
                        Falli Guadagnati ({{ exclEarned.length }})
                    </div>
                    <ul class="text-[12px] text-slate-600 space-y-1.5">
                        <li v-for="(ex, i) in exclEarned" :key="i" class="flex flex-col">
                            <span class="font-semibold">{{ getExclution(ex) }}</span>
                            <span v-if="ex.earnedOn" class="text-slate-400 text-[10px] uppercase">su {{ ex.earnedOn }}</span>
                        </li>
                    </ul>
                </div>
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
import { computed } from 'vue';
import type { CategoryKey } from './Interfaces/Shot/Category';
import type { Shot } from './Interfaces/Shot';
import { useGameStore } from '@/stores/gameStore';
import type { Team } from './Interfaces/Team';

const gameStore = useGameStore()

const props = defineProps<{
    team: Team;
    player: Player;
    align: 'row' | 'col';
    showGKShots: boolean;
    getExclution: (excl: Exclution) => string;
}>();

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

type ShotKey = 'evens' | 'sup' | 'penalties';

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

</script>