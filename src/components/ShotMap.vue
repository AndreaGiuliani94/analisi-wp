<template>
    <div class="p-2">

        <div class="relative w-full max-w-lg mx-auto aspect-4/3 bg-cyan-50 border-2 border-cyan-200 rounded-lg">

            <div class="absolute inset-0 overflow-hidden rounded-t-lg z-0">

                <div class="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-300 via-cyan-100 to-transparent"></div>
    
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/5 h-[8%] border-x-4 border-b-4 border-white bg-blue-900/10 z-10 shadow-inner"></div>

                <div class="absolute top-[20%] w-full h-0.5 bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] z-0"></div>
                <span class="absolute top-[20%] left-2 -translate-y-1/2 text-[9px] font-bold text-red-600 bg-cyan-50 px-1">2m</span>
                
                <div v-if="viewMode=='even'">
                    <div class="absolute top-[60%] w-full h-0.5 bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)] z-0"></div>
                    <span class="absolute top-[60%] left-2 -translate-y-1/2 text-[9px] font-bold text-yellow-600 bg-cyan-50 px-1">6m</span>
                </div>
                <div v-else-if="viewMode=='sup'">
                    <div class="absolute top-[50%] w-full h-0.5 bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)] z-0"></div>
                    <span class="absolute top-[50%] left-2 -translate-y-1/2 text-[9px] font-bold text-yellow-600 bg-cyan-50 px-1">5m</span>
                </div>

            </div>
            
            <div class=" absolute bottom-2 right-2 flex bg-slate-200 p-0.5 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 z-20">
                <button 
                    @click="viewMode = 'even'"
                    class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
                    :class="viewMode === 'even' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-blue-900'"
                >
                    Pari
                </button>
                <button 
                    @click="viewMode = 'sup'"
                    class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
                    :class="viewMode === 'sup' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-blue-900'"
                >
                    Sup
                </button>
            </div>
            
            <div v-if="viewMode=='even'" class="absolute inset-0 z-10">
                <div class="absolute top-[10%] inset-x-0">
                    <ZoneBadge name="Centroboa" v-bind="getEvenZoneStats('Centroboa')" />
                </div>
    
                <div class="absolute top-[60%] inset-x-0">
                    <ZoneBadge name="3" v-bind="getEvenZoneStats('3')" />
                </div>
    
                <div class="absolute top-[40%] left-[20%]">
                    <ZoneBadge name="4" v-bind="getEvenZoneStats('4')" />
                </div>
                
                <div class="absolute top-[10%] left-[10%] ">
                    <ZoneBadge name="5" v-bind="getEvenZoneStats('5')" />
                </div>
                
                <div class="absolute top-[40%] right-[20%] ">
                    <ZoneBadge name="2" v-bind="getEvenZoneStats('2')" />
                </div>
    
                <div class="absolute top-[10%] right-[10%] ">
                    <ZoneBadge name="1" v-bind="getEvenZoneStats('1')" />
                </div>
    
                <div class="absolute bottom-2 left-2 ">
                    <ZoneBadge name="Controfuga" v-bind="getEvenZoneStats('Controfuga')" />
                </div>
            </div>
            <div v-else-if="viewMode=='sup'" class="absolute inset-0 z-10">

                <div class="absolute top-[10%] left-[35%]">
                    <ZoneBadge name="P5" v-bind="getSupZoneStats('P5')" />
                </div>
                <div class="absolute top-[10%] right-[35%]">
                    <ZoneBadge name="P6" v-bind="getSupZoneStats('P6')" />
                </div>
                <div class="absolute top-[10%] right-[10%]">
                    <ZoneBadge name="1" v-bind="getSupZoneStats('1')" />
                </div>
                <div class="absolute top-[10%] left-[10%]">
                    <ZoneBadge name="4" v-bind="getSupZoneStats('4')" />
                </div>
                <div class="absolute top-[40%] left-[35%]">
                    <ZoneBadge name="3" v-bind="getSupZoneStats('3')" />
                </div>
                <div class="absolute top-[40%] right-[35%]">
                    <ZoneBadge name="2" v-bind="getSupZoneStats('2')" />
                </div>
    
                <div class="absolute bottom-2 left-2">
                    <ZoneBadge name="Controfuga" v-bind="getSupZoneStats('Controfuga')" />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZoneBadge from './badges/ZoneBadge.vue';
