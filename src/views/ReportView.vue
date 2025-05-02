<template>
    <div class="w-full">
        <div class="flex justify-start items-center gap-2">
            <button @click="$router.push('/game/live')"
                class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-2 py-1 text-center shadow-lg cursor-pointer">
                <ArrowLeftIcon class="size-4 me-1" /> Live
            </button>
        </div>
    </div>
    <h1 class="text-3xl text-center font-bold p-2 m-2 text-blue-950">Report di {{ store.match.homeTeam.name }} - {{ store.match.awayTeam.name }}</h1>
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
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsEven.length + '/' + element.shotsEven.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.exclutions }}</td>
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
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Gol</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap ">Falli</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="element in store.actualOpponents" :key="element.number" class="border border-gray-300">
                    <td class="pl-2.5 py-3 font-medium whitespace-nowrap ">{{ element.number }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.name }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.activeTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ store.formatTime(element.benchTime) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.shotsEven.length + '/' + element.shotsEven.length }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ element.exclutions }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <ExportButton :elements="store.actualPlayers.concat(store.actualOpponents)" />
</template>

<script setup lang="ts">
import ExportButton from '@/components/buttons/ExportButton.vue';
import { useElementStore } from '../stores/gameStore';
import { ArrowLeftIcon } from '@heroicons/vue/20/solid';
const store = useElementStore();

</script>
