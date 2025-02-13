<template>
    <h1>Report di {{ store.match.name }}</h1>
    <div class="table-container">
        <table class="report-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Nome</th>
                    <th>In campo</th>
                    <th>In panchina</th>
                    <th>Gol</th>
                    <th>Falli</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="element in store.players" :key="element.number">
                    <td>{{ element.number }}</td>
                    <td>{{ element.name }}</td>
                    <td>{{ store.formatTime(element.activeTime) }}</td>
                    <td>{{ store.formatTime(element.benchTime) }}</td>
                    <td>{{ element.goals + '/' + element.shoots }}</td>
                    <td>{{ element.exclutions }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="flex justify-center items-center gap-10 p-2">
        <button @click="$router.push('/game')" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300"><font-awesome-icon :icon="['fas', 'play']" /> Live!</button>
        <button @click="store.exportToExcel(store.players)" class="p-2.5 text-sm md:text-md bg-green-600 text-white rounded-md cursor-pointer shadow-md active:bg-green-800 active:outline-none active:ring-2 active:ring-green-300">Esporta Report</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>
