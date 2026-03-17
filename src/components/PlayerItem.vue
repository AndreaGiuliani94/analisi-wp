<template>
  <div :class="[
    player.active ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-400',
  ]"
    class="p-2 w-1/5 transition-colors duration-300 flex justify-start items-center border border-gray-300 rounded-lg font- select-none"
    @click.stop="handleClick(team.name == settings.homeTeamName ? 0 : 1)" 
    @mousedown="startHold" 
    @mouseup="stopHold" 
    @touchstart.passive="startHold" 
    @touchend="stopHold"
    @touchcancel="stopHold"
    @touchmove="stopHold"
    >
    <template v-if="isEditing">
      <input v-model="editableName" class="bg-transparent border-none outline-none w-full flex-1 min-w-0"
        @blur="saveEdit(team.name == settings.homeTeamName ? 0 : 1)" 
        @keyup.enter="saveEdit(team.name == settings.homeTeamName ? 0 : 1)"
        ref="inputField" />
    </template>
    <template v-else>
      <span class="truncate flex-1 min-w-0">
        {{ player.number }}. {{ player.name }}
      </span>
    </template>

    <div class="flex items-center gap-1.5 ml-auto shrink-0">
      <div 
        v-if="player.isGK" 
        class="px-1.5 py-0.5 border rounded-2xl text-xs  transition-all duration-300"
        :class="[player.active ? 'bg-white border-white text-red-700' : '']"
      >
        GK
      </div>

      <ExclamationTriangleIcon 
        v-if="store.isOut(player)"
        class="size-4 text-red-500 animate-pulse" 
      />
    </div>
  </div>

  <div v-if="team.activatedTimer"
    class="font-medium ml-1 w-1/12 text-blue-950">{{ player.active ? '🕒' :
      '⏳'
    }}{{
      store.formatTime(player.actualTime) }}
  </div>

  <div v-if="settings.enableExclution" class="inline-flex items-start ml-2 gap-1 " role="group">
    <ExclutionButton 
      :disabled="userRole === 'viewer'"
      :team="team.name == settings.homeTeamName ? 0 : 1"
      :exclution-state="getExclutionState(0)"
      @handleExclution="addExclution($event, 0)"
      @remove="removeExclution(0)" />
    <ExclutionButton 
      :disabled="userRole === 'viewer'"
      :team="team.name == settings.homeTeamName ? 0 : 1"
      :exclution-state="getExclutionState(1)"
      @handleExclution="addExclution($event, 1)"
      @remove="removeExclution(1)" />
    <ExclutionButton 
      :disabled="userRole === 'viewer'"
      :team="team.name == settings.homeTeamName ? 0 : 1"
      :exclution-state="getExclutionState(2)"
      @handleExclution="addExclution($event, 2)" 
      @remove="removeExclution(2)" />
  </div>

  <template v-if="settings.enableShoot">
    <div class="inline-flex items-start ml-2 gap-1 text-blue-950" role="group">
      <div class="h-6 w-8 flex items-center justify-end">PARI</div>
      <ShotButton 
        :disabled="!player.active || userRole === 'viewer'" 
        :type="ShotCategory.EVEN" 
        @handleShot="addShot"
        @remove-shot="removeShot"/>
      <div class="h-6 w-8 flex items-center"> {{ player.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsEven.length }}</div>
    </div>
    <div class="inline-flex items-start ml-2 gap-1 text-blue-950" role="group">
      <div class="h-6 w-8 flex items-center justify-end">SUP</div>
      <ShotButton 
        :disabled="!player.active || userRole === 'viewer'" 
        :type="ShotCategory.SUP" 
        :is-goal="false" 
        @handleShot="addShot"
        @remove-shot="removeShot"/>
      <div class="h-6 w-8 flex items-center"> {{ player.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsSup.length }}</div>
    </div>
    <div class="inline-flex items-start ml-2 gap-1 text-blue-950" role="group">
      <div class="h-6 w-8 flex items-center justify-end">RIG</div>
      <ShotButton 
        :disabled="!player.active || userRole === 'viewer'"
        :type="ShotCategory.PENALTY" 
        :is-goal="false" 
        @handleShot="addShot"
        @remove-shot="removeShot"/>
      <div class="h-6 w-8 flex items-center"> {{ player.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsPenalty.length }}</div>
    </div>
    <div class="inline-flex ml-2 text-blue-950" role="group">
      <div class="h-6 w-8 flex items-center font-bold text-base"> 
        <span v-if="player.isGK">
          {{ store.getAllSaves(player).saves + '/' + store.getAllSaves(player).shots }}
        </span>
        <span v-else>
          {{ store.getAllPlayerShots(player).goals + '/' + store.getAllPlayerShots(player).shots }}
        </span>
      </div>
    </div>

    <div class="h-6 w-6 flex justify-center items-center mr-2">
      <InformationCircleIcon class="size-6 text-blue-950" @click="openPlayerDetailModal"/>
    </div>

  </template>

  <PlayerDetailModal :isOpen="isPlayerDetailOpen" :player="player" :team="team"
          @close="isPlayerDetailOpen = false" />

