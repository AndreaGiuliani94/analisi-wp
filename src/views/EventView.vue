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
    <div class="button-box">
        <button @click="$router.push('/game')">Vai al Live</button>
        <button @click="store.exportToExcel(store.events)" class="save-button">Esporta Eventi</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>
