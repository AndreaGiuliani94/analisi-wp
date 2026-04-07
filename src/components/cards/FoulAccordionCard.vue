<template>
    <div v-if="items.length > 0" class="bg-white rounded-lg p-2 shadow-sm transition-all border" :class="themeConfig.wrapperBorder">
        
        <div 
            @click="isExpanded = !isExpanded"
            class="text-xs font-bold flex items-center justify-between cursor-pointer"
            :class="[themeConfig.text, themeConfig.headerBorder, { 'border-b pb-2 mb-2': isExpanded }]"
        >
            <span>{{ title }} ({{ items.length }})</span>
            
            <ChevronDownIcon
                class="w-4 h-4 transition-transform duration-300" 
                :class="[themeConfig.icon, isExpanded ? 'rotate-180' : '']" 
            />
        </div>

        <Transition
            enter-active-class="transition-all duration-300 ease-in-out overflow-hidden"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-active-class="transition-all duration-300 ease-in-out overflow-hidden"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
        >
            <ul v-show="isExpanded" class="text-[12px] text-slate-600 space-y-1.5 mt-1">
                <li v-for="(item, i) in items" :key="i" class="flex flex-col">
                    <span class="font-semibold">{{ item.primaryText }}</span>
                    <span v-if="item.secondaryText" class="text-slate-400 text-[10px] uppercase">{{ item.secondaryText }}</span>
                </li>
            </ul>
        </Transition>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

// Definiamo i dati che il componente si aspetta di ricevere
const props = defineProps<{
    title: string;
    items: { primaryText: string; secondaryText?: string }[]; // Formato pulito e agnostico
    theme?: 'red' | 'green';
    emptyMessage?: string;
}>();

// Stato interno per aprire/chiudere questa specifica card
const isExpanded = ref(false);

// Dizionario per i colori Tailwind basato sul tema scelto
const themeConfig = computed(() => {
    if (props.theme === 'green') {
        return {
            wrapperBorder: 'border-green-100',
            headerBorder: 'border-green-50',
            text: 'text-green-600',
            icon: 'text-green-500'
        };
    }
    // Default a Rosso
    return {
        wrapperBorder: 'border-red-100',
        headerBorder: 'border-red-50',
        text: 'text-red-800',
        icon: 'text-red-500'
    };
});
</script>