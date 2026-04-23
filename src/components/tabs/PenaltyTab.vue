<template>
    <div class="p-2 w-full">
        
        <div class="flex justify-between mb-2 border-b border-slate-200 pb-2">
            <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Riepilogo Totali</h4>
                
                <div class="flex items-center gap-2">
                    <span class="bg-blue-950 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm font-mono">
                        {{ totals.goals }}/{{ totals.shots }}
                    </span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            
            <div 
                v-for="(category, index) in penaltyCategories" 
                :key="index"
                class="bg-white rounded-lg p-2 border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
            >
                <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                    <span class="font-bold text-blue-950 text-sm">{{ category.label }}</span>
                    <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
                        {{ totals[category.key] }}
                    </span>
                </div>
                
            </div>
            
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type PropType, type Ref } from 'vue';
import type { Team } from '../../interfaces/Team';
import { EvenShot, ShotCategory } from '@/enum/ShotDescription';
import type { CategoryKey } from '../../interfaces/shot/Category';
import { penaltyCategories } from '@/const/consts';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore()
const props = defineProps({
    team: {
        type: Object as PropType<Team>,
        required: true,
    }
});

const reportQuarter = inject<Ref<number | null>>('reportQuarter', ref(null));

const totals = computed(() => ({
  goals: penalties.value.goals.length,
  shots: penalties.value.shots.length,
  parati: penalties.value.parati.length,
  fuori: penalties.value.fuori.length,
  stoppati: penalties.value.stoppati.length,
  annullati: penalties.value.stoppati.length
}))

const penalties = computed(() => gameStore.getAllTeamShotsByType(props.team, ShotCategory.PENALTY, reportQuarter.value))

</script>