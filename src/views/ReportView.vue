<template>
    <h1 class="text-3xl text-center font-bold p-2 m-2">Report di {{ store.match.name }}</h1>
    <div class="relative overflow-x-auto shadow-md rounded-lg">
        <table class="w-full text-sm text-left border-collapse rounded-lg">
            <thead class="text-xs text-white uppercase bg-red-600 rounded-lg">
                <tr>
                    <th class="pl-2.5"></th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Nome</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">In campo</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">In panchina</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Gol</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Falli</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="element in store.actualPlayers" :key="element.number" class="border border-gray-300">
                    <td class="pl-2.5 py-3 font-medium whitespace-nowrap ">{{ element.number }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.name }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.activeTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.benchTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.goals + '/' + element.shoots }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.exclutions }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="flex justify-center items-center gap-10 m-5">
        <button @click="$router.push('/game')" class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['fas', 'play']" class="w-3.5 h-3.5 text-white me-2"/> Live!</button>
        <button @click="store.exportToExcel(store.players)" class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['far', 'file-excel']" class="w-3.5 h-3.5 text-white me-2"/> Esporta</button>
    </div>
</template>

<script setup lang="ts">
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>
