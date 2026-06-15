<template>
    <div class="w-full">
        <div class="grid grid-cols-3 items-center">
            <!-- Colonna sinistra: bottone -->
            <div class="justify-self-start">
            </div>
            <!-- Colonna centrale: titolo -->
            <h1 class="text-lg font-bold text-blue-950 text-center">
                <div>{{ gameStore.match.homeTeam.name }} - {{ gameStore.match.awayTeam.name }}</div>
                <div>{{ gameStore.match.homeTeam.score }} - {{ gameStore.match.awayTeam.score }}</div>
            </h1>
            <!-- Colonna destra: export button-->
            <div class="justify-self-end">
                <ExportButton @exportToExcel="downloadExcel" />
            </div>
        </div>
    </div>

    <div class="grid grid-cols-3 gap-2 items-center justify-center">
        <QuarterFilter class="max-w-fit"
            v-model="selectedQuarter"
            :isModal="true"
        />
        
        <div class="flex justify-center gap-1 font-medium mb-1">
            <template v-for="(p, i) in gameStore.partials" :key="i">
                <span class="flex items-center" >
                    <span class="text-xs mr-0.5 text-gray-400" v-if="i > 0">|</span>
                    <span :class="[
                        i + 1 == selectedQuarter ? 'bg-blue-950 text-white px-1 rounded-2xl' : '']">
                        {{ p.home }}-{{ p.away }}
                    </span>
                </span>
            </template>
        </div>

    </div>
    <div class="my-2">
        <TabGroup>
            <div class="flex gap-2">
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
            </div>

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
import type { Player } from '@/interfaces/Player';
import { exportTeamsToExcel } from '@/utils/export';
import { Tab, TabGroup,
  TabList,
  TabPanels,
  TabPanel } from "@headlessui/vue";
import TeamPanel from '@/components/TeamPanel.vue';
import { formatTime, getExclution } from '@/utils/utils';
import QuarterFilter from '@/components/filters/QuarterFilter.vue';
import { provide, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();

const tabs = [gameStore.match.homeTeam.name, gameStore.match.awayTeam.name]

const selectedQuarter = ref<number | null>(null);

provide('reportQuarter', selectedQuarter);

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
