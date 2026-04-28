<template>
    <div class="w-full flex flex-col gap-2">
        
        <div class="grid grid-cols-3 items-center">
            <div class="justify-self-start">
                <QuarterFilter class="max-w-fit"
                    v-model="selectedQuarter"
                    :isModal="true"
                />
            </div>
            
            <div class="flex flex-col items-center">
                <div class="text-lg font-bold text-red-800">
                    {{ gameStore.match.homeTeam.name }} - {{ gameStore.match.awayTeam.name }}: {{ gameStore.match.homeTeam.score }} - {{ gameStore.match.awayTeam.score }}
                </div>
                <div class="flex justify-center gap-1 font-medium mb-1">
                    <template v-for="(p, i) in gameStore.partials" :key="i">
                        <span class="flex items-center">
                            <span class="text-xs mr-0.5 text-gray-400" v-if="i > 0">|</span>
                            <span :class="[
                                i + 1 == selectedQuarter ? 'bg-blue-950 text-white px-1 rounded-2xl' : '']">
                                {{ p.home }}-{{ p.away }}
                            </span>
                        </span>
                    </template>
                </div>
            </div>
            
            <div class="justify-self-end">
                <ExportButton @exportToExcel="downloadExcel" />
            </div>
        </div>

        <div>
            <div class="grid grid-cols-3 gap-2 items-center justify-center">
                
                
                

            </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table class="w-full text-sm text-left">
                
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                    <tr>
                        <th scope="col" class="px-4 py-3 whitespace-nowrap text-center">Tempo</th>
                        <th scope="col" class="px-4 py-3 whitespace-nowrap text-center">Minuto</th>
                        <th scope="col" class="px-4 py-3 whitespace-nowrap">Squadra</th>
                        <th scope="col" class="px-4 py-3 whitespace-nowrap">Giocatore</th>
                        <th scope="col" class="px-4 py-3 w-full">Evento</th>
                    </tr>
                </thead>
                
                <tbody class="divide-y divide-slate-100 text-slate-700">
                    <tr 
                        v-for="(event, index) in filteredEvents" 
                        :key="index" 
                        class="transition-colors duration-150"
                        :class="getRowStyle(event)"
                    >
                        <td class="px-4 py-3 whitespace-nowrap text-center font-bold">
                            {{ event.quarter }}°
                        </td>
                        
                        <td class="px-4 py-3 whitespace-nowrap text-center font-mono tabular-nums opacity-75">
                            {{ event.time }}
                        </td>
                        
                        <td class="px-4 py-3 whitespace-nowrap font-medium uppercase text-xs opacity-90">
                            {{ event.team }}
                        </td>
                        
                        <td class="px-4 py-3 whitespace-nowrap">
                            <span class="font-bold mr-1">{{ event.player.number }}.</span>
                            <span class="font-medium">{{ event.player.name }}</span>
                        </td>
                        
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-between">
                                <span class="font-semibold">{{ getEventDescription(event) }}</span>
                                
                                <div 
                                    v-if="isGoal(event) && event.homeScore !== undefined" 
                                    class="ml-3 flex items-center rounded overflow-hidden border border-blue-800 shadow-sm font-mono text-sm font-bold leading-none"
                                >
                                    <span 
                                        class="px-2 py-1 transition-colors" 
                                        :class="isHomeEvent(event.team) ? 'bg-blue-950 text-white' : 'bg-white text-blue-950'"
                                    >
                                        {{ event.homeScore }}
                                    </span>
                                    
                                    <span class="p-1 text-[10px] bg-white text-blue-950">
                                        -
                                    </span>
                                    
                                    <span 
                                        class="px-2 py-1 transition-colors" 
                                        :class="!isHomeEvent(event.team) ? 'bg-blue-950 text-white' : 'bg-white text-blue-950'"
                                    >
                                        {{ event.awayScore }}
                                    </span>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div v-if="gameStore.events.length === 0" class="p-8 text-center text-slate-400 italic">
                Nessun evento registrato finora.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ExportButton from '@/components/buttons/ExportButton.vue';
import { useGameStore } from '@/stores/gameStore';
import { exportEventsToExcel } from '@/utils/export';
import { MatchEventType } from '@/enum/MatchEventDescription';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import { ShotOutcome } from '@/enum/ShotDescription';
import { getEventDescription } from '@/utils/utils';
import QuarterFilter from '@/components/filters/QuarterFilter.vue';
import { computed, ref } from 'vue';

const gameStore = useGameStore();

const selectedQuarter = ref<number | null>(null);

const filteredEvents = computed(() => {
    if(selectedQuarter.value != null)
        return gameStore.events.filter(ev => ev.quarter === selectedQuarter.value);
    else
        return gameStore.events
} )

const downloadExcel = () => {
    exportEventsToExcel(gameStore.events, gameStore.match);
}

// Funzione helper per determinare se l'evento è un goal
const isGoal = (event: MatchEvent): boolean => {
    return event.eventType === MatchEventType.SHOT && event.shotOutcome === ShotOutcome.GOAL;
}

// Controlla se l'evento è della squadra di casa
const isHomeEvent = (eventTeam: string): boolean => {
    // Adatta questo controllo se nel tuo 'event.team' salvi un ID invece del nome
    return eventTeam === gameStore.match.homeTeam.name;
}

// Logica per colorare l'intera riga (Sfondo chiaro + Testo in tinta)
const getRowStyle = (event: MatchEvent): string => {
    
    // Goal: Sfondo verdino chiarissimo, testo verde scuro
    if (isGoal(event)) {
        return 'bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50';
    }
    
    // Penalità gravi (Espulsioni/Rigori): Sfondo rossino chiarissimo, testo rosso scuro
    if (event.eventType === MatchEventType.FOUL) {
        return 'bg-red-50/50 text-red-800 hover:bg-red-50';
    }
    
    // Eventi neutri/minori (Tiri, palle rubate): Sfondo bianco standard, hover grigio
    return 'bg-white text-blue-950 hover:bg-slate-50';
}
</script>