<template>
    <td colspan="9" class="px-4 py-2 border-x border-b border-blue-200">
        <div class="text-sm mb-2">
            <p><strong>Dettaglio Tiri:</strong></p>
            <div class="grid grid-cols-2 gap-y-2">
                <div>
                    <strong>Pari: {{ totalShots.evens.goals.length }}/{{ totalShots.evens.shots.length }}</strong> 
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
                    <strong>Superiorità: {{ totalShots.sup.goals.length }}/{{ totalShots.sup.shots.length }}</strong> 
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
            <p><strong>Dettaglio Tiri Subiti:</strong></p>
            <div class="grid grid-cols-2 gap-y-2">
                <div>
                    <strong>Pari: {{ totalShotsFaced.evens.goals.length }}/{{ totalShotsFaced.evens.shots.length }}</strong> 
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
                    <strong>Superiorità: {{ totalShotsFaced.sup.goals.length }}/{{ totalShotsFaced.sup.shots.length }}</strong> 
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

            </div>
        </div>
        <div v-if="props.player.exclutions.length > 0">
            <strong>Falli:</strong> 
            <div v-for="(ex, i) in props.player.exclutions.slice(0, 3)" :key="i">
                {{ getExclution(ex) }}
            </div>
        </div>
    </td>

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

const props = defineProps<{
    player: Player;
    getExclution: (excl: Exclution) => string;
}>();

const totalShots = computed(() => ({
  evens: getShotsByType(props.player.shotsEven),
  sup: getShotsByType(props.player.shotsSup)
}))

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