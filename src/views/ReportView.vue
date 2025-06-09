<template>
    <div class="w-full">
        <div class="flex justify-start items-center">
            <NavButton
                :label="'Live'"
                :icon="ArrowLeftIcon"
                to="/game/live">
            </NavButton>
        </div>
    </div>
    <h1 class="text-xl text-center font-bold p-2 text-blue-950">Report di {{ store.match.homeTeam.name }} - {{ store.match.awayTeam.name }}</h1>
    <div class="relative overflow-x-auto shadow-md rounded-lg">
        <div class="m-2.5 align-middle font-bold text-lg text-red-800">
            <span>{{ store.match.homeTeam.name }}</span>
        </div>
        <table class="w-full text-sm text-left border-collapse rounded-lg">
            <thead class="text-xs text-white uppercase bg-red-800 rounded-lg">
                <tr>
                    <th class="pl-2.5"></th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Nome</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">In campo</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">In panchina</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Pari</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Sup</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Rigori</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Totali</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Falli</th>
                </tr>
            </thead>
            <tbody class="text-blue-950">
                <tr v-for="element in store.actualPlayers" :key="element.number" class="border border-gray-300">
                    <td class="pl-2.5 py-3 font-medium whitespace-nowrap ">{{ element.number }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.name }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.activeTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.benchTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsEven.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsSup.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsPenalty.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ getAllShoots(element) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ getExclutions(element) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="relative overflow-x-auto shadow-md rounded-lg mt-2.5">
        <div class="m-2.5 align-middle font-bold text-lg text-red-800">
            <span>{{ store.match.awayTeam.name }}</span>
        </div>
        <table class="w-full text-sm text-left border-collapse rounded-lg">
            <thead class="text-xs text-white uppercase bg-red-800 rounded-lg">
                <tr>
                    <th class="pl-2.5"></th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Nome</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">In campo</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">In panchina</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Pari</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Sup</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Rigori</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Totali</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Falli</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="element in store.actualOpponents" :key="element.number" class="border border-gray-300">
                    <td class="pl-2.5 py-3 font-medium whitespace-nowrap ">{{ element.number }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.name }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.activeTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.benchTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsEven.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsSup.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsPenalty.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ getAllShoots(element) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ getExclutions(element) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <ExportButton @exportToExcel="downloadExcel" />
</template>

<script setup lang="ts">
import ExportButton from '@/components/buttons/ExportButton.vue';
import { useElementStore } from '../stores/gameStore';
import { ArrowLeftIcon } from '@heroicons/vue/20/solid';
import NavButton from '@/components/buttons/NavButton.vue';
import type { Player } from '@/components/Interfaces/Player';
import { exportTeamsToExcel } from '@/utils/export';
const store = useElementStore();

const getAllShoots = (element: Player) => {
    return store.getAllShoots(element).goals + '/' + store.getAllShoots(element).shots;
}

const getExclutions = (element: Player) => {
    var str: string = '';
    for (let index = 0; index < element.exclutions.length; index++) {
        const excl = element.exclutions[index];
        str += (index > 0 ? ', ' : '') + excl.quarter + 'T ' + excl.time + ' ' + (excl.type + ' ' + excl.position);
        if(excl.type !== 'EDCS') {
            str += ' ';
            str += excl.ball ? 'Con palla' : 'Senza palla';
        }
    }
    return str;
}

const downloadExcel = () => {
    exportTeamsToExcel({
        match: store.match,
        formatTime: store.formatTime,
        getAllShoots,
        getExclutions,
  });
}

</script>
