<template>
  <nav class="flex justify-between items-center p-4  mx-auto w-full">
    <router-link to="/" class="text-2xl font-black tracking-tighter text-blue-900">
      <!-- <img src="/img/icons/logo.png" class="w-10 h-10 inline-block mr-2" alt="Logo WP Studio" /> -->
      WP STUDIO
    </router-link>
    <AuthActionButton />
  </nav>
</template>

<script setup lang="ts">
import AuthActionButton from '@/components/buttons/AuthActionButton.vue';
</script>