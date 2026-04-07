<template>
    <TabGroup>
        <TabList class="flex space-x-1 rounded-lg bg-slate-100 p-1"
            :class="isModal ? '' : 'rounded-b-none border border-b-0 border-slate-100 '">
            
            <Tab
                v-for="tab in tabs"
                :key="tab"
                v-slot="{ selected }"
                as="template"
            >
                <button
                    :class="[
                        'w-full rounded-md py-2 text-sm font-semibold transition-all duration-200 focus:outline-none',
                        selected
                            ? 'bg-white text-blue-950 shadow-sm ring-1 ring-slate-900/5'
                            : 'text-slate-500 hover:bg-slate-200/50 hover:text-blue-900'
                    ]"
                >
                    {{ tab }}
                </button>
            </Tab>
            
        </TabList>

        <TabPanels class="relative">
    
            <TabPanel v-slot="{ selected }" static class="focus:outline-none">
                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in absolute inset-x-0 top-0"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                >
                    <div v-show="selected">
                        <ManUpTab :team="team" class="text-sm rounded-lg bg-white"
                            :class="isModal ? '' : 'rounded-t-none rounded-xl border border-t-0 border-slate-100 shadow-inner'" />
                    </div>
                </Transition>
            </TabPanel>

            <TabPanel v-slot="{ selected }" static class="focus:outline-none">
                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in absolute inset-x-0 top-0"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                >
                    <div v-show="selected">
                        <EvenTab :team="team" class="text-sm rounded-lg bg-white"
                            :class="isModal ? '' : 'rounded-t-none rounded-xl border border-t-0 border-slate-100 shadow-inner'" />
                    </div>
                </Transition>
            </TabPanel>

            <TabPanel v-slot="{ selected }" static class="focus:outline-none">
                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in absolute inset-x-0 top-0"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                >
                    <div v-show="selected">
                        <ExclutionsTab :team="team" class="text-sm rounded-lg bg-white" 
                            :class="isModal ? '' : 'rounded-t-none rounded-xl border border-t-0 border-slate-100 shadow-inner'" />
                    </div>
                </Transition>
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
import ManUpTab from './tabs/ManUpTab.vue';

const props = defineProps<{
  team: Team;
  isModal:boolean;
}>();

const tabs = ['Superiorità', 'Pari', 'Falli'];

</script>