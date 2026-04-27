<template>
  <div class="h-screen flex flex-col font-sans">
    
    <!-- <header class="h-12 bg-blue-950 text-white flex justify-between items-center px-4 shrink-0 shadow-md z-20">
      
      <button 
        @click=""
        class="flex items-center gap-2 text-sm font-semibold text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Dashboard
      </button>

      <nav class="flex bg-blue-900/50 p-1 rounded-lg">
        <router-link 
          :to="`/match/${sessionId}/setup`" 
          class="px-4 py-1 text-sm font-semibold rounded-md transition-colors"
          active-class="bg-blue-600 text-white shadow-sm"
        >
          Distinta
        </router-link>
        
        <router-link 
          :to="`/match/${sessionId}/live`" 
          class="px-4 py-1 text-sm font-semibold rounded-md transition-colors"
          active-class="bg-blue-600 text-white shadow-sm"
        >
          Scoreboard
        </router-link>

        <router-link 
          :to="`/match/${sessionId}/events`" 
          class="px-4 py-1 text-sm font-semibold rounded-md transition-colors"
          active-class="bg-blue-600 text-white shadow-sm"
        >
          Eventi
        </router-link>

        <router-link 
          :to="`/match/${sessionId}/report`" 
          class="px-4 py-1 text-sm font-semibold rounded-md transition-colors"
          active-class="bg-blue-600 text-white shadow-sm"
        >
          Report
        </router-link>
        <router-link 
          :to="`/match/${sessionId}/report`" 
          class=" flex flex-row items-center gap-3 justify-center px-4 py-1 text-sm font-semibold rounded-md transition-colors"
          active-class="bg-blue-600 text-white shadow-sm"
        >
          <wrench-screwdriver-icon class="size-4"></wrench-screwdriver-icon>
          <div>Impostazioni</div>
        </router-link>
      </nav>

      <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
      <span>Live</span> 
    </header> -->

    <navbar-item />

    
    <div v-if="isLoading" class="flex items-center justify-center h-[80vh]">
      <div class="text-center space-y-4">
        <h2 class="text-2xl font-bold">Unione alla sessione...</h2>
        <p class="text-gray-600">Attendere mentre ti aggiungiamo alla sessione.</p>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </div>
    </div>

    <div v-else class="px-2 md:px-4 py-2 md:py-4 bg-white w-full min-h-full">
      <router-view />
    </div>

  </div>

  
</template>

<script setup lang="ts">
import NavbarItem from '@/components/NavbarItem.vue'
import { joinSession } from '@/services/sessionService'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { useSessionStateStore } from '@/stores/sessionStateStore'
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const sessionId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

const realtimeStore = useRealtimeStore()

onMounted(async () => {
  try {
    const res = await joinSession(sessionId);
    if (!res.ok) {
      throw new Error('Errore durante l’unione alla sessione.')
    }
    const sessionStateStore = useSessionStateStore();
    await sessionStateStore.joinSession(sessionId);
    realtimeStore.subscribeToMatch();
  } catch (err: any) {
    error.value = err.message || 'Errore sconosciuto'
  } finally {
    isLoading.value = false;
  }
})

onUnmounted(() => {
  realtimeStore.unsubscribe();
})
</script>
