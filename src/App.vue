<template>
  <Analytics />
  <!-- <div class="px-2 md:px-4 py-2 md:py-4 bg-white w-full min-h-full"> -->
    <router-view></router-view>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { Analytics } from "@vercel/analytics/vue";

</script>
