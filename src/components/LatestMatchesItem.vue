<template>
  <div class="w-full">
    <div v-if="loading" class="text-center py-4">
      <p class="text-sm text-gray-500">Caricamento ultime partite...</p>
    </div>
    
    <div v-else-if="matches.length > 0" class="space-y-1">
      <div v-for="match in matches" :key="match.id"
        class="text-sm bg-gray-200 px-2 py-1.5 flex justify-between items-center gap-2 rounded">

        <TournamentCategoryGenderBadge v-if="match.tournament && match.tournament.gender"
              :category="match.tournament?.category"
              :gender="match.tournament?.gender"
            />
        
        <RouterLink 
          :to="`/workspace/matches/${match.id}`"
          class="text-blue-600 hover:underline active:underline flex-1 truncate font-medium"
          :title="getMatchLabel(match)">
          {{ getMatchLabel(match) }}
          <span v-if="match.scheduled_at" class="text-[10px] text-gray-500 ml-1 font-normal">
            ({{ formatDateTime(match.scheduled_at) }})
          </span>
        </RouterLink>

        <MatchStatusBadge :status="match.status" :is-live="match.is_public_live" :size="'sm'" />

        <div class="flex gap-2">
          <NavButton
            :icon="MagnifyingGlassIcon"
            :to="`/workspace/matches/${match.id}`"
            size="sm"
            title="Vedi Dettagli"
          />

          <NavButton
            :to="`/match/${match.id}`"
            :icon="ArrowRightIcon"
            color="green"
            size="sm"
            title="Live Match"
          />
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-4 text-gray-500 text-sm italic">
      Nessuna partita recente trovata.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/utils'
import { getLatestMatches } from '@/services/matchService'
import NavButton from './buttons/NavButton.vue'
import TournamentCategoryGenderBadge from './badges/TournamentCategoryGenderBadge.vue'
import MatchStatusBadge from './badges/MatchStatusBadge.vue'
import type { MatchStatus } from '@/enum/MatchStatus'
import type { TournamentGender } from '@/interfaces/Tournament'

export interface Team {
  club_name?: string;
  category_name?: string;
  // Add other team properties as needed
}

export interface Match {
  id: string;
  name: string | null;
  scheduled_at: string;
  home_team?: Team;
  away_team?: Team;
  status: MatchStatus;
  is_public_live: boolean;
  tournament?: {
    id: string;
    name: string;
    category: string;
    gender: TournamentGender;
    season: string;
  };
}

const props = defineProps<{
  limit?: number
}>()

const matches = ref<Match[]>([])
const loading = ref(true)

const getMatchLabel = (match: Match) => {
  return match.name || 
    (match.home_team?.club_name && match.away_team?.club_name 
      ? `${match.home_team.club_name} - ${match.away_team.club_name}` 
      : 'Senza Titolo');
}

const fetchMatches = async () => {
  loading.value = true
  try {
    const res = await getLatestMatches(props.limit)
    if (res.ok) {
      matches.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching latest matches:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMatches)
</script>