<template>
    <div class="w-full flex flex-col gap-4">
        
        <div class="grid grid-cols-3 items-center">
            <div class="justify-self-start">
                <NavButton :label="'Live'" :icon="ArrowLeftIcon" to="/game/live" />
            </div>
            
            <div class="flex flex-col items-center">
                <h1 class="text-lg font-bold text-blue-950 uppercase tracking-wide">Play-by-Play</h1>
                <div class="text-sm font-semibold text-slate-500">
                    {{ store.match.homeTeam.name }} - {{ store.match.awayTeam.name }}
                </div>
            </div>
            
            <div class="justify-self-end">
                <ExportButton @exportToExcel="downloadExcel" />
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
                        v-for="(event, index) in store.events" 
                        :key="index" 
                        class="transition-colors duration-150"
                        :class="getRowStyle(event.description)"
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
                                <span class="font-semibold">{{ event.description }}</span>
                                
                                <div 
                                    v-if="isGoal(event.description) && event.homeScore !== undefined" 
                                    class="ml-3 flex items-center rounded overflow-hidden border border-blue-800 shadow-sm font-mono text-sm font-bold leading-none"
                                >
                                    <span 
                                        class="px-2 py-1 transition-colors" 
                                        :class="isHomeEvent(event.team) ? 'bg-blue-950 text-white' : 'bg-white text-blue-950'"
                                    >
                                        {{ event.homeScore }}
                                    </span>
                                    
                                    <span class="p-1 text-[10px] text-blue-950">
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
            
            <div v-if="store.events.length === 0" class="p-8 text-center text-slate-400 italic">
                Nessun evento registrato finora.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ExportButton from '@/components/buttons/ExportButton.vue';
import { useGameStore } from '../stores/gameStore';
import { ArrowLeftIcon } from '@heroicons/vue/20/solid';
import NavButton from '@/components/buttons/NavButton.vue';
import { exportEventsToExcel } from '@/utils/export';

const store = useGameStore();

const downloadExcel = () => {
    exportEventsToExcel(store.events, store.match);
}

// Funzione helper per determinare se l'evento è un goal
const isGoal = (description: string): boolean => {
    return description.toLowerCase().includes('goal');
}

// Controlla se l'evento è della squadra di casa
const isHomeEvent = (eventTeam: string): boolean => {
    // Adatta questo controllo se nel tuo 'event.team' salvi un ID invece del nome
    return eventTeam === store.match.homeTeam.name;
}

// Logica per colorare l'intera riga (Sfondo chiaro + Testo in tinta)
const getRowStyle = (description: string): string => {
    const desc = description.toLowerCase();
    
    // Goal: Sfondo verdino chiarissimo, testo verde scuro
    if (desc.includes('goal')) {
        return 'bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50';
    }
    
    // Penalità gravi (Espulsioni/Rigori): Sfondo rossino chiarissimo, testo rosso scuro
    if (desc.includes('espulsione') || desc.includes('rigore') || desc.includes('violento')) {
        return 'bg-red-50/50 text-red-800 hover:bg-red-50';
    }
    
    // Eventi neutri/minori (Tiri, palle rubate): Sfondo bianco standard, hover grigio
    return 'bg-white text-blue-950 hover:bg-slate-50';
}
</script>