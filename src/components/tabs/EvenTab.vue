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
                <div v-for="(zone, zIndex) in evenZones" :key="zIndex">
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
import { EvenShot, ShotCategory } from '@/enum/ShotDescription';
import type { CategoryKey } from '../Interfaces/Shot/Category';
import { shotCategories } from '@/const/consts';
import { evenZones } from '../Interfaces/Shot/Zone';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore()
const props = defineProps({
    team: {
        type: Object as PropType<Team>,
        required: true,
    }
});

const totals = computed(() => ({
  goals: evens.value.goals.length,
  shots: evens.value.shots.length,
  parati: evens.value.parati.length,
  fuori: evens.value.fuori.length,
  stoppati: evens.value.stoppati.length
}))

const evens = computed(() => gameStore.getAllTeamShotsByType(props.team, ShotCategory.EVEN))

function getShotsByCategory(category: CategoryKey, positions: string[]): number {
  return gameStore.getAllTeamShotsByType(props.team, ShotCategory.EVEN)[category].filter(shot => positions.includes(shot.position)).length
}

function getZoneValue(category: CategoryKey, values: (EvenShot | string)[]): number {
  const stringPositions = values.map(v => v.toString())
  return getShotsByCategory(category, stringPositions)
}

</script>