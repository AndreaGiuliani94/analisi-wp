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
                <tr v-for="element in team.players" :key="element.number" class="border border-gray-300">
                    <td class="text-center p-1.5">{{ element.number }}</td>
                    <td class="truncate p-1.5">{{ element.name }}</td>
                    <td class="p-1.5">{{ store.formatTime(element.activeTime) }}</td>
                    <td class="p-1.5">{{ store.formatTime(element.benchTime) }}</td>
                    <td class="p-1.5">{{ element.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsEven.length }}</td>
                    <td class="p-1.5">{{ element.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsSup.length }}</td>
                    <td class="p-1.5">{{ element.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + element.shotsPenalty.length }}</td>
                    <td class="p-1.5">{{ getAllShoots(element) }}</td>
                    <td class="whitespace-normal break-words p-1.5">
                        <div v-for="(ex, i) in element.exclutions.slice(0, 3)" :key="i">
                            {{ getExclution(ex) }}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';
import { useElementStore } from '../stores/gameStore';
import type { Team } from './Interfaces/Team';
import type { Exclution } from './Interfaces/Exclution';
import type { Player } from './Interfaces/Player';

const store = useElementStore();

const props = defineProps<{
  team: Team;
  getAllShoots: (player: Player) => string;
}>();

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