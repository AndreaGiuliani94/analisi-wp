<template>
    <div v-if="!player.isGK || props.showGKShots" class="text-sm mb-2">
        <p><strong>Dettaglio Tiri</strong></p>
        <div class="grid gap-y-2" :class="[props.align == 'col' ? 'grid-cols-1' : 'grid-cols-2']">
            <div>
                <strong>Pari {{ totalShots.evens.goals.length }}/{{ totalShots.evens.shots.length }}</strong> 
                <div class="grid grid-cols-4 gap-4">
                    <div v-for="(category, index) in shotCategories" :key="index">
                        <div class="font-semibold">
                            {{ category.label }}: {{ getShotsLengthByType('evens', category.key) }}
                        </div>
                        <div v-for="(zone, zIndex) in evenZones" :key="zIndex">
                            {{ zone.label }}:
                            {{ getZoneValue('evens', category.key, zone.values) }}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <strong>Superiorità {{ totalShots.sup.goals.length }}/{{ totalShots.sup.shots.length }}</strong> 
                <div class="grid grid-cols-4 gap-4">
                    <div v-for="(category, index) in shotCategories" :key="index">
                        <div class="font-semibold">
                            {{ category.label }}: {{ getShotsLengthByType('sup', category.key) }}
                        </div>
                        <div v-for="(zone, zIndex) in supZones" :key="zIndex">
                            {{ zone.label }}:
                            {{ getZoneValue('sup', category.key, zone.values) }}
                        </div>
                    </div>
                </div>
            </div>

        </div>
        
    </div>
    <div v-if="player.isGK" class="text-sm mb-2">
        <p><strong>Dettaglio Tiri Subiti</strong></p>
        <div class="grid gap-y-2" :class="[props.align == 'col' ? 'grid-cols-1' : 'grid-cols-2']">
            <div>
                <strong>Pari {{ totalShotsFaced.evens.parati.length }}/{{ totalShotsFaced.evens.shots.length }}</strong> 
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="(category, index) in shotFacedCategories" :key="index">
                        <div class="font-semibold">
                            {{ category.label }}: {{ getShotsFacedLengthByType('evens', category.key) }}
                        </div>
                        <div v-for="(zone, zIndex) in evenZones" :key="zIndex">
                            {{ zone.label }}:
                            {{ getFacedZoneValue('evens', category.key, zone.values) }}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <strong>Superiorità {{ totalShotsFaced.sup.parati.length }}/{{ totalShotsFaced.sup.shots.length }}</strong> 
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="(category, index) in shotFacedCategories" :key="index">
                        <div class="font-semibold">
                            {{ category.label }}: {{ getShotsFacedLengthByType('sup', category.key) }}
                        </div>
                        <div v-for="(zone, zIndex) in supZones" :key="zIndex">
                            {{ zone.label }}:
                            {{ getFacedZoneValue('sup', category.key, zone.values) }}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <strong>Rigori {{ totalShotsFaced.penalties.parati.length }}/{{ totalShotsFaced.penalties.shots.length }}</strong> 
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="(category, index) in shotFacedCategories" :key="index">
                        <div class="font-semibold">
                            {{ category.label }}: {{ getShotsFacedLengthByType('penalties', category.key) }}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <div v-if="props.player.exclutions.length > 0" class="text-sm mb-2">
        <strong>Falli commessi</strong> 
        <div v-for="(ex, i) in props.player.exclutions.slice(0, 3)" :key="i">
            {{ getExclution(ex) + ex.earnedBy ? ' commesso su ' + gameStore.getOpponentsPlayerName(team, ex.earnedBy) : '' }}
        </div>
    </div>
    <div v-if="exclEarned.length > 0" class="text-sm mb-2">
        <strong>Falli guadagnati ({{ exclEarned.length }})</strong> 
        <div v-for="(ex, i) in exclEarned" :key="i">
            {{ getExclution(ex) + ex.earnedBy ? ' guadagnata su ' + ex.earnedOn : '' }}  
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