<template>
    <div class="mt-3 overflow-x-auto shadow-md rounded-lg">
        <table class="w-full text-sm text-left border-collapse rounded-lg table-fixed">
            <thead class="text-xs text-white uppercase bg-blue-950 rounded-lg">
                <tr>
                    <th scope="col" class="w-14 p-2 text-center"></th>
                    <th scope="col" class="w-36 p-2">Nome</th>
                    <th scope="col" class="w-20 p-2">Dentro</th>
                    <th scope="col" class="w-20 p-2">Fuori</th>
                    <th scope="col" class="w-16 p-2">Pari</th>
                    <th scope="col" class="w-16 p-2">Sup</th>
                    <th scope="col" class="w-16 p-2">Rigori</th>
                    <th scope="col" class="w-16 p-2">Totali</th>
                    <th scope="col" class="min-w-60 p-2">Falli</th>
                </tr>
            </thead>
            <tbody class="text-blue-950">
                <template v-for="player in team.players" :key="player.number">
                    <!-- Riga principale -->
                    <tr v-if="player.name" class="border-b border-gray-200 hover:bg-slate-50 transition-colors cursor-pointer" @click="toggle(player.number)">
                        <td class="p-2">
                            <div class="w-8 h-8 rounded-full border-2 border-slate-200 font-bold flex items-center justify-center shadow-sm relative"
                                    :class="player.isGK ? 'bg-red-800 text-white' : '' ">
                                {{ player.number }}
                            </div>
                        </td>
                        <td class="p-2 font-medium" :class="[expandedRows.includes(player.number) ? 'underline text-blue-700' : '']">
                            <span class="inline-flex items-center gap-1.5">
                                <svg
                                    :class="[
                                        'w-4 h-4 text-gray-400 transition-transform duration-300',
                                        expandedRows.includes(player.number) ? 'rotate-90' : ''
                                    ]"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                    >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                {{ player.name }}
                            </span>
                        </td>
                        <td class="p-2 font-mono">{{ formatTime(player.activeTime) }}</td>
                        <td class="p-2 font-mono">{{ formatTime(player.benchTime) }}</td>
                        <td class="p-2 font-mono font-semibold">{{ getShotStats(player.id, 'even') }}</td>
                        <td class="p-2 font-mono font-semibold">{{ getShotStats(player.id, 'sup') }}</td>
                        <td class="p-2 font-mono font-semibold">{{ getShotStats(player.id, 'penalty') }}</td>
                        <td class="p-2 font-mono font-bold">{{ getTotalShotStats(player.id) }}</td>

                        <td class="p-2">
                            <div class="flex gap-1" v-if="gameStore.getPlayerFouls(player.id).length > 0">
                                <FoulBadge
                                    v-for="foul in gameStore.getPlayerFouls(player.id)" 
                                    :key="foul.id" 
                                    :event="foul"
                                    :text="getExclution(foul)" 
                                />
                            </div>
                        </td>
                    </tr>

                    <!-- Riga espansa -->
                    <Transition name="fade">
                        <tr v-if="expandedRows.includes(player.number)" class="bg-blue-50">
                            <td colspan="9" class="p-0 border-b-2 border-blue-200">
                                <PlayerDetail :player="player" :get-exclution="getExclution" :align="'row'" :show-g-k-shots="true" :team="team" :is-modal="false" />
                            </td>
                        </tr>
                    </Transition>

                </template>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">

import { useGameStore } from '../stores/gameStore';
import type { Team } from '../interfaces/Team';
import { ref } from 'vue';
import PlayerDetail from './PlayerDetail.vue';
import { formatTime, getExclution } from '@/utils/utils';
import { ShotOutcome } from '@/enum/ShotDescription';
import FoulBadge from './badges/FoulBadge.vue';

const gameStore = useGameStore();

const props = defineProps<{
    team: Team;
}>();

const expandedRows = ref<number[]>([])

function toggle(playerNumber: number) {
  if (expandedRows.value.includes(playerNumber)) {
    expandedRows.value = expandedRows.value.filter(n => n !== playerNumber)
  } else {
    expandedRows.value.push(playerNumber)
  }
}

/**
 * Interroga lo store e formatta la stringa "Gol / Tiri" per la categoria richiesta
 */
const getShotStats = (playerId: string | undefined, category: 'even' | 'sup' | 'penalty') => {
    if (!playerId) return "0/0";
    
    // Recuperiamo i tiri tramite il Getter
    const shots = gameStore.getPlayerShotsByCategory(playerId)[category] || [];
    
    // Contiamo quanti di questi tiri hanno avuto esito GOAL
    const goals = shots.filter(s => s.shotOutcome === ShotOutcome.GOAL).length;
    
    return `${goals}/${shots.length}`;
};

/**
 * Unisce tutte le categorie per fare il totale
 */
const getTotalShotStats = (playerId: string | undefined) => {
    if (!playerId) return "0/0";

    const categorizedShots = gameStore.getPlayerShotsByCategory(playerId);
    
    // Appiattiamo gli array in un unico listone di tiri
    const allShots = [
        ...(categorizedShots.even || []), 
        ...(categorizedShots.sup || []), 
        ...(categorizedShots.penalty || [])
    ];
    
    const goals = allShots.filter(s => s.shotOutcome === ShotOutcome.GOAL).length;
    
    return `${goals}/${allShots.length}`;
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease-in;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>