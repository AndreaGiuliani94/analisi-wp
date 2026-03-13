<template>
    <div class="p-2 pt-1">
        <div class="font-bold">
            Totali: {{ totals.goals }}/{{ totals.shots }}
        </div>
        <div class="grid grid-cols-4 gap-4">
            <div v-for="(category, index) in shotCategories" :key="index">
                <div class="font-semibold">
                    {{ category.label }}: {{ totals[category.key] }}
                </div>
                <div v-for="(zone, zIndex) in supZones" :key="zIndex">
                    {{ zone.label }}:
                    {{ getZoneValue(category.key, zone.values) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { Team } from '../Interfaces/Team';
import { MenUpShot, ShotCategory } from '@/enum/ShotDescription';
import { shotCategories } from '@/const/consts';
import type { CategoryKey } from '../Interfaces/Shot/Category';
import { supZones } from '../Interfaces/Shot/Zone';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore()
const props = defineProps({
    team: {
        type: Object as PropType<Team>,
        required: true,
    }
});

const totals = computed(() => ({
  goals: menUps.value.goals.length,
  shots: menUps.value.shots.length,
  parati: menUps.value.parati.length,
  fuori: menUps.value.fuori.length,
  stoppati: menUps.value.stoppati.length
}))

const menUps = computed(() => gameStore.getAllTeamShotsByType(props.team, ShotCategory.SUP))

function getShotsByCategory(category: CategoryKey, positions: string[]): number {
  return gameStore.getAllTeamShotsByType(props.team, ShotCategory.SUP)[category].filter(shot => positions.includes(shot.position)).length
}

function getZoneValue(category: CategoryKey, values: (MenUpShot | string)[]): number {
  const stringPositions = values.map(v => v.toString())
  return getShotsByCategory(category, stringPositions)
}

</script>