<template>
  <div class="max-w-7xl mx-auto py-8 px-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">Statistiche</h1>
        <p class="text-gray-500 mt-1">Analizza le performance di squadre e giocatori nel tempo.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar: Filtri -->
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-100 font-bold text-blue-950 text-sm uppercase tracking-wider">Filtri</div>
          <div class="p-4 space-y-4">
            <BaseSelect
              v-model="selectedSeason"
              label="Stagione"
              :options="seasonOptions"
              placeholder="Seleziona stagione"
            />
            <BaseSelect
              v-model="selectedTeam"
              label="Squadra"
              :options="teamOptions"
              placeholder="Seleziona squadra"
            />
            <BaseSelect
              v-model="selectedPlayer"
              label="Giocatore"
              :options="playerOptions"
              placeholder="Seleziona giocatore"
              :disabled="!selectedTeam"
            />
          </div>
        </div>
      </div>

      <!-- Main Content: Storico Partite -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-100 font-bold text-blue-950 text-sm uppercase tracking-wider flex items-center gap-2">
            <ClockIcon class="size-4 text-blue-600" />
            Storico Partite
          </div>
          <div v-if="filteredMatches.length === 0" class="p-16 text-center">
            <div class="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon class="size-6" />
            </div>
            <p class="text-gray-400">Nessuna partita trovata con i filtri selezionati.</p>
          </div>
          <div v-else class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
            <div
              v-for="match in filteredMatches"
              :key="match.id"
              class="p-4 hover:bg-blue-50 cursor-pointer transition-colors group flex items-center justify-between"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 font-black border border-blue-100 text-sm shadow-inner shrink-0">
                  {{ match.score.home }}-{{ match.score.away }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-bold text-blue-950 truncate">{{ match.homeTeam }} vs {{ match.awayTeam }}</h3>
                  <p class="text-xs text-gray-500">{{ match.date }} • {{ match.season }}</p>
                </div>
              </div>
              <ChevronRightIcon class="size-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseSelect from '@/components/selects/BaseSelect.vue';
import { ChartBarIcon, ClockIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

// Mock Data
const mockSeasons = [
  { label: 'Tutte le stagioni', value: '' },
  { label: '2023/2024', value: '2023/2024' },
  { label: '2022/2023', value: '2022/2023' },
];

const mockTeams = [
  { label: 'Tutte le squadre', value: '' },
  { label: 'Pro Recco', value: 'Pro Recco' },
  { label: 'AN Brescia', value: 'AN Brescia' },
  { label: 'RN Savona', value: 'RN Savona' },
];

const mockPlayers = [
  { label: 'Tutti i giocatori', value: '' },
  { label: 'Mario Rossi', value: 'Mario Rossi' },
  { label: 'Luca Bianchi', value: 'Luca Bianchi' },
  { label: 'Giulio Verdi', value: 'Giulio Verdi' },
];

const mockMatches = [
  { id: '1', homeTeam: 'Pro Recco', awayTeam: 'AN Brescia', score: { home: 12, away: 8 }, date: '12 Mag 2024', season: '2023/2024', players: ['Mario Rossi', 'Luca Bianchi'] },
  { id: '2', homeTeam: 'RN Savona', awayTeam: 'Pro Recco', score: { home: 7, away: 10 }, date: '05 Mag 2024', season: '2023/2024', players: ['Mario Rossi', 'Giulio Verdi'] },
  { id: '3', homeTeam: 'AN Brescia', awayTeam: 'RN Savona', score: { home: 9, away: 9 }, date: '28 Apr 2024', season: '2023/2024', players: ['Luca Bianchi'] },
  { id: '4', homeTeam: 'Pro Recco', awayTeam: 'Pallanuoto Trieste', score: { home: 15, away: 5 }, date: '21 Apr 2024', season: '2023/2024', players: ['Mario Rossi'] },
  { id: '5', homeTeam: 'Pro Recco', awayTeam: 'AN Brescia', score: { home: 11, away: 11 }, date: '15 Ott 2023', season: '2023/2024', players: ['Mario Rossi', 'Luca Bianchi'] },
  { id: '6', homeTeam: 'RN Savona', awayTeam: 'Pro Recco', score: { home: 8, away: 9 }, date: '08 Ott 2023', season: '2023/2024', players: ['Giulio Verdi'] },
  { id: '7', homeTeam: 'Pro Recco', awayTeam: 'AN Brescia', score: { home: 10, away: 6 }, date: '20 Mag 2023', season: '2022/2023', players: ['Mario Rossi'] },
  { id: '8', homeTeam: 'RN Savona', awayTeam: 'Pro Recco', score: { home: 6, away: 7 }, date: '13 Mag 2023', season: '2022/2023', players: ['Luca Bianchi'] },
];

// Reactive State
const selectedSeason = ref('');
const selectedTeam = ref('');
const selectedPlayer = ref('');

// Options for selects
const seasonOptions = computed(() => mockSeasons);
const teamOptions = computed(() => mockTeams);
const playerOptions = computed(() => {
  // In una vera applicazione, questi sarebbero filtrati in base alla squadra selezionata
  if (selectedTeam.value) {
    // Esempio: filtra i giocatori che hanno giocato per la squadra selezionata
    const playersInSelectedTeam = new Set<string>();
    mockMatches.forEach(match => {
      if (match.homeTeam === selectedTeam.value || match.awayTeam === selectedTeam.value) {
        match.players.forEach(player => playersInSelectedTeam.add(player));
      }
    });
    const filtered = Array.from(playersInSelectedTeam).map(p => ({ label: p, value: p }));
    return [{ label: 'Tutti i giocatori', value: '' }, ...filtered];
  }
  return mockPlayers;
});

// Computed per filtrare le partite
const filteredMatches = computed(() => {
  return mockMatches.filter(match => {
    const bySeason = selectedSeason.value ? match.season === selectedSeason.value : true;
    const byTeam = selectedTeam.value ? (match.homeTeam === selectedTeam.value || match.awayTeam === selectedTeam.value) : true;
    const byPlayer = selectedPlayer.value ? match.players.includes(selectedPlayer.value) : true;
    return bySeason && byTeam && byPlayer;
  });
});
</script>

<style scoped>
/* Stili personalizzati per la scrollbar se necessario */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
