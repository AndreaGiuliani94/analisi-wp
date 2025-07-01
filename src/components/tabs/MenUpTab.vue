<template>
    <div class="p-2 pt-1">
        <div class="font-bold">
            Totali: {{ totals.goals }}/{{ totals.shots }}
        </div>
        <div class="grid grid-cols-4 gap-4">
            <div v-for="(category, index) in categories" :key="index">
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
import type { Shot } from '../Interfaces/Shot';
import { MenUpShot, ShotOutcome } from '@/enum/ShotDescription';
import { categories } from '@/const/consts';
import type { CategoryKey } from '../Interfaces/Shot/Category';
import { supZones } from '../Interfaces/Shot/Zone';

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

const menUps = computed(() => getAllMenUps())

const getAllMenUps = () => {
    var totalShots: Shot[] = [];
    props.team.players.forEach(pl => totalShots.push(...pl.shotsSup));
    var totalGoals = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.GOAL.toUpperCase() );
    var totalParati = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.SAVED.toUpperCase() );
    var totalFuori = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.MISSED.toUpperCase() );
    var totalStoppati = totalShots.filter(shot => shot.outcome.toUpperCase() === ShotOutcome.BLOCKED.toUpperCase() );
    return {
        goals: totalGoals,
        shots: totalShots,
        parati: totalParati,
        fuori: totalFuori,
        stoppati: totalStoppati
      }
}

function getShotsByCategory(category: CategoryKey, positions: string[]): number {
  return getAllMenUps()[category].filter(shot => positions.includes(shot.position)).length
}

function getZoneValue(category: CategoryKey, values: (MenUpShot | string)[]): number {
  const stringPositions = values.map(v => v.toString())
  return getShotsByCategory(category, stringPositions)
}

</script>