<template>
    <div class="w-full">
        <div class="grid grid-cols-3">
            <!-- Colonna sinistra: bottone -->
            <div class="justify-self-start">
            <NavButton
                :label="'Live'"
                :icon="ArrowLeftIcon"
                to="live" />
            </div>
            <!-- Colonna centrale: titolo -->
            <h1 class="text-lg font-bold text-blue-950 text-center">
                Report di 
                <div>{{ gameStore.match.homeTeam.name }} - {{ gameStore.match.awayTeam.name }}</div>
            </h1>
            <!-- Colonna destra: export button-->
            <div class="justify-self-end">
                <ExportButton @exportToExcel="downloadExcel" />
            </div>
        </div>
    </div>

    <div class="my-2">
        <TabGroup>
            <TabList class="flex gap-2 rounded-xl bg-slate-50 border border-slate-200 shadow p-1 w-full">
                <Tab
                    v-for="tab in tabs"
                    v-slot="{ selected }"
                    :key="tab"
                    class="w-full font-medium text-red-800 rounded-lg focus:outline-none"
                >
                    <div 
                    class="rounded-lg leading-3 py-2.5 text-lg"
                    :class="{ 'bg-red-800 text-white': selected, 'bg-white border border-slate-200': !selected }">
                        {{ tab }}
                    </div>
                </Tab>
            </TabList>

            <TabPanels class="">
                <TabPanel>
                    <TeamPanel :team="gameStore.match.homeTeam" :getAllShoots="getAllShoots"></TeamPanel>
                </TabPanel>
                <TabPanel>
                    <TeamPanel :team="gameStore.match.awayTeam" :getAllShoots="getAllShoots"></TeamPanel>
                </TabPanel>
            </TabPanels>
        </TabGroup>
    </div>
</template>

<script setup lang="ts">
import ExportButton from '@/components/buttons/ExportButton.vue';
import { useGameStore } from '../stores/gameStore';
import { ArrowLeftIcon } from '@heroicons/vue/20/solid';
import NavButton from '@/components/buttons/NavButton.vue';
import type { Player } from '@/interfaces/Player';
import { exportTeamsToExcel } from '@/utils/export';
import { Tab, TabGroup,
  TabList,
  TabPanels,
  TabPanel } from "@headlessui/vue";
import TeamPanel from '@/components/TeamPanel.vue';
import { formatTime, getExclution } from '@/utils/utils';

const gameStore = useGameStore();

const tabs = [gameStore.match.homeTeam.name, gameStore.match.awayTeam.name]

const getAllShoots = (element: Player) => {
    return gameStore.getAllPlayerShots(element, null).goals + '/' + gameStore.getAllPlayerShots(element, null).shots;
}

const getExclutions = (element: Player) => {
    if(!element.id) return ''

    const fouls = gameStore.getPlayerFouls(element.id);
    if (!fouls || fouls.length === 0) return '';
    return fouls.map(excl => getExclution(excl)).join('\n');    
}

const downloadExcel = () => {
    exportTeamsToExcel({
        match: gameStore.match,
        formatTime: formatTime,
        getAllShoots,
        getExclutions,
  });
}

</script>
