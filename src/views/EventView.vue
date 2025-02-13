<template>
    <h1 class="text-3xl text-center font-bold p-2 pl-2.5">Eventi di {{ store.match.name }}</h1>
    <div class="relative overflow-x-auto shadow-md rounded-lg">
        <table class="w-full text-sm text-left border-collapse rounded-lg">
            <thead class="text-xs text-white uppercase bg-red-600 rounded-lg">
                <tr>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Tempo</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Minuto</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Giocatore</th>
                    <th scope="col" class="px-4 py-3 whitespace-nowrap">Evento</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="event in store.events" class="border border-gray-300">
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.quarter }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.time }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.player.name }}</td>
                    <td class="px-4 py-3 whitespace-nowrap ">{{ event.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="flex justify-center items-center gap-10 m-5">
        <button @click="$router.push('/game')" class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['fas', 'play']" class="w-3.5 h-3.5 text-white me-2"/> Live!</button>
        <button @click="store.exportToExcel(store.events)" class="p-2.5 inline-flex items-center text-regular font-medium bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['far', 'file-excel']" class="w-3.5 h-3.5 text-white me-2"/> Esporta</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>
