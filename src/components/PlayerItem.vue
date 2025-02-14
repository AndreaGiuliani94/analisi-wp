<template>
  <div :class="[
    player.active ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-400',
  ]"
    class="p-2 w-5/11 transition-colors flex justify-start items-center border border-gray-300 rounded-lg text-sm md:text-regular font-medium"
    @click="handleClick" @mousedown="startHold" @mouseup="stopHold" @mouseleave="stopHold">
    <template v-if="isEditing">
      <input v-model="editableName" class="bg-transparent border-none outline-none w-full" @blur="saveEdit"
        @keyup.enter="saveEdit" ref="inputField" />
    </template>
    <template v-else>
      <span class="truncate">
        {{ player.number }}. {{ player.name }}
      </span>
    </template>
    <font-awesome-icon v-if="player.exclutions == 3" :icon="['fas', 'triangle-exclamation']" class="inline-flex ml-auto text-red-600" />
  </div>
  <div class="text-sm md:text-regular font-medium ml-1">{{ player.active ? '🕒' : '⏳' }}{{
    store.formatTime(player.actualTime) }}
  </div>
  <div class="inline-flex rounded-md ml-auto h-full" role="group">
    <button @click="store.addShoot(player.number)" :disabled="!player.active"
      class="px-3 py-2 text-sm font-medium text-white bg-blue-400 border border-gray-200 active:bg-blue-700 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200">S</button>
    <button @click="store.addGoal(player.number)" :disabled="!player.active"
      class="px-3 py-2 text-sm font-medium text-white bg-blue-400 border-t border-b border-gray-200  active:bg-blue-700 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200">G</button>
    <button @click="store.addExclution(player.number)" :disabled="!player.active || player.exclutions >= 3"
      class="px-3 py-2 text-sm font-medium text-white bg-blue-400 border border-gray-200 rounded-e-lg active:bg-blue-700 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-200">E</button>
  </div>
</template>

<script lang="ts">
import { useElementStore } from "@/stores/store.ts";
import { ref, nextTick, type PropType } from "vue";
import type { Player } from "@/components/Interfaces/Player";

export default {
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  setup(props) {
    const store = useElementStore();
    const holdTimeout = ref<NodeJS.Timeout | null>(null);
    const isEditing = ref<boolean>(false);
    const editableName = ref<string>(props.player.name);
    const isHolding = ref<boolean>(false); // Flag per evitare interferenze con il click
    const inputField = ref<HTMLInputElement | null>(null);

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

    const handleClick = () => {
      if (!isHolding.value && !isEditing.value) {
        store.toggleElement(props.player.number);
      }
    };

    const saveEdit = () => {
      isEditing.value = false;
      store.updatePlayerName(props.player.number, editableName.value);
    };

    return {
      store,
      startHold,
      stopHold,
      handleClick,
      saveEdit,
      isEditing,
      editableName,
      inputField,
    };
  },
};
</script>