import { EvenShot, MenUpShot } from '@/enum/ShotDescription';
import type { MatchEvent } from '@/interfaces/MatchEvent';

interface ShotStats {
  goals: MatchEvent[];
  shots: MatchEvent[];
  parati: MatchEvent[];
  fuori: MatchEvent[];
  stoppati: MatchEvent[];
  // parati, fuori, stoppati ci sono, ma per la mappa ci bastano goals e shots
}

const props = defineProps<{
    player: any;
    stats: {
        evens?: ShotStats;
        sup?: ShotStats;
        penalties?: ShotStats; // Nel caso in futuro aggiungessi i rigori offensivi
    };
}>();

const viewMode = ref('even');

// 1. IL DIZIONARIO DELLE ZONE
// Qui colleghiamo i nomi usati nella grafica (es. 'Dx') ai valori reali 
// che salvi nel database o nei tuoi Enum (es. '1', '2', 'Dx', ecc.)
const evenZoneMapping: Record<string, string[]> = {
    'Centroboa': ['Centroboa', 'CENTROBOA', EvenShot.CB],
    'Centrale': ['Centrale', 'CENTRALE', EvenShot.P3], 
    'Sx': ['Sx', 'SX', EvenShot.P4, EvenShot.P5], 
    'Dx': ['Dx', 'DX', EvenShot.P1, EvenShot.P2],
    '1': [EvenShot.P1], 
    '2': [EvenShot.P2],
    '3': [EvenShot.P3],
    '4': [EvenShot.P4],
    '5': [EvenShot.P5],
    'Controfuga': ['Ripartenze', 'RIPARTENZE', 'Ripartenza', EvenShot.Rip]
};

const supZoneMapping: Record<string, string[]> = {
    'Sx': ['Sx', 'SX', MenUpShot.P4, MenUpShot.P3], 
    'Dx': ['Dx', 'DX', MenUpShot.P1, MenUpShot.P2],
    'Pali': [MenUpShot.P5, MenUpShot.P6],
    '1': [MenUpShot.P1], 
    '2': [MenUpShot.P2],
    '3': [MenUpShot.P3],
    '4': [MenUpShot.P4],
    '5': [MenUpShot.P5],
    '6': [MenUpShot.P6],
    'Controfuga': ['Ripartenze', 'RIPARTENZE', 'Ripartenza', MenUpShot.Rip]
};

const getEvenZoneStats = (zoneName: string) => {
    const validPositions = evenZoneMapping[zoneName] || [];
    
    // Inizializziamo i contatori
    let goals = 0, saved = 0, missed = 0, blocked = 0;

    // Helper per contare una singola categoria (es. evens.goals, sup.saved)
    const count = (arr?: MatchEvent[]) => arr ? arr.filter(shot => shot.shotPosition ? validPositions.includes(shot.shotPosition) : false ).length : 0;

    if (props.stats) {
        goals += count(props.stats.evens?.goals);
        saved += count(props.stats.evens?.parati); 
        missed += count(props.stats.evens?.fuori); 
        blocked += count(props.stats.evens?.stoppati); 
    }

    // Restituiamo l'oggetto che fa match esatto con le props di ZoneBadge!
    return { goals, saved, missed, blocked };
};

const getSupZoneStats = (zoneName: string) => {
    const validPositions = supZoneMapping[zoneName] || [];
    
    // Inizializziamo i contatori
    let goals = 0, saved = 0, missed = 0, blocked = 0;

    // Helper per contare una singola categoria (es. evens.goals, sup.saved)
    const count = (arr?: MatchEvent[]) => arr ? arr.filter(shot => shot.shotPosition ? validPositions.includes(shot.shotPosition) : false ).length : 0;

    if (props.stats) {
        goals += count(props.stats.sup?.goals);
        saved += count(props.stats.sup?.parati); 
        missed += count(props.stats.sup?.fuori); 
        blocked += count(props.stats.sup?.stoppati); 
    }

    // Restituiamo l'oggetto che fa match esatto con le props di ZoneBadge!
    return { goals, saved, missed, blocked };
};

</script>

<style scoped>
/* Per la transizione morbida tra Tabella e Mappa */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>