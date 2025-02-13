<template>
  <div class="absolute m-1.5">
    <button @click="store.resetTimers()"
      class="text-white bg-red-600 active:bg-red-800 active:outline-none active:ring-4 active:ring-red-300 font-medium rounded-full text-xs px-3 py-2 text-center me-2 mb-2 shadow-sm cursor-pointer">
      <font-awesome-icon :icon="['fas', 'refresh']" /> Reset
    </button>
  </div>
  <div class="container mx-auto px-2 md:px-8 py-2 md:py-4 bg-white shadow-md rounded-md">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useElementStore } from './stores/store';
const store = useElementStore();
</script>
