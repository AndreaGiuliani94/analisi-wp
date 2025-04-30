<template>
  <div :class="[
    player.active || (team.name == 'AWAY' && !store.opponentsTimerActivated) ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-400',
  ]"
    class="p-2 w-1/5 transition-colors flex justify-start items-center border border-gray-300 rounded-lg text-sm md:text-regular font-medium"
    @click="handleClick(team.name == 'HOME' ? 0 : 1)" @mousedown="startHold" @mouseup="stopHold" @mouseleave="stopHold">
    <template v-if="isEditing">
      <input v-model="editableName" class="bg-transparent border-none outline-none w-full"
        @blur="saveEdit(team.name == 'HOME' ? 0 : 1)" @keyup.enter="saveEdit(team.name == 'HOME' ? 0 : 1)"
        ref="inputField" />
    </template>
    <template v-else>
      <span class="truncate">
        {{ player.number }}. {{ player.name }}
      </span>
    </template>
    <ExclamationTriangleIcon v-if="player.exclutions.length == 3"
      class="inline-flex ml-auto size-3 text-red-600" />
  </div>

  <div v-if="team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
    class="text-sm md:text-regular font-medium ml-1 w-1/12">{{ player.active ? '🕒' :
      '⏳'
    }}{{
      store.formatTime(player.actualTime) }}
  </div>

  <div class="inline-flex items-start ml-2 gap-1 " role="group">
    <ExclutionButton 
      :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
      :exclution-state="(player.exclutions[0] ? player.exclutions[0].type.charAt(0) + '-' +  player.exclutions[0].position.charAt(0) : '')"
      @handleExclution="addExclution"/>
    <ExclutionButton 
      :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
      :exclution-state="(player.exclutions[1] ? player.exclutions[1].type.charAt(0) + '-' +  player.exclutions[1].position.charAt(0) : '')"
      @handleExclution="addExclution"/>
    <ExclutionButton 
      :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
      :exclution-state="(player.exclutions[2] ? player.exclutions[2].type.charAt(0) + '-' +  player.exclutions[2].position.charAt(0) : '')"
      @handleExclution="addExclution"/>
  </div>

  <div class="inline-flex items-start ml-2 gap-1 " role="group">
    <ShotButton 
      :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)" 
      :type="'EVEN'" :is-goal="true" @handleShot="addShot"/>
    <ShotButton :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)" 
      :type="'EVEN'" :is-goal="false" @handleShot="addShot"/>
    <div class="rounded-md"> {{ player.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsEven.length }}</div>
  </div>
  <div class="inline-flex items-start ml-2 gap-1 " role="group">
    <ShotButton :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)" 
      :type="'SUP'" :is-goal="true" @handleShot="addShot"/>
    <ShotButton :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)" 
      :type="'SUP'" :is-goal="false" @handleShot="addShot"/>
    <div class="rounded-md"> {{ player.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsSup.length }}</div>
  </div>
  <div class="inline-flex items-start ml-2 gap-1 " role="group">
    <ShotButton :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)" 
      :type="'PENALTY'" :is-goal="true" @handleShot="addShot"/>
    <ShotButton :disabled="(!player.active || player.exclutions.length >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)" 
      :type="'PENALTY'" :is-goal="false" @handleShot="addShot"/>
    <div class="rounded-md"> {{ player.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsPenalty.length }}</div>
  </div>
  <div class="inline-flex ml-3 mr-2" role="group">
    <div class="rounded-md"> {{ getAllShots().goals + '/' + getAllShots().shots }}</div>
  </div>

  <!-- <div class="inline-flex rounded-md ml-auto h-full" role="group">
    <button @click="store.addShoot(player.number, (team.name == 'HOME' ? 0 : 1))"
      :disabled="(!player.active || player.exclutions >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
      class="px-3 py-2 text-sm font-medium text-white bg-sky-500 border border-gray-200 active:bg-sky-800 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200">S</button>
    <button @click="store.addGoal(player.number, (team.name == 'HOME' ? 0 : 1))"
      :disabled="(!player.active || player.exclutions >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
      class="px-3 py-2 text-sm font-medium text-white bg-sky-500 border-t border-b border-gray-200  active:bg-sky-800 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200">G</button>
    <button @click="store.addExclution(player.number, (team.name == 'HOME' ? 0 : 1))"
      :disabled="(!player.active || player.exclutions >= 3) && team.name == 'HOME' || (team.name == 'AWAY' && store.opponentsTimerActivated)"
      class="px-3 py-2 text-sm font-medium text-white bg-sky-500 border border-gray-200 rounded-e-lg active:bg-sky-800 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200">E</button>
  </div> -->
</template>

<script setup lang="ts">
import { useElementStore } from "@/stores/gameStore";
import { ref, nextTick, type PropType } from "vue";
import type { Player } from "@/components/Interfaces/Player";
import type { Team } from "./Interfaces/Team";
import ExclutionButton from "./buttons/ExclutionButton.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import ShotButton from "./buttons/ShotButton.vue";

const props = defineProps({
  player: {
    type: Object as PropType<Player>,
    required: true,
  },
  team: {
    type: Object as PropType<Team>,
    required: true,
  },
});

const store = useElementStore();
const holdTimeout = ref<NodeJS.Timeout | null>(null);
const isEditing = ref<boolean>(false);
const editableName = ref<string>(props.player.name);
const isHolding = ref<boolean>(false); // Flag per evitare interferenze con il click
const inputField = ref<HTMLInputElement | null>(null);

const getAllShots = () => {
  var totalShots = [];
  totalShots.push(...props.player.shotsEven, ...props.player.shotsSup, ...props.player.shotsPenalty)
  var totalGoals = totalShots.filter(shot => shot.outcome.toUpperCase() === 'GOAL' )
  return {
    goals: totalGoals.length,
    shots: totalShots.length
  }
}

const startHold = () => {
  isHolding.value = false; // Reset del flag prima di iniziare
  holdTimeout.value = setTimeout(() => {
    isHolding.value = true; // Imposta il flag se la pressione dura abbastanza
    isEditing.value = true;
    nextTick(() => {
      inputField.value?.focus();
    });
  }, 1500); // 1.5s di pressione
};

const stopHold = () => {
  if (holdTimeout.value) {
    clearTimeout(holdTimeout.value);
  }
};

const handleClick = (team: number) => {
  if (!isHolding.value && !isEditing.value) {
    store.toggleElement(props.player.number, team);
  }
};

const saveEdit = (team: number) => {
  isEditing.value = false;
  store.updatePlayerName(props.player.number, editableName.value, team);
};

const addExclution = (payload : { type: string, position: string}) => {
  store.addExclution(props.player.number, (props.team.name == 'HOME' ? 0 : 1), payload.type, payload.position);
}

const addShot = (payload : { type: string, position: string, outcome: string }) => {
  store.addShoot(props.player.number, (props.team.name == 'HOME' ? 0 : 1), payload.type, payload.position, payload.outcome)
}

</script>