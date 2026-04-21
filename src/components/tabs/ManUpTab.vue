<template>
    <div class="rounded-b-xl p-2 w-full">
        
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
                        v-for="(zone, zIndex) in supZones" 
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
import type { Team } from '../../interfaces/Team';
import { MenUpShot, ShotCategory } from '@/enum/ShotDescription';
import { shotCategories } from '@/const/consts';
import type { CategoryKey } from '../../interfaces/shot/Category';
import { supZones } from '../../interfaces/shot/Zone';
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
  return gameStore.getAllTeamShotsByType(props.team, ShotCategory.SUP)[category].filter(shot => shot.shotPosition ? positions.includes(shot.shotPosition) : false ).length
}

function getZoneValue(category: CategoryKey, values: (MenUpShot | string)[]): number {
  const stringPositions = values.map(v => v.toString())
  return getShotsByCategory(category, stringPositions)
}

</script>