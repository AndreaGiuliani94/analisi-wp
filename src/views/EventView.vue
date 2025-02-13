<template>
    <h1>Eventi di {{ store.match.name }}</h1>
    <div class="table-container">
        <table class="event-table">
            <thead>
                <tr>
                    <th>Tempo</th>
                    <th>Minuto</th>
                    <th>Giocatore</th>
                    <th>Evento</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="event in store.events">
                    <td>{{ event.quarter }}</td>
                    <td>{{ event.time }}</td>
                    <td>{{ event.player.name }}</td>
                    <td>{{ event.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="flex justify-center items-center gap-10 p-2">
        <button @click="$router.push('/game')" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['fas', 'play']" /> Live!</button>
        <button @click="store.exportToExcel(store.events)" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300">Esporta Eventi</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>
