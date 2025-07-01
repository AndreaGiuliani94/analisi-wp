<template>
    <div class="w-full">
        <div class="grid grid-cols-3">
            <!-- Colonna sinistra: bottone -->
            <div class="justify-self-start">
            <NavButton
                :label="'Live'"
                :icon="ArrowLeftIcon"
                to="/game/live" />
            </div>
            <!-- Colonna centrale: titolo -->
             <h1 class="text-xl text-center font-bold p-2 text-blue-950">
                Eventi di 
                <div>{{ store.match.homeTeam.name }} - {{ store.match.awayTeam.name }}</div>
            </h1>
            <!-- Colonna destra: export button-->
            <div class="justify-self-end">
                <ExportButton @exportToExcel="downloadExcel" />
            </div>
        </div>
    </div>
    <div class="relative overflow-x-auto shadow-md rounded-lg">
        <table class="w-full text-sm text-left border-collapse rounded-lg">
            <thead class="text-xs text-white uppercase bg-red-800 rounded-lg">
                <tr>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Tempo</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Minuto</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Squadra</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Giocatore</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Evento</th>
                </tr>
            </thead>
            <tbody class="text-blue-950">
                <tr v-for="event in store.events" class="border border-gray-300">
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.quarter }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.time }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.team }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.player.number + '. ' + event.player.name }} </td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.description }}</td>
                </tr>
            </tbody>
        </table>
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

</script>
