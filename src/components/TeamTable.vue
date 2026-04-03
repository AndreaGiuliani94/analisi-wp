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
                    <tr class="border-b border-gray-200 hover:bg-slate-50 transition-colors cursor-pointer" @click="toggle(player.number)">
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
                        <td class="p-2 font-mono">{{ store.formatTime(player.activeTime) }}</td>
                        <td class="p-2 font-mono">{{ store.formatTime(player.benchTime) }}</td>
                        <td class="p-2 font-mono font-semibold">{{ player.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsEven.length }}</td>
                        <td class="p-2 font-mono font-semibold">{{ player.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsSup.length }}</td>
                        <td class="p-2 font-mono font-semibold">{{ player.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsPenalty.length }}</td>
                        <td class="p-2 font-mono font-black text-blue-900">{{ getAllShoots(player) }}</td>
                        
                        <td class="whitespace-normal wrap-break-word p-2 text-xs text-gray-500">
                            <div class="flex gap-1 flex-wrap">
                                <span v-for="(ex, i) in player.exclutions.slice(0, 3)" :key="i"
                                    class="bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded-md">
                                    {{ getExclution(ex) }}
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Riga espansa -->
                    <Transition name="fade">
                        <tr v-if="expandedRows.includes(player.number)" class="bg-blue-50">
                            <td colspan="9" class="p-0 border-b-2 border-blue-200">
                                <PlayerDetail :player="player" :get-exclution="getExclution" :align="'row'" :show-g-k-shots="true" :team="team" />
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
import type { Team } from './Interfaces/Team';
import type { Player } from './Interfaces/Player';
import { ref } from 'vue';
import PlayerDetail from './PlayerDetail.vue';
import { getExclution } from '@/utils/utils';

const store = useGameStore();

const props = defineProps<{
    team: Team;
    getAllShoots: (player: Player) => string;
}>();

const expandedRows = ref<number[]>([])

function toggle(playerNumber: number) {
  if (expandedRows.value.includes(playerNumber)) {
    expandedRows.value = expandedRows.value.filter(n => n !== playerNumber)
  } else {
    expandedRows.value.push(playerNumber)
  }
}

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