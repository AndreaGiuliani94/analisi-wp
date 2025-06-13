<template>
    <div class="w-full">
        <div class="grid grid-cols-3">
            <!-- Colonna sinistra: bottone -->
            <div class="justify-self-start">
            <NavButton
                :label="'Live'"
                :icon="ArrowLeftIcon"
                to="/game/live" />
            </div>
            <!-- Colonna centrale: titolo -->
            <h1 class="text-lg font-bold text-blue-950 text-center">
                Report di 
                <div>{{ store.match.homeTeam.name }} - {{ store.match.awayTeam.name }}</div>
            </h1>
            <!-- Colonna destra: export button-->
            <div class="justify-self-end">
                <ExportButton @exportToExcel="downloadExcel" />
            </div>
        </div>
    </div>

    <div class="my-2">
        <TabGroup>
            <TabList class="flex gap-2 rounded-xl bg-gray-200 p-1 w-full">
                <Tab
                    v-for="tab in tabs"
                    v-slot="{ selected }"
                    :key="tab"
                    class="w-full font-medium text-red-800 rounded-lg focus:outline-none"
                >
                    <div 
                    class="rounded-lg leading-3 py-2.5 text-lg"
                    :class="{ 'bg-red-800 text-white': selected, 'bg-white': !selected }">
                        {{ tab }}
                    </div>
                </Tab>
            </TabList>

            <TabPanels class="">
                <TabPanel>
                    <TeamPanel :team="store.match.homeTeam" :getAllShoots="getAllShoots"></TeamPanel>
                </TabPanel>
                <TabPanel>
                    <TeamPanel :team="store.match.awayTeam" :getAllShoots="getAllShoots"></TeamPanel>
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
import type { Player } from '@/components/Interfaces/Player';
import { exportTeamsToExcel } from '@/utils/export';
import { Tab, TabGroup,
  TabList,
  TabPanels,
  TabPanel } from "@headlessui/vue";
import TeamPanel from '@/components/TeamPanel.vue';

const store = useGameStore();

const tabs = [store.match.homeTeam.name, store.match.awayTeam.name]

const getAllShoots = (element: Player) => {
    return store.getAllShoots(element).goals + '/' + store.getAllShoots(element).shots;
}

const getExclutions = (element: Player) => {
    var str: string = '';
    for (let index = 0; index < element.exclutions.length; index++) {
        const excl = element.exclutions[index];
        str += (index > 0 ? '\n' : '') + excl.quarter + 'T ' + excl.time + ' ' + (excl.type + ' ' + excl.position);
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
