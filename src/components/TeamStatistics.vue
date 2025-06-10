<template>
    <TabGroup>
        <TabList class="flex space-x-2 rounded-t-xl bg-gray-200 p-1">
            <Tab
                v-for="tab in tabs"
                v-slot="{ selected }"
                :key="tab"
                class="w-full font-medium text-blue-950 rounded-lg focus:outline-none"
            >
                <div 
                class="rounded-lg leading-3 py-2.5"
                :class="{ 'bg-blue-950 text-white': selected, 'bg-white': !selected }">
                    {{ tab }}
                </div>
            </Tab>
        </TabList>

        <TabPanels class="">
        <TabPanel>
            <MenUpTab :team="team" class="text-sm border rounded-b-lg border-gray-200 shadow-md"></MenUpTab>
        </TabPanel>
        <TabPanel>
            <EvenTab :team="team" class="text-sm border rounded-b-lg border-gray-200 shadow-md"></EvenTab>
        </TabPanel>
        <TabPanel>
            <ExclutionsTab :team="team" class="text-sm border rounded-b-lg border-gray-200 shadow-md"></ExclutionsTab>
        </TabPanel>
        </TabPanels>
    </TabGroup>
</template>


<script setup lang="ts">
import type { Team } from './Interfaces/Team';
import { Tab, TabGroup,
  TabList,
  TabPanels,
  TabPanel } from "@headlessui/vue";
import EvenTab from './tabs/EvenTab.vue';
import ExclutionsTab from './tabs/ExclutionsTab.vue';
import MenUpTab from './tabs/MenUpTab.vue';

const props = defineProps<{
  team: Team;
}>();

const tabs = ['Superiorità', 'Pari', 'Falli'];

</script>