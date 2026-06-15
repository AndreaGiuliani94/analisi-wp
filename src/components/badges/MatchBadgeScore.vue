<template>
    <div class="inline-flex items-stretch  rounded-full overflow-hidden " :class="{
        'bg-gray-100': (theme === 'light'),
        'bg-blue-800': (theme === 'dark')
    }">

        <!-- Sigla Casa -->
        <div class="px-2 py-1 text-xs font-bold w-11 text-center tracking-wider truncate rounded-s-full border-y border-l flex items-center justify-center"
            :class="{
                'border-gray-200 text-blue-950': (theme === 'light'),
                'border-blue-800 text-white': (theme === 'dark')
        }">
            {{ abbreviations.home }}
        </div>

        <!-- Punteggio -->
        <div
            class="px-3 py-1  font-black text-sm min-w-14 text-center border-y flex items-center justify-center":class="{
                'border-blue-950 bg-blue-950 text-white': (theme === 'light'),
                'border-gray-100 text-blue-950 bg-gray-100': (theme === 'dark')
        }">
            {{ homeTeam.score ?? 0 }} - {{ awayTeam.score ?? 0 }}
        </div>

        <!-- Sigla Ospite -->
        <div
            class="px-2 py-1 text-xs font-bold w-11 text-center tracking-wider truncate border-y border-r flex items-center justify-center"
            :class="{
                'border-gray-200 text-blue-950': (theme === 'light'),
                'border-blue-800 text-white': (theme === 'dark')
        }">
            {{ abbreviations.away }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 1. Definiamo l'interfaccia minima che serve a questo componente
export interface TeamBadgeData {
  name: string;
  score: number;
  category?: string; // Opzionale, serve solo per risolvere le omonimie
}

// 2. Dichiariamo le props in modo pulito
const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark';
    homeTeam: TeamBadgeData;
    awayTeam: TeamBadgeData;
}>(), {
    theme: 'light',
});

// 3. La logica intelligente per le sigle (isolata e reattiva)
const abbreviations = computed(() => {
  const homeName = (props.homeTeam.name || '').trim();
  const awayName = (props.awayTeam.name || '').trim();

  const cleanHome = homeName.replace(/\s+/g, '').toUpperCase();
  const cleanAway = awayName.replace(/\s+/g, '').toUpperCase();

  let homeAbbr = cleanHome.substring(0, 3);
  let awayAbbr = cleanAway.substring(0, 3);

  // Se c'è una collisione...
  if (homeAbbr === awayAbbr && cleanHome.length > 0) {
    let resolved = false;

    // --- 1° TENTATIVO: Ignora il prefisso (es. RN SORI) ---
    const homeWords = homeName.split(/\s+/);
    const awayWords = awayName.split(/\s+/);

    const getAltAbbr = (words: string[]) => {
      return words.length > 1
        ? words.slice(1).join('').toUpperCase().substring(0, 3)
        : '';
    };

    const altHome = getAltAbbr(homeWords);
    const altAway = getAltAbbr(awayWords);

    if (altHome && altAway && altHome !== altAway) {
      homeAbbr = altHome;
      awayAbbr = altAway;
      resolved = true;
    }

    // --- 2° TENTATIVO: Cerca una lettera diversa nel nome ospite ---
    if (!resolved && cleanAway.length > 3) {
      for (let i = 3; i < cleanAway.length; i++) {
        let candidate = cleanAway.substring(0, 2) + cleanAway[i];
        if (candidate !== homeAbbr) {
          awayAbbr = candidate;
          resolved = true;
          break;
        }
      }
    }

    // --- 3° TENTATIVO: Usa la Categoria (es. U18) ---
    if (!resolved) {
      const catHome = (props.homeTeam.category || '').replace(/\s+/g, '').toUpperCase();
      const catAway = (props.awayTeam.category || '').replace(/\s+/g, '').toUpperCase();

      const catHomeAbbr = catHome.substring(0, 3);
      const catAwayAbbr = catAway.substring(0, 3);

      if (catHomeAbbr && catAwayAbbr && catHomeAbbr !== catAwayAbbr) {
        homeAbbr = catHomeAbbr;
        awayAbbr = catAwayAbbr;
        resolved = true;
      }
    }

    // --- 4° TENTATIVO (Fallback): Squadra A e Squadra B ---
    if (!resolved) {
      const baseDueLettere = cleanHome.substring(0, 2).padEnd(2, 'X'); 
      homeAbbr = baseDueLettere + 'A';
      awayAbbr = baseDueLettere + 'B';
    }
  }

  // Fallback estremo se i nomi erano stringhe vuote
  return {
    home: homeAbbr || '---',
    away: awayAbbr || '---'
  };
});
</script>