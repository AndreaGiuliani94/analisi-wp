<template>
  <div class="group relative bg-white rounded-lg border border-slate-200 py-3 px-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col">
    <!-- Header Card -->
    <div class="flex flex-col mb-3">
      <div class="flex items-center gap-2">
        <TournamentCategoryGenderBadge 
        :category="tournament.category"
        :gender="tournament.gender"
        class="shrink-0"
        />
        <h3 class="text-lg font-bold text-blue-950 truncate pr-2" :title="tournament.name">
          {{ tournament.name }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          {{ tournament.season }}
        </span>
      </div>
    </div>

    <!-- Dettagli centrali: Numero Match -->
    <div class="flex-1 flex items-center mb-6">
      <div class="flex items-center gap-2 text-slate-500">
        <div class="size-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <CalendarDaysIcon class="size-4" />
        </div>
        <span class="font-black text-blue-950 text-xs uppercase tracking-tight">
          {{ tournament.match_count || 0 }} Match Collegati
        </span>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-50">
      <ActionButton 
        class="shrink-0"
        :icon="MagnifyingGlassIcon"
        :solid="false"
        size="sm"
        color="blue"
        :to="`/workspace/tournaments/${tournament.id}`"
        label="Dettagli"
        title="Vedi Dettagli"
      />
      <ActionButton 
        class="shrink-0"
        :icon="TrashIcon"
        :solid="false"
        size="sm"
        color="red"
        label="Elimina"
        title="Elimina Torneo"
        @click="$emit('delete', tournament)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import ActionButton from '@/components/buttons/ActionButton.vue'
import TournamentCategoryGenderBadge from '@/components/badges/TournamentCategoryGenderBadge.vue'
import type { Tournament } from '@/interfaces/Tournament'

defineProps<{
  tournament: Tournament
}>()

defineEmits<{
  (e: 'delete', tournament: Tournament): void
}>()
</script>
