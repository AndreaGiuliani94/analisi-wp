<template>
  <div class="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
    <!-- Stato di Caricamento -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"></div>
      <p class="text-blue-950 font-bold animate-pulse">Ricerca dirette in corso...</p>
    </div>

    <!-- Errore / Club non trovato -->
    <div v-else-if="!clubData" class="text-center py-12">
      <h2 class="text-2xl font-bold text-blue-950">Club non trovato</h2>
      <p class="text-gray-500 mt-2">Verifica l'URL o riprova più tardi.</p>
    </div>

    <!-- Main Live Hub -->
    <div v-else class="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
      <!-- Header Section -->
      <div class="bg-linear-to-br from-blue-900 to-blue-950 p-10 flex flex-col items-center text-center text-white relative">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 0 L100 0 L100 100 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div class="w-32 h-32 bg-white rounded-3xl p-4 mb-6 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <img 
            v-if="clubData.club.logo_url" 
            :src="clubData.club.logo_url" 
            :alt="clubData.club.name" 
            class="max-w-full max-h-full object-contain" 
          />
          <BuildingOffice2Icon v-else class="size-16 text-blue-900" />
        </div>
        
        <h1 class="text-3xl font-black tracking-tight uppercase mb-1">{{ clubData.club.name }}</h1>
        <div class="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full border border-white/20 backdrop-blur-sm">
          <SignalIcon class="size-4 text-red-500 animate-pulse" />
          <span class="text-xs font-black tracking-[0.2em] uppercase">Live Hub</span>
        </div>
      </div>

      <!-- Elenco Partite -->
      <div class="p-6 bg-slate-50/50">
        <div v-if="clubData.matches && clubData.matches.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="match in clubData.matches" :key="match.id" 
               class="relative p-4 rounded-4xl border border-slate-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 group flex flex-col gap-4">
            
            <!-- Card Header: Categoria e Stato -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 text-[10px]">
                    <span class="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-black uppercase tracking-widest border border-blue-100">
                      {{ match.home_team?.category }}
                    </span>
                    <div class="font-bold text-slate-400 uppercase text-center truncate">
                      {{ match.session.title }}
                  </div>
                    <span v-if="match.scheduled_at" class="font-bold text-slate-400">
                      {{ formatDateTime(match.scheduled_at) }}
                    </span>
                </div>
                <MatchStatusBadge :status="match.status" :isLive="match.is_public_live" :size="'sm'" />
            </div>

            <!-- Card Body: Matchup -->
            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-center gap-4">
                <div class="flex-1 text-right font-black text-blue-950 text-lg md:text-xl uppercase truncate">
                    {{ match.home_team?.club_name }}
                </div>
                <div class="shrink-0 flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black border border-slate-200 group-hover:bg-blue-950 group-hover:text-white group-hover:border-blue-950 transition-colors duration-300">
                    VS
                </div>
                <div class="flex-1 text-left font-black text-blue-950 text-lg md:text-xl uppercase truncate">
                    {{ match.away_team?.club_name }}
                </div>
                </div>
            </div>

            <!-- Card Footer: Azione -->
            <div class="mt-auto">
                <ActionButton 
                  label="Vai alla Diretta" 
                  color="blue"
                  :icon="PlayIcon"
                  class="rounded-2xl"
                  @click="goToMatch(match.session.id)"
                />
            </div>
          </div>
        </div>

        <!-- Nessuna Diretta -->
        <div v-else class="py-16 flex flex-col items-center text-center">
          <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
            <VideoCameraSlashIcon class="size-10 text-slate-300" />
          </div>
          <h3 class="text-2xl font-black text-blue-950">Nessuna diretta</h3>
          <p class="text-slate-500 mt-2 max-w-xs mx-auto">
            Al momento non ci sono partite in corso trasmesse da questo club. Torna a trovarci presto!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BuildingOffice2Icon, SignalIcon, VideoCameraSlashIcon, ChevronRightIcon, PlayCircleIcon, PlayIcon } from '@heroicons/vue/24/outline';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { getClubLiveMatches } from '@/services/publicService';
import { useAuthStore } from '@/stores/authStore';
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue';
import type { MatchStatus } from '@/enum/MatchStatus';
import { formatDateTime } from '@/utils/utils';

interface PublicClubData {
  id: string;
  name: string;
  logo_url: string;
}

interface PublicMatchData {
  id: string;
  status: MatchStatus;
  is_public_live: boolean;
  scheduled_at: string;
  session: {
    id: string,
    title: string
  }
  home_team: {
    id: string;
    club_name: string;
    category: string;
  };
  away_team: {
    id: string;
    club_name: string;
    category: string;
  };
}

interface PublicData {
  club: PublicClubData,
  matches: PublicMatchData[]
}

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;

const loading = ref(true);
const clubData = ref<PublicData | null>(null);

const fetchClubLiveMatches = async () => {
  
  try {
    const response = await getClubLiveMatches(slug)
    if (response.ok) {
      clubData.value = await response.json() as PublicData;
    }
  } catch (error) {
    console.error("Errore nel caricamento delle partite live:", error);
  } finally {
    loading.value = false;
  }
};

const goToMatch = (sessionId: string) => {
  router.push(`/live/${slug}/match/${sessionId}`);
};

onMounted(() => {
  fetchClubLiveMatches();
});
</script>
