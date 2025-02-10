<template>
  <h1>Distinta</h1>
  <div class="match">
    <input v-model="store.match.name" id="match-id" class="match-input" placeholder="Match"
      @input="store.updateMatch(store.match.name)" />
  </div>
  <div class="lineup">
    <div v-for="player in store.players" :key="player.number" class="player">
      <div class="player-number">
        {{ player.number }}.
      </div>
      <input v-model="player.name" @input="store.updateElementName(player.number, player.name)" class="name-input" />
    </div>
  </div>
  <div class="lineup-button-box">
    <button @click="$router.push('/game')">Vai al Live</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();
onMounted(() => {
  store.loadStore();
});
</script>
