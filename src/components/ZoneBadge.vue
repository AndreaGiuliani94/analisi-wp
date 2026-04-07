<template>
    <div class="flex flex-col items-center group cursor-default">
        <span class="text-[10px] font-bold text-blue-950 bg-white/80 px-1.5 rounded-sm mb-1 backdrop-blur-sm shadow-sm transition-opacity opacity-70 group-hover:opacity-100 whitespace-nowrap z-10">
            {{ name }}
        </span>
        
        <div class="relative w-12 h-12 flex items-center justify-center transition-transform">
            
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
                        highlight ? 'stroke-[4]' : 'stroke-[3]'
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
                <span 
                    class="font-mono text-xs font-black tabular-nums"
                    :class="total === 0 ? 'text-slate-400' : 'text-blue-950'"
                >
                    {{ goals }}/{{ total }}
                </span>
            </div>

            <div v-if="highlight && total > 0" class="absolute -inset-1 border-2 border-blue-300 rounded-full animate-pulse opacity-70"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    name: string;
    goals: number;
    total: number;
    highlight?: boolean; // Es. per evidenziare le Ripartenze
}>();

// Calcolo della Percentuale e dell'Offset per l'SVG
const strokeOffset = computed(() => {
    // Gestione caso zero tiri: loader vuoto (offset 100)
    if (props.total === 0) return 100;
    
    // Calcolo percentuale (0-100)
    const percentage = (props.goals / props.total) * 100;
    
    // L'offset decide quanto bordo NASCONDERE. 
    // Se la percentuale è 70%, dobbiamo nascondere il 30% del bordo.
    // Usiamo Math.max/min per sicurezza contro arrotondamenti strani.
    return Math.max(0, Math.min(100, 100 - percentage));
});
</script>
