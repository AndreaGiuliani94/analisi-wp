<template>
    <td colspan="9" class="px-4 py-2 border-x border-b border-blue-200">
        <div class="text-sm space-y-2">
            <p><strong>Dettaglio Tiri:</strong></p>
            <div class="grid grid-cols-2 gap-y-2">
                <div>
                    <strong>Pari: {{ totals.evens.goals.length }}/{{ totals.evens.shots.length }}</strong> 
                    <div class="grid grid-cols-4 gap-4">
                        <div v-for="(category, index) in categories" :key="index">
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
                    <strong>Superiorità: {{ totals.sup.goals.length }}/{{ totals.sup.shots.length }}</strong> 
                    <div class="grid grid-cols-4 gap-4">
                        <div v-for="(category, index) in categories" :key="index">
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

            <div v-if="props.player.exclutions.length > 0">
                <strong>Falli:</strong> 
                <div v-for="(ex, i) in props.player.exclutions.slice(0, 3)" :key="i">
                    {{ getExclution(ex) }}
                </div>
            </div>
            
        </div>
    </td>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import type { Player } from './Interfaces/Player';
import type { Exclution } from './Interfaces/Exclution';
import { categories } from '@/const/consts';
import { evenZones, supZones } from './Interfaces/Shot/Zone';
import { EvenShot, MenUpShot, ShotOutcome } from '@/enum/ShotDescription';
import { computed } from 'vue';
import type { CategoryKey } from './Interfaces/Shot/Category';
import type { Shot } from './Interfaces/Shot';

const store = useGameStore();

const props = defineProps<{
    player: Player;
    getExclution: (excl: Exclution) => string;
}>();

const totals = computed(() => ({
  evens: getShotsByType(props.player.shotsEven),
  sup: getShotsByType(props.player.shotsSup)
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
            return totals.value.evens[category].filter(shot => positions.includes(shot.position)).length;
        case 'sup':
            return totals.value.sup[category].filter(shot => positions.includes(shot.position)).length;
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
            return totals.value.evens[category].length;
        case 'sup':
            return totals.value.sup[category].length;
        default:
            return 0;
    }
}


</script>