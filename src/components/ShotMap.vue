<template>
    <div class="p-2">

        <div class="relative w-full max-w-lg mx-auto aspect-[4/3] bg-cyan-50 border-2 border-cyan-200 rounded-lg overflow-hidden">
            
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-300 via-cyan-100 to-transparent"></div>

            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/5 h-[8%] border-x-4 border-b-4 border-white bg-blue-900/10 z-10 shadow-inner"></div>

            <div class=" absolute bottom-0 right-0 flex bg-slate-200 p-0.5 rounded-lg">
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
            
            <div class="absolute top-[20%] w-full h-[2px] bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] z-0"></div>
            <span class="absolute top-[20%] left-2 -translate-y-1/2 text-[9px] font-bold text-red-600 bg-cyan-50 px-1">2m</span>

            <div v-if="viewMode=='even'">
                <div class="absolute top-[60%] w-full h-[2px] bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)] z-0"></div>
                <span class="absolute top-[60%] left-2 -translate-y-1/2 text-[9px] font-bold text-yellow-600 bg-cyan-50 px-1">6m</span>

                <div class="absolute top-[10%] left-1/2 -translate-x-1/2 z-20">
                    <ZoneBadge name="Centroboa" :goals="getEvenZoneGoals('Centroboa')" :total="getEvenZoneTotal('Centroboa')" />
                </div>
    
                <div class="absolute top-[60%] left-1/2 -translate-x-1/2 z-20">
                    <ZoneBadge name="3" :goals="getEvenZoneGoals('3')" :total="getEvenZoneTotal('3')" />
                </div>
    
                <div class="absolute top-[40%] left-[20%] z-20">
                    <ZoneBadge name="4" :goals="getEvenZoneGoals('4')" :total="getEvenZoneTotal('4')" />
                </div>
                
                <div class="absolute top-[10%] left-[10%] z-20">
                    <ZoneBadge name="5" :goals="getEvenZoneGoals('5')" :total="getEvenZoneTotal('5')" />
                </div>
                
                <div class="absolute top-[40%] right-[20%] z-20">
                    <ZoneBadge name="2" :goals="getEvenZoneGoals('2')" :total="getEvenZoneTotal('2')" />
                </div>
    
                <div class="absolute top-[10%] right-[10%] z-20">
                    <ZoneBadge name="1" :goals="getEvenZoneGoals('1')" :total="getEvenZoneTotal('1')" />
                </div>
    
                <div class="absolute bottom-2 left-2 z-20">
                    <ZoneBadge name="Controfuga" :goals="getEvenZoneGoals('Ripartenze')" :total="getEvenZoneTotal('Ripartenze')" />
                </div>
            </div>
            <div v-else-if="viewMode=='sup'">
                <div class="absolute top-[50%] w-full h-[2px] bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)] z-0"></div>
                <span class="absolute top-[50%] left-2 -translate-y-1/2 text-[9px] font-bold text-yellow-600 bg-cyan-50 px-1">5m</span>

                <div class="absolute top-[10%] left-[35%] z-20">
                    <ZoneBadge name="P5" :goals="getSupZoneGoals('P5')" :total="getSupZoneTotal('P5')" />
                </div>
                <div class="absolute top-[10%] right-[35%] z-20">
                    <ZoneBadge name="P6" :goals="getSupZoneGoals('P6')" :total="getSupZoneTotal('P6')" />
                </div>
                <div class="absolute top-[10%] right-[10%] z-20">
                    <ZoneBadge name="1" :goals="getSupZoneGoals('1')" :total="getSupZoneTotal('1')" />
                </div>
                <div class="absolute top-[10%] left-[10%] z-20">
                    <ZoneBadge name="4" :goals="getSupZoneGoals('4')" :total="getSupZoneTotal('4')" />
                </div>
                <div class="absolute top-[40%] left-[35%] z-20">
                    <ZoneBadge name="3" :goals="getSupZoneGoals('3')" :total="getSupZoneTotal('3')" />
                </div>
                <div class="absolute top-[40%] right-[35%] z-20">
                    <ZoneBadge name="2" :goals="getSupZoneGoals('2')" :total="getSupZoneTotal('2')" />
                </div>
    
                <div class="absolute bottom-2 left-2 z-20">
                    <ZoneBadge name="Controfuga" :goals="getSupZoneGoals('Ripartenze')" :total="getSupZoneTotal('Ripartenze')" />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ZoneBadge from './ZoneBadge.vue';
import { EvenShot, MenUpShot } from '@/enum/ShotDescription';

// Definiamo i tipi basandoci su quelli che usi nel parent
interface Shot {
  outcome: string;
  position: string;
  // ... altre proprietà
}

interface ShotStats {
  goals: Shot[];
  shots: Shot[]; // Questo è il totale dei tiri per quella situazione
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
    'Ripartenze': ['Ripartenze', 'RIPARTENZE', EvenShot.Rip]
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
    'Ripartenze': ['Ripartenze', 'RIPARTENZE', MenUpShot.Rip]
};

// 2. I METODI DI CALCOLO
const getEvenZoneGoals = (zoneName: string): number => {
    if (!props.stats) return 0;
    
    // Recuperiamo i codici posizione associati a questa zona grafica
    const validPositions = evenZoneMapping[zoneName] || [];
    let totalGoals = 0;

    // Sommiamo i goal da tutte le situazioni di gioco
    if(props.stats.evens)
        totalGoals += countGoals(props.stats.evens, validPositions);
    // totalGoals += countGoals(props.stats.penalties);

    return totalGoals;
};

const getEvenZoneTotal = (zoneName: string): number => {
    if (!props.stats) return 0;
    
    const validPositions = evenZoneMapping[zoneName] || [];
    let totalShotsCount = 0;

    if(props.stats.evens)
        totalShotsCount += countShots(props.stats.evens, validPositions);

    return totalShotsCount;
};

const getSupZoneGoals = (zoneName: string): number => {
    if (!props.stats) return 0;
    
    // Recuperiamo i codici posizione associati a questa zona grafica
    const validPositions = supZoneMapping[zoneName] || [];
    let totalGoals = 0;

    // Funzione helper per evitare ripetizioni
    
    // Sommiamo i goal da tutte le situazioni di gioco
    if(props.stats.sup)
        totalGoals += countGoals(props.stats.sup, validPositions);
    // totalGoals += countGoals(props.stats.penalties);


    return totalGoals;
};

const getSupZoneTotal = (zoneName: string): number => {
    if (!props.stats) return 0;
    
    const validPositions = evenZoneMapping[zoneName] || [];
    let totalShotsCount = 0;    

    if(props.stats.sup)
        totalShotsCount += countShots(props.stats.sup, validPositions);

    return totalShotsCount;
};

const countGoals = (categoryStats: ShotStats, validPositions: string[]) => {
    if (!categoryStats) return 0;
    return categoryStats.goals.filter(shot => validPositions.includes(shot.position)).length;
};

const countShots = (categoryStats: ShotStats, validPositions: string[]) => {
        if (!categoryStats) return 0;
        return categoryStats.shots.filter(shot => validPositions.includes(shot.position)).length;
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