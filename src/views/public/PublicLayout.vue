<script setup lang="ts">
import Footer from '@/components/public/Footer.vue';
import Navbar from '@/components/public/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-blue-950 flex flex-col">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>