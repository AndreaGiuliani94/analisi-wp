<template>
    <div class="mt-3 overflow-x-auto shadow-md rounded-lg">
        <table class="w-full text-sm text-left border-collapse rounded-lg table-fixed">
            <thead class="text-xs text-white uppercase bg-blue-950 rounded-lg">
                <tr>
                    <th scope="col" class="w-10 p-1.5"></th>
                    <th scope="col" class="w-36 p-1.5">Nome</th>
                    <th scope="col" class="w-20 p-1.5">Dentro</th>
                    <th scope="col" class="w-20 p-1.5">Fuori</th>
                    <th scope="col" class="w-16 p-1.5">Pari</th>
                    <th scope="col" class="w-16 p-1.5">Sup</th>
                    <th scope="col" class="w-16 p-1.5">Rigori</th>
                    <th scope="col" class="w-16 p-1.5">Totali</th>
                    <th scope="col" class="min-w-60 p-1.5">Falli</th>
                </tr>
            </thead>
            <tbody class="text-blue-950">

                <template v-for="player in team.players" :key="player.number">
                    <!-- Riga principale -->
                    <tr class="border border-gray-300">
                        <td class="text-center p-1.5">{{ player.number }}</td>
                        <td @click="toggle(player.number)" class="p-1.5" :class="[expandedRows.includes(player.number) ? 'underline' : '']">
                            <span class="inline-flex items-center">
                                <svg
                                    :class="[
                                        'w-4 h-4 transition-transform duration-300',
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
                        <td class="p-1.5">{{ store.formatTime(player.activeTime) }}</td>
                        <td class="p-1.5">{{ store.formatTime(player.benchTime) }}</td>
                        <td class="p-1.5">{{ player.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsEven.length }}</td>
                        <td class="p-1.5">{{ player.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsSup.length }}</td>
                        <td class="p-1.5">{{ player.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsPenalty.length }}</td>
                        <td class="p-1.5">{{ getAllShoots(player) }}</td>
                        <td class="whitespace-normal break-words p-1.5">
                            <div v-for="(ex, i) in player.exclutions.slice(0, 3)" :key="i">
                                {{ getExclution(ex) }}
                            </div>
                        </td>
                    </tr>

                    <!-- Riga espansa -->
                    <Transition name="fade">
                    <tr v-if="expandedRows.includes(player.number)" class="bg-blue-50">
                        <PlayerDetail :player="player" :get-exclution="getExclution"></PlayerDetail>
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
import type { Exclution } from './Interfaces/Exclution';
import type { Player } from './Interfaces/Player';
import { ref } from 'vue';
import PlayerDetail from './PlayerDetail.vue';

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

const getExclution = (exclution: Exclution) => {
    var str: string = '';
    str += exclution.quarter + 'T ' + exclution.time + ' ' + (exclution.type + ' ' + exclution.position);
    if(exclution.type !== 'EDCS') {
        str += ' ';
        str += exclution.ball ? 'Con palla' : 'Senza palla';
    }
    return str;
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