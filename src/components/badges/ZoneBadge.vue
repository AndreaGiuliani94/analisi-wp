<template>
    <div class="relative flex flex-col items-center group" :class="isPopoverOpen ? 'z-50' : 'z-10'">
        
        <span class="text-[10px] font-bold text-blue-950 bg-white/80 px-1.5 rounded-sm mb-1 backdrop-blur-sm shadow-sm transition-opacity opacity-70 group-hover:opacity-100 whitespace-nowrap z-10">
            {{ name }}
        </span>
        
        <div 
            @click="isPopoverOpen = true"
            class="relative w-12 h-12 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
        >
            <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90 transform">
                <circle 
                    class="text-slate-200"
                    stroke-width="3"
                    stroke="currentColor"
                    fill="#f8fafc"
                    cx="18"
                    cy="18"
                    r="15.9155" 
                />
                
                <circle 
                    class="transition-all duration-500 ease-out"
                    :class="[
                        total === 0 ? 'text-slate-300' : 'text-emerald-500',
                        highlight ? 'stroke-4' : 'stroke-3'
                    ]"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    stroke-dasharray="100 100"
                    :stroke-dashoffset="strokeOffset"
                />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="font-mono text-xs font-black tabular-nums" :class="total === 0 ? 'text-slate-400' : 'text-blue-950'">
                    {{ goals }}/{{ total }}
                </span>
            </div>
        </div>

        <div v-if="isPopoverOpen" class="fixed inset-0 z-40" @click.stop="isPopoverOpen = false"></div>

        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
        >
            <div v-if="isPopoverOpen" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-white/95 backdrop-blur-md shadow-xl rounded-lg border border-slate-200 p-2.5 z-50 cursor-default">
                
                <div class="flex flex-col gap-0.5 text-[11px]">
                    <div class="flex justify-between items-center" :class="goals > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'">
                        <span>Goal</span> <span class="font-mono">{{ goals }}</span>
                    </div>
                    <div class="flex justify-between items-center" :class="saved > 0 ? 'text-blue-950 font-semibold' : 'text-slate-400'">
                        <span>Parati</span> <span class="font-mono">{{ saved }}</span>
                    </div>
                    <div class="flex justify-between items-center" :class="missed > 0 ? 'text-blue-950 font-semibold' : 'text-slate-400'">
                        <span>Fuori / Pali</span> <span class="font-mono">{{ missed }}</span>
                    </div>
                    <div class="flex justify-between items-center" :class="blocked > 0 ? 'text-blue-950 font-semibold' : 'text-slate-400'">
                        <span>Stoppati</span> <span class="font-mono">{{ blocked }}</span>
                    </div>
                </div>

                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    name: string;
    goals: number;
    saved: number;
    missed: number;
    blocked: number;
    highlight?: boolean; // Es. per evidenziare le Ripartenze
}>();

// Gestione dell'apertura
const isPopoverOpen = ref(false);

// Il totale si calcola in automatico dalla somma delle props!
const total = computed(() => props.goals + props.saved + props.missed + props.blocked);

// Calcolo della Percentuale e dell'Offset per l'SVG
const strokeOffset = computed(() => {
    // Gestione caso zero tiri: loader vuoto (offset 100)
    if (total.value === 0) return 100;
    
    // Calcolo percentuale (0-100)
    const percentage = (props.goals / total.value) * 100;
    
    // L'offset decide quanto bordo NASCONDERE. 
    // Se la percentuale è 70%, dobbiamo nascondere il 30% del bordo.
    // Usiamo Math.max/min per sicurezza contro arrotondamenti strani.
    return Math.max(0, Math.min(100, 100 - percentage));
});
</script>
