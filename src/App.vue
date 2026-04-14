<template>
  <NavbarItem />
  <div class="px-2 md:px-4 py-2 md:py-4 bg-white w-full min-h-full">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NavbarItem from './components/NavbarItem.vue';
import { useGameStore } from './stores/gameStore';
import { useSessionStateStore } from './stores/sessionStateStore';

const sessionStateStore = useSessionStateStore()
const gameStore = useGameStore();

onMounted(() => {
  // Avviamo il motore di auto-salvataggio appena l'app si carica
  gameStore.enableAutoSave();
});

if (sessionStateStore.sessionId) {
  // sessionStateStore.subscribe() // riapre il canale se c’è sessionId TODO: SISTEMARE CON NUOVA STRUTTURA
}

</script>
