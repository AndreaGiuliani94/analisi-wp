<template>
    <h1>Report di {{ store.match.name }}</h1>
    <div>
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
    <div class="button-box">
        <button @click="$router.push('/game')">Vai al Live</button>
        <button @click="store.exportToExcel(store.players)" class="save-button">Esporta Report</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>
