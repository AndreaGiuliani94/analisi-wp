<template>
    <div class="w-full">
        <div class="flex justify-start items-center gap-2">
            <button @click="$router.push('/game/live')"
                class="inline-flex items-center text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-2 py-1 text-center shadow-lg cursor-pointer">
                <ArrowLeftIcon class="size-4 me-1" /> Live
            </button>
        </div>
    </div>
    <h1 class="text-3xl text-center font-bold p-2 pl-2.5">Eventi di {{ store.match.homeTeam.name }} - {{ store.match.awayTeam.name }}</h1>
    <div class="relative overflow-x-auto shadow-md rounded-lg">
        <table class="w-full text-sm text-left border-collapse rounded-lg">
            <thead class="text-xs text-white uppercase bg-red-600 rounded-lg">
                <tr>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Tempo</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Minuto</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Squadra</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Giocatore</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Evento</th>
                </tr>
            </thead>
            <tbody>
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
    <ExportButton :elements="store.events"/>
</template>

<script setup lang="ts">
import ExportButton from '@/components/buttons/ExportButton.vue';
import { useElementStore } from '../stores/gameStore';
import { ArrowLeftIcon } from '@heroicons/vue/20/solid';
const store = useElementStore();

</script>
