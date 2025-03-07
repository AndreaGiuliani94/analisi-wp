<template>
  <NavbarItem />
  <div class="px-2 md:px-8 py-2 md:py-4 bg-white w-full min-h-full">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import NavbarItem from './components/NavbarItem.vue';

</script>
