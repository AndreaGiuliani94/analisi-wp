<template>
  <div class="p-2 grid grid-cols-3">
    <div>
        <div class="font-semibold">
            Espulsioni
        </div>
        <div>
            Esterne: {{ getExclEsterne() + '/' + getExclutions().exclutions.length }}
        </div>
        <div>
            Ripartenze: {{ getExclRipertenza() + '/' + getExclutions().exclutions.length }}
        </div>
        <div>
            Centroboa: {{ getExclCentro() + '/' + getExclutions().exclutions.length }}
        </div>
    </div>
    <div>
        <div class="font-semibold">
            Rigori
        </div>
        <div>
            Esterne: {{ getPenEsterne() + '/' + getExclutions().penalties.length }}
        </div>
        <div>
            Ripartenze: {{ getPenRipertenza() + '/' + getExclutions().penalties.length }}
        </div>
        <div>
            Centroboa: {{ getPenCentro() + '/' + getExclutions().penalties.length }}
        </div>
    </div>
    <div>
        <div class="font-semibold">
            Totali
        </div>
        <div>
            Esterne: {{ (getExclEsterne() + getPenEsterne()) + '/' + (getExclutions().exclutions.length + getExclutions().penalties.length)  }}
        </div>
        <div>
            Ripartenze: {{ (getExclRipertenza() + getPenRipertenza()) + '/' + (getExclutions().exclutions.length + getExclutions().penalties.length)  }}
        </div>
        <div>
            Centroboa: {{ (getExclCentro() + getPenCentro()) + '/' + (getExclutions().exclutions.length + getExclutions().penalties.length)  }}
        </div>
        <div>
            Con palla: {{ getFoulsWith() + '/' + (getExclutions().exclutions.length + getExclutions().penalties.length)  }}
        </div>
        <div>
            Senza palla: {{ getFoulsWithout() + '/' + (getExclutions().exclutions.length + getExclutions().penalties.length)  }}
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

const getExclEsterne = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === 'ESPULSIONE' && excl.position.toUpperCase() === 'PERIMETRO' ).length
}

const getExclRipertenza = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === 'ESPULSIONE' && excl.position.toUpperCase() === 'RIPARTENZA' ).length
}

const getExclCentro = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === 'ESPULSIONE' && excl.position.toUpperCase() === 'CENTROBOA' ).length
}

const getPenEsterne = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === 'RIGORE' && excl.position.toUpperCase() === 'PERIMETRO' ).length
}

const getPenRipertenza = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === 'RIGORE' && excl.position.toUpperCase() === 'RIPARTENZA' ).length
}

const getPenCentro = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === 'RIGORE' && excl.position.toUpperCase() === 'CENTROBOA' ).length
}

const getFoulsWith = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() !== 'EDCS' && excl.ball ).length
}

const getFoulsWithout = () => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() !== 'EDCS' && !excl.ball  ).length
}

</script>