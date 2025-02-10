<template>
  <div class="container">
    <div>
      <button @click="store.resetTimers()" class="reset-button">Reset</button>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useElementStore } from './stores/store';
const store = useElementStore();
</script>
