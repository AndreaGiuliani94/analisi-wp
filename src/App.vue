<template>
  <div class="px-2 md:px-8 py-2 md:py-4 bg-white shadow-xl rounded-md">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useElementStore } from './stores/store';
const store = useElementStore();
</script>
