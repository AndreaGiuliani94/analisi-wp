<template>
    <div>
        <div v-if="isModal" class="flex justify-between items-center pb-2">
            <h4 class="text-lg font-bold text-red-800">{{ team.name }}</h4>
            <QuarterFilter v-model="localQuarter" :is-modal="isModal" />
        </div>
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
                                ? 'bg-blue-950 text-white '
                                : 'bg-white text-blue-950 shadow-sm '
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
                            <PenaltyTab :team="team" class="text-sm rounded-lg bg-white"
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
    </div>
</template>


<script setup lang="ts">
import type { Team } from '../interfaces/Team';
import { Tab, TabGroup,
  TabList,
  TabPanels,
  TabPanel } from "@headlessui/vue";
import EvenTab from './tabs/EvenTab.vue';
import ExclutionsTab from './tabs/ExclutionsTab.vue';
import ManUpTab from './tabs/ManUpTab.vue';
import PenaltyTab from './tabs/PenaltyTab.vue';
import QuarterFilter from './filters/QuarterFilter.vue';
import { computed, inject, provide, ref, type Ref } from 'vue';

const props = defineProps<{
    team: Team;
    isModal:boolean;
}>();

const tabs = ['Pari', 'Superiorità', 'Rigori' , 'Falli'];

// 1. INJECT: Ascoltiamo il genitore (se esiste)
const injectedQuarter = inject<Ref<number | null>>('reportQuarter', ref(null));

// 2. STATO LOCALE: Per quando siamo isolati nella modale
const localQuarter = ref<number | null>(null);

// 3. LA MAGIA: Il "binario di scambio" (Writable Computed)
const activeQuarter = computed({
    get() {
        // Se siamo in modale, leggi il locale. Altrimenti, leggi l'iniettato.
        return props.isModal ? localQuarter.value : injectedQuarter.value;
    },
    set(val) {
        // Quando l'utente clicca il filtro, scrivi nel posto giusto!
        if (props.isModal) {
            localQuarter.value = val;
        } else {
            injectedQuarter.value = val;
        }
    }
});

// 4. RE-PROVIDE: Diciamo a tutti i figli (EvenTab, TeamTable) di ascoltare activeQuarter!
// Usiamo la stessa chiave 'reportQuarter', sovrascrivendo quella del nonno.
provide('reportQuarter', activeQuarter);

</script>