</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/gameStore";
import { ref, nextTick, type PropType } from "vue";
import type { Player } from "@/components/Interfaces/Player";
import type { Team } from "./Interfaces/Team";
import ExclutionButton from "./buttons/ExclutionButton.vue";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import ShotButton from "./buttons/ShotButton.vue";
import { ShotCategory, ShotOutcome } from '@/enum/ShotDescription';
import { useSettingsStore } from "@/stores/settingsStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useUserRole } from "@/composables/useUserRole";
import PlayerDetailModal from "./modals/PlayerDetailModal.vue";

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

const store = useGameStore();
const settings = useSettingsStore();
const sessionStore = useSessionStore();
const holdTimeout = ref<NodeJS.Timeout | null>(null);
const isEditing = ref<boolean>(false);
const isPlayerDetailOpen = ref<boolean>(false);
const editableName = ref<string>(props.player.name);
const isHolding = ref<boolean>(false); // Flag per evitare interferenze con il click
const inputField = ref<HTMLInputElement | null>(null);
const { role: userRole } = useUserRole(sessionStore.currentSession.participants)

const startHold = () => {
  isHolding.value = false; // Reset del flag prima di iniziare
  holdTimeout.value = setTimeout(() => {
    isHolding.value = true; // Imposta il flag se la pressione dura abbastanza
    isEditing.value = true;
    nextTick(() => {
      inputField.value?.focus();
    });
  }, 1000); // 1.0s di pressione
};

const stopHold = () => {
  if (holdTimeout.value) {
    clearTimeout(holdTimeout.value);
    holdTimeout.value = null;
  }
  // Usiamo un piccolo delay per resettare isHolding, 
  // così handleClick ha il tempo di vedere che era TRUE e bloccarsi
  setTimeout(() => {
    isHolding.value = false;
  }, 200);
};

const handleClick = (team: number) => {
  console.log("Click triggerato! isEditing:", isEditing.value, "isHolding:", isHolding.value);
  if (userRole?.value === 'viewer') return;
  
  // Se stiamo editando o abbiamo appena finito una pressione lunga, NON triggheriamo il toggle
  if (isHolding.value || isEditing.value) {
    return;
  }

  store.toggleElement(props.player.number, team);
};

const saveEdit = (team: number) => {
  if(userRole && userRole.value !== 'viewer'){
    isEditing.value = false;
    isHolding.value = false;
    store.updatePlayerName(props.player.number, editableName.value, team);
  }
};

const addExclution = (payload : { type: string, position: string, ball: boolean, earnedBy: number}, exclNumber: number) => {
  store.addExclution(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), payload.type, payload.position, payload.ball, payload.earnedBy, exclNumber);
};

const addShot = (payload : { type: ShotCategory, position: string, outcome: ShotOutcome }) => {
  store.addShoot(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), payload.type, payload.position, payload.outcome)
};

const removeShot = (payload : { type: ShotCategory }) => {
  store.removeShot(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), payload.type)
};

const removeExclution = (exclNumber: number) => {
  store.removeExclution(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), exclNumber);
};

const getExclutionState = (index: number) => {
  if(props.player.exclutions[index]) {
    if(props.player.exclutions[index].type === 'EDCS'){
      return props.player.exclutions[index].type.toUpperCase().substring(0,2);
    }
    else {
      return props.player.exclutions[index].type.charAt(0) + '-' +  props.player.exclutions[index].position.charAt(0)
    }
  }
  return '';
}

const openPlayerDetailModal = () => {
  isPlayerDetailOpen.value = true;
}

</script>