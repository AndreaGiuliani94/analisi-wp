<template>
    <div class="p-2 grid grid-cols-3">
        <div>
            <div class="font-semibold">
                Espulsioni: {{ getExclutions().exclutions.length }}
            </div>
            <div>
                Esterne: {{ getFouls('ESPULSIONE', 'PERIMETRO') }}
            </div>
            <div>
                Ripartenze: {{ getFouls('ESPULSIONE', 'RIPARTENZA') }}
            </div>
            <div>
                Centroboa: {{ getFouls('ESPULSIONE', 'CENTROBOA') }}
            </div>
            <div>
                Con palla: {{ getFoulsWith('ESPULSIONE') }}
            </div>
            <div>
                Senza palla: {{ getFoulsWithout('ESPULSIONE') }}
            </div>
        </div>
        <div>
            <div class="font-semibold">
                Rigori: {{ getExclutions().penalties.length }}
            </div>
            <div>
                Esterne: {{ getFouls('RIGORE', 'PERIMETRO') }}
            </div>
            <div>
                Ripartenze: {{ getFouls('RIGORE', 'RIPARTENZA') }}
            </div>
            <div>
                Centroboa: {{ getFouls('RIGORE', 'CENTROBOA') }}
            </div>
            <div>
                Con palla: {{ getFoulsWith('RIGORE') }}
            </div>
            <div>
                Senza palla: {{ getFoulsWithout('RIGORE') }}
            </div>
        </div>
        <div>
            <div class="font-semibold">
                Totali: {{ (getExclutions().exclutions.length + getExclutions().penalties.length) }}
            </div>
            <div>
                Esterne: {{ (getFouls('ESPULSIONE', 'PERIMETRO') + getFouls('RIGORE', 'PERIMETRO')) }}
            </div>
            <div>
                Ripartenze: {{ (getFouls('ESPULSIONE', 'RIPARTENZA') + getFouls('RIGORE', 'RIPARTENZA')) }}
            </div>
            <div>
                Centroboa: {{ (getFouls('ESPULSIONE', 'CENTROBOA') + getFouls('RIGORE', 'CENTROBOA')) }}
            </div>
            <div>
                Con palla: {{ getFoulsWith('') }}
            </div>
            <div>
                Senza palla: {{ getFoulsWithout('') }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Team } from '../Interfaces/Team';
import type { Exclution } from '../Interfaces/Exclution';
import type { PropType } from 'vue';

const props = defineProps({
    team: {
        type: Object as PropType<Team>,
        required: true,
    }
});

const getAllFouls = () => {
    var allFouls: Exclution[] = [];
    props.team.players.forEach(pl => allFouls.push(...pl.exclutions));
    return allFouls;
}

const getExclutions = () => {
    return {
        exclutions: getAllFouls().filter(excl => excl.type.toUpperCase() === 'ESPULSIONE' ),
        penalties: getAllFouls().filter(excl => excl.type.toUpperCase() === 'RIGORE' )
      }
}

const getFouls = (type: string, position: string) => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === type.toUpperCase() && excl.position.toUpperCase() === position.toUpperCase() ).length
}

const getFoulsWith = (type: string) => {
    switch(type.toUpperCase()) {
        case 'ESPULSIONE':
            return getAllFouls().filter(excl => excl.type.toUpperCase() === 'ESPULSIONE' && excl.ball ).length;
        case 'RIGORE':
            return getAllFouls().filter(excl => excl.type.toUpperCase() === 'RIGORE' && excl.ball ).length;
        default:
            return getAllFouls().filter(excl => excl.type.toUpperCase() !== 'EDCS' && excl.ball ).length
    }
}

const getFoulsWithout = (type: string) => {
    switch(type.toUpperCase()) {
        case 'ESPULSIONE':
            return getAllFouls().filter(excl => excl.type.toUpperCase() === 'ESPULSIONE' && !excl.ball ).length;
        case 'RIGORE':
            return getAllFouls().filter(excl => excl.type.toUpperCase() === 'RIGORE' && !excl.ball ).length;
        default:
            return getAllFouls().filter(excl => excl.type.toUpperCase() !== 'EDCS' && !excl.ball ).length
    }
}

</script>