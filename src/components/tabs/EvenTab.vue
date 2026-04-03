<template>
    <div class="bg-slate-50 shadow-inner rounded-b-xl p-2 w-full">
        
        <div class="flex items-center justify-between mb-2 border-b border-slate-200 pb-2">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Riepilogo Totali</h4>
            
            <div class="flex items-center gap-2">
                <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                    {{ totals.goals }}/{{ totals.shots }}
                </span>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            
            <div 
                v-for="(category, index) in shotCategories" 
                :key="index"
                class="bg-white rounded-lg p-2 border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
            >
                <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                    <span class="font-bold text-blue-950 text-sm">{{ category.label }}</span>
                    <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
                        {{ totals[category.key] }}
                    </span>
                </div>

                <div class="flex flex-col gap-y-1 mt-2 text-[12px]">
                    <div 
                        v-for="(zone, zIndex) in evenZones" 
                        :key="zIndex"
                        class="flex justify-between items-center"
                        :class="getZoneValue(category.key, zone.values) == 0 ? 'text-slate-300' : 'font-semibold text-blue-900'"
                    >
                        <span>{{ zone.label }}</span>
                        <span class="font-mono text-[13px]">{{ getZoneValue(category.key, zone.values) }}</span>
                    </div>